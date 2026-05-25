import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api/middleware";
import { getAdminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { renderInviteEmail } from "@/lib/email-templates";

const INVITES_COLLECTION = "workspace_invites";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/**
 * POST /api/workspaces/invite
 *
 * Creates a workspace invite and sends an invitation email.
 * Uses Admin SDK (server-side) so Firestore writes bypass ad-blockers.
 *
 * Headers: x-user-id, x-workspace-id
 * Body: { email: string, role: "admin" | "member" | "viewer" }
 */
export async function POST(req: NextRequest) {
  return withAuth(req, async (ctx) => {
    try {
      const body = await req.json();
      const { email, role } = body;

      if (!email || typeof email !== "string" || !email.includes("@")) {
        return NextResponse.json(
          { error: "A valid email address is required" },
          { status: 400 }
        );
      }

      const inviteRole: "admin" | "member" | "viewer" =
        role === "admin" ? "admin" : role === "viewer" ? "viewer" : "member";

      // Create invite document via Admin SDK (server-side, no ad-blocker)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const inviteDoc = await getAdminDb().collection(INVITES_COLLECTION).add({
        workspaceId: ctx.workspaceId,
        email: email.toLowerCase().trim(),
        invitedBy: ctx.userId,
        role: inviteRole,
        status: "pending",
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: Timestamp.now(),
      });
      const inviteId = inviteDoc.id;

      // Get workspace name for the email
      const workspaceSnap = await getAdminDb()
        .collection("workspaces")
        .doc(ctx.workspaceId)
        .get();
      const workspaceName = (workspaceSnap.data() as { name?: string })?.name || "Unknown Workspace";

      // Get inviter name
      const userSnap = await getAdminDb()
        .collection("users")
        .doc(ctx.userId)
        .get();
      const userData = userSnap.data() as { displayName?: string } | null;
      const inviterName = userData?.displayName || "A team member";

      const baseUrl = getBaseUrl();
      const acceptUrl = `${baseUrl}/invite/accept?inviteId=${inviteId}`;
      const html = renderInviteEmail({
        inviterName,
        workspaceName,
        inviteRole,
        acceptUrl,
      });

      // Try to send email via Resend (non-blocking — invite is already created)
      let emailSent = false;
      if (process.env.RESEND_API_KEY) {
        try {
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);
          const result = await resend.emails.send({
            from: `${process.env.FROM_NAME || "LeadFlow CRM"} <${process.env.FROM_EMAIL || "noreply@leadflow.app"}>`,
            to: email.toLowerCase().trim(),
            subject: `Join ${workspaceName} on LeadFlow CRM`,
            html,
          });

          if (result.error) {
            console.error("Resend error:", result.error);
          } else {
            emailSent = true;
          }
        } catch (err) {
          console.error("Failed to send invite email:", err);
        }
      } else {
        console.warn("RESEND_API_KEY not configured — invite created without email");
      }

      return NextResponse.json({
        success: true,
        inviteId,
        emailSent,
      });
    } catch (error) {
      console.error("Invite error:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to invite member" },
        { status: 500 }
      );
    }
  });
}
