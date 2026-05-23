"use client";

import { useEffect, useState } from "react";
import { subscribeToLeadActivities } from "@/lib/firebase/activities";
import type { Activity } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  StickyNote,
  ArrowRightLeft,
  Plus,
  Clock,
  FileText,
  Trash2,
  CheckCircle,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  call: <Phone className="h-3.5 w-3.5" />,
  email: <Mail className="h-3.5 w-3.5" />,
  meeting: <Calendar className="h-3.5 w-3.5" />,
  message: <MessageSquare className="h-3.5 w-3.5" />,
  note: <StickyNote className="h-3.5 w-3.5" />,
  status_change: <ArrowRightLeft className="h-3.5 w-3.5" />,
  task: <Clock className="h-3.5 w-3.5" />,
  system: <Clock className="h-3.5 w-3.5" />,
  document_uploaded: <FileText className="h-3.5 w-3.5" />,
  document_deleted: <Trash2 className="h-3.5 w-3.5" />,
  task_created: <Plus className="h-3.5 w-3.5" />,
  task_completed: <CheckCircle className="h-3.5 w-3.5" />,
  lead_created: <UserPlus className="h-3.5 w-3.5" />,
  lead_updated: <ArrowRightLeft className="h-3.5 w-3.5" />,
};

const ACTIVITY_COLORS: Record<string, string> = {
  call: "bg-blue-500",
  email: "bg-purple-500",
  meeting: "bg-green-500",
  message: "bg-orange-500",
  note: "bg-yellow-500",
  status_change: "bg-gray-500",
  task: "bg-cyan-500",
  system: "bg-gray-400",
  document_uploaded: "bg-emerald-500",
  document_deleted: "bg-red-500",
  task_created: "bg-blue-500",
  task_completed: "bg-green-500",
  lead_created: "bg-indigo-500",
  lead_updated: "bg-amber-500",
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupActivitiesByDate(activities: Activity[]): Record<string, Activity[]> {
  const groups: Record<string, Activity[]> = {};
  for (const activity of activities) {
    const date = activity.createdAt?.toDate().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }) || "Unknown";
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
  }
  return groups;
}

interface ActivityTimelineProps {
  leadId: string;
  userId: string;
  userName: string;
}

export function ActivityTimeline({ leadId, userId, userName: _userName }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToLeadActivities(leadId, (acts) => {
      setActivities(acts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [leadId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const grouped = groupActivitiesByDate(activities);
  const dates = Object.keys(grouped);

  return (
    <div className="space-y-4">
      {/* Timeline */}
      {dates.length === 0 ? (
        <div className="py-8 text-center">
          <StickyNote className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No activities yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {dates.map((date, dateIndex) => (
            <div key={date}>
              <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {date}
              </h4>
              <div className="space-y-0">
                {grouped[date].map((activity, actIndex) => {
                  const isLast =
                    actIndex === grouped[date].length - 1 &&
                    dateIndex === dates.length - 1;
                  return (
                    <div key={activity.id} className="flex gap-3">
                      {/* Timeline line */}
                      <div className="relative flex flex-col items-center">
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white",
                            ACTIVITY_COLORS[activity.type] || "bg-gray-500"
                          )}
                        >
                          {ACTIVITY_ICONS[activity.type] || (
                            <Clock className="h-3.5 w-3.5" />
                          )}
                        </div>
                        {!isLast && (
                          <div className="absolute left-1/2 top-8 h-full w-px -translate-x-1/2 bg-border" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {activity.subject}
                          </p>
                          {activity.duration && (
                            <Badge variant="secondary" className="text-xs">
                              {activity.duration}m
                            </Badge>
                          )}
                          {activity.direction && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {activity.direction}
                            </Badge>
                          )}
                        </div>
                        {activity.body && (
                          <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                            {activity.body}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {activity.createdAt
                            ? formatRelativeTime(activity.createdAt.toDate())
                            : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
