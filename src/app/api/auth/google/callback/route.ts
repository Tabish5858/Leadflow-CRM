import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, saveCalendarTokens } from "@/lib/calendar";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const error = req.nextUrl.searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL("/settings?calendar_error=access_denied", req.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/settings?calendar_error=invalid_request", req.url)
      );
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get("calendar_oauth_state");

    if (!storedState || storedState.value !== state) {
      return NextResponse.redirect(
        new URL("/settings?calendar_error=invalid_state", req.url)
      );
    }

    cookieStore.delete("calendar_oauth_state");

    let userId: string;
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64").toString());
      userId = decoded.userId;
    } catch {
      return NextResponse.redirect(
        new URL("/settings?calendar_error=invalid_state", req.url)
      );
    }

    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.access_token) {
      return NextResponse.redirect(
        new URL("/settings?calendar_error=token_exchange_failed", req.url)
      );
    }

    await saveCalendarTokens(userId, tokens, "");

    return NextResponse.redirect(
      new URL("/settings?calendar_connected=true", req.url)
    );
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/settings?calendar_error=unknown", req.url)
    );
  }
}
