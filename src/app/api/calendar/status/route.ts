import { NextRequest, NextResponse } from "next/server";
import { getCalendarConnectionStatus } from "@/lib/calendar";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const status = await getCalendarConnectionStatus(userId);

    return NextResponse.json(status);
  } catch (error) {
    console.error("Failed to check calendar status:", error);
    return NextResponse.json(
      { connected: false, email: null, error: "Failed to check connection status" },
      { status: 500 }
    );
  }
}
