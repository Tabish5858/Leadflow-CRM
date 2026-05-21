import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { logEmailEvent } from "@/lib/email-tracking";

const EMAILS_COLLECTION = "emails";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ emailId: string }> }
) {
  try {
    const { emailId } = await params;
    const urlParam = req.nextUrl.searchParams.get("url");

    if (!urlParam) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const targetUrl = decodeURIComponent(urlParam);

    const emailRef = doc(db, EMAILS_COLLECTION, emailId);
    const emailSnap = await getDoc(emailRef);

    if (emailSnap.exists()) {
      const emailData = emailSnap.data();

      await logEmailEvent({
        emailId,
        leadId: emailData.leadId,
        workspaceId: emailData.workspaceId,
        type: "click",
        url: targetUrl,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      });
    }

    return NextResponse.redirect(targetUrl, 302);
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
}
