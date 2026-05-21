import { NextRequest, NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/calendar";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const state = Buffer.from(JSON.stringify({ userId })).toString("base64");

    const cookieStore = await cookies();
    cookieStore.set("calendar_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10,
      path: "/",
      sameSite: "lax",
    });

    const authUrl = getAuthUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Google OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth flow" },
      { status: 500 }
    );
  }
}
