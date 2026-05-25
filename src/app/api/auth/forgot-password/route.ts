import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

const RESET_TOKENS_COLLECTION = "password_reset_tokens";

/**
 * POST /api/auth/forgot-password
 *
 * Generates a self-managed password reset token, stores it in Firestore
 * with a 1-hour expiry, and sends a branded email via Resend containing
 * a link to our own /reset-password page.
 *
 * No Firebase email action handler involved — the email comes from our
 * own domain via Resend, so it won't land in spam.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find the user by email in Firebase Auth (Admin SDK)
    // so we can verify the account exists
    let uid: string | null = null;
    try {
      const { getAuth } = await import("firebase-admin/auth");
      // Ensure Admin SDK is initialized (it's already in getAdminDb but auth needs separate init)
      const { getApps, initializeApp, cert } = await import("firebase-admin/app");

      if (!process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
        return NextResponse.json(
          { error: "Password reset is not configured on this server" },
          { status: 500 }
        );
      }

      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n");
      const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;

      if (getApps().length === 0) {
        initializeApp({
          projectId,
          credential: cert({
            projectId,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey,
          }),
        });
      }

      const auth = getAuth();
      const userRecord = await auth.getUserByEmail(normalizedEmail);
      uid = userRecord.uid;
    } catch (err: unknown) {
      // If user not found in Firebase Auth, still send a generic response
      // to avoid revealing whether the email exists (security best practice)
      console.warn("Password reset requested for non-existent or error email:", (err instanceof Error ? err.message : "unknown"));
    }

    // Generate a secure random token
    const crypto = await import("node:crypto");
    const token = crypto.randomBytes(32).toString("hex");

    // Store in Firestore with expiry (1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await getAdminDb().collection(RESET_TOKENS_COLLECTION).add({
      email: normalizedEmail,
      uid,
      token,
      used: false,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });

    // Build reset link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")
      || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Build branded HTML email
    const appName = process.env.NEXT_PUBLIC_APP_NAME || "LeadFlow";
    const fromEmail = process.env.FROM_EMAIL || "noreply@leadflow.app";
    const fromName = process.env.FROM_NAME || "LeadFlow CRM";

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
<tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
<tr><td style="padding:40px 40px 20px;text-align:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);">
<h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">${appName}</h1>
</td></tr>
<tr><td style="padding:32px 40px;">
<h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a;">Reset your password</h2>
<p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.5;">
We received a request to reset the password for your <strong>${appName}</strong> account associated with <strong>${normalizedEmail}</strong>.
</p>
<table role="presentation" cellpadding="0" cellspacing="0">
<tr><td align="center" style="border-radius:8px;background:#667eea;">
<a href="${resetUrl}" style="display:inline-block;padding:12px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">Reset Password</a>
</td></tr>
</table>
<p style="margin:24px 0 0;font-size:13px;color:#999;line-height:1.4;">
If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
</p>
<hr style="margin:24px 0;border:none;border-top:1px solid #eee;">
<p style="margin:0;font-size:12px;color:#aaa;">
This link expires in 1 hour. If the button doesn't work, copy and paste this URL into your browser:<br>
<a href="${resetUrl}" style="color:#667eea;word-break:break-all;">${resetUrl}</a>
</p>
</td></tr>
<tr><td style="padding:16px 40px;text-align:center;background:#fafafa;border-top:1px solid #eee;">
<p style="margin:0;font-size:12px;color:#aaa;">
${appName} &mdash; Open-source CRM
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    // Send via Resend
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email sending is not configured. Contact your administrator." },
        { status: 500 }
      );
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: normalizedEmail,
      subject: `Reset your ${appName} password`,
      html,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    // Always return success even if user doesn't exist (security — don't reveal account existence)
    return NextResponse.json({
      success: true,
      sentBy: "resend",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to send reset email. Please try again later." },
      { status: 500 }
    );
  }
}
