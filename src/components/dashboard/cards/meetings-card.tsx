"use client";

import { useRouter } from "next/navigation";
import { Calendar, Clock, Video, ArrowUpRight } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/workspace-context";
import { useDashboardMeetings } from "@/lib/queries/dashboard-queries";
import type { Meeting } from "@/types";
import { format } from "date-fns";

export function MeetingsCard() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();
  const { data: meetings = [], isLoading, error } = useDashboardMeetings(activeWorkspace?.id);

  const formatMeetingTime = (meeting: Meeting): string => {
    if (!meeting.startTime?.toDate) return "";
    const start = meeting.startTime.toDate();
    const end = meeting.endTime?.toDate();
    const dateStr = format(start, "MMM d");
    const timeStr = format(start, "h:mm a");
    if (end) {
      return `${dateStr} · ${timeStr} - ${format(end, "h:mm a")}`;
    }
    return `${dateStr} · ${timeStr}`;
  };

  return (
    <DashboardCard
      id="meetings"
      title="Upcoming Meetings"
      description="Scheduled meetings"
      loading={isLoading}
      headerAction={
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => router.push("/meetings")}
        >
          View All
        </Button>
      }
    >
      {error ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-destructive">{error?.message}</p>
        </div>
      ) : meetings.length === 0 && !isLoading ? (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">No upcoming meetings</p>
            <p className="text-xs text-muted-foreground mt-1">
              You have no meetings scheduled. Schedule one to get started.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => router.push("/meetings")}>
            Schedule Meeting
          </Button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="group/item flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
              onClick={() => router.push(`/meetings/${meeting.id}`)}
            >
              {/* Date indicator */}
              <div className="flex shrink-0 flex-col items-center rounded-lg border px-2.5 py-1.5 min-w-[48px]">
                {meeting.startTime?.toDate ? (
                  <>
                    <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                      {format(meeting.startTime.toDate(), "MMM")}
                    </span>
                    <span className="text-sm font-bold leading-tight">
                      {format(meeting.startTime.toDate(), "d")}
                    </span>
                  </>
                ) : (
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-snug">
                  {meeting.title}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span className="truncate">{formatMeetingTime(meeting)}</span>
                </div>
                {meeting.googleMeetLink && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400">
                    <Video className="h-3 w-3" />
                    <span className="truncate">Google Meet</span>
                  </div>
                )}
                {meeting.attendees && meeting.attendees.length > 0 && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                    {meeting.attendees.map((a) => a.name).join(", ")}
                  </p>
                )}
              </div>

              <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/item:opacity-60" />
            </div>
          ))}
          {meetings.length >= 6 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => router.push("/meetings")}
            >
              View all meetings
            </Button>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
