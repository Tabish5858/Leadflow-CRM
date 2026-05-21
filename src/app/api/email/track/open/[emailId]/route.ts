import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { logEmailEvent, getTrackingPixelGif } from "@/lib/email-tracking";

const EMAILS_COLLECTION = "emails";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ emailId: string }> }
) {
  try {
    const { emailId } = await params;

    const emailRef = doc(db, EMAILS_COLLECTION, emailId);
    const emailSnap = await getDoc(emailRef);

    if (!emailSnap.exists()) {
      return new NextResponse(getTrackingPixelGif(), {
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    const emailData = emailSnap.data();

    await logEmailEvent({
      emailId,
      leadId: emailData.leadId,
      workspaceId: emailData.workspaceId,
      type: "open",
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return new NextResponse(getTrackingPixelGif(), {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch {
    return new NextResponse(getTrackingPixelGif(), {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }
}
