import { NextRequest, NextResponse } from "next/server";
import { createCalendarEvent, getUpcomingEvents, disconnectCalendar, getCalendarConnectionStatus } from "@/lib/calendar";
import { getLead } from "@/lib/firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, leadId, followUpDate } = body;

    if (!userId || !leadId || !followUpDate) {
      return NextResponse.json(
        { error: "userId, leadId, and followUpDate are required" },
        { status: 400 }
      );
    }

    const lead = await getLead(leadId);

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    const event = await createCalendarEvent(userId, lead, new Date(followUpDate));

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Create calendar event error:", error);
    const message = error instanceof Error ? error.message : "Failed to create calendar event";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const maxResults = parseInt(req.nextUrl.searchParams.get("maxResults") || "5", 10);

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const status = await getCalendarConnectionStatus(userId);

    if (!status.connected) {
      return NextResponse.json(
        { error: "Google Calendar not connected", connected: false },
        { status: 401 }
      );
    }

    const events = await getUpcomingEvents(userId, maxResults);

    return NextResponse.json({ events, connected: true, email: status.email });
  } catch (error) {
    console.error("Get upcoming events error:", error);
    const message = error instanceof Error ? error.message : "Failed to get upcoming events";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    await disconnectCalendar(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Disconnect calendar error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect calendar" },
      { status: 500 }
    );
  }
}
