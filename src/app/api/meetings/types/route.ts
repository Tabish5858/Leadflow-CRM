import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api/middleware";
import {
  createMeetingType,
  getMeetingTypes,
} from "@/lib/firebase/meeting-types";

export async function GET(req: NextRequest) {
  return withAuth(req, async (ctx) => {
    try {
      const types = await getMeetingTypes(ctx.workspaceId);
      return NextResponse.json({ types });
    } catch (error) {
      console.error("Failed to list meeting types:", error);
      return NextResponse.json(
        { error: "Failed to list meeting types" },
        { status: 500 }
      );
    }
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (ctx) => {
    try {
      const body = await req.json();
      const { name, duration, bufferTime, videoTool, description, availability } = body;

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }

      if (!duration || typeof duration !== "number" || duration < 15 || duration > 480) {
        return NextResponse.json(
          { error: "Duration must be between 15 and 480 minutes" },
          { status: 400 }
        );
      }

      const id = await createMeetingType({
        workspaceId: ctx.workspaceId,
        name: name.trim(),
        duration: Math.max(15, Math.min(480, duration)),
        bufferTime: Math.max(0, bufferTime || 0),
        videoTool: videoTool === "none" ? "none" : "google_meet",
        description: typeof description === "string" ? description : "",
        active: true,
        createdBy: ctx.userId,
        availability: availability || undefined,
      });

      return NextResponse.json({ success: true, id });
    } catch (error) {
      console.error("Failed to create meeting type:", error);
      return NextResponse.json(
        { error: "Failed to create meeting type" },
        { status: 500 }
      );
    }
  });
}
