"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useWorkspace } from "@/contexts/workspace-context";
import type { Notification } from "@/types";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  Users,
  AlertCircle,
  MessageSquare,
  Zap,
  Info,
} from "lucide-react";

const NOTIFICATION_ICONS: Record<string, typeof Bell> = {
  follow_up_due: Calendar,
  lead_assigned: Users,
  task_due: AlertCircle,
  mention: MessageSquare,
  automation_triggered: Zap,
  system: Info,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  follow_up_due: "text-orange-500",
  lead_assigned: "text-blue-500",
  task_due: "text-red-500",
  mention: "text-purple-500",
  automation_triggered: "text-green-500",
  system: "text-muted-foreground",
};

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NotificationBell() {
  const { user, activeWorkspace } = useWorkspace();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = user?.id;

  // ── Subscribe to notifications ──────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    let unsub: (() => void) | undefined;

    import("@/lib/firebase/notifications").then(({ subscribeToNotifications }) => {
      unsub = subscribeToNotifications(
        userId,
        (data) => {
          setNotifications(data);
          setLoading(false);
        },
        () => {
          setLoading(false);
        }
      );
    });

    return () => {
      unsub?.();
    };
  }, [userId]);

  // ── Unread count ────────────────────────────────────────────────
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // ── Mark as read ────────────────────────────────────────────────
  const handleMarkAsRead = useCallback(async (id: string) => {
    const { markAsRead } = await import("@/lib/firebase/notifications");
    await markAsRead(id);
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!userId) return;
    const { markAllAsRead } = await import("@/lib/firebase/notifications");
    await markAllAsRead(userId);
  }, [userId]);

  const handleDelete = useCallback(async (id: string) => {
    const { deleteNotification } = await import("@/lib/firebase/notifications");
    await deleteNotification(id);
  }, []);

  // ── Render ──────────────────────────────────────────────────────
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center text-[10px] px-1"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <Separator />

        {/* Notification list */}
        <div className="h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 50).map((notification) => {
                const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
                const iconColor =
                  NOTIFICATION_COLORS[notification.type] || "text-muted-foreground";
                const createdAt = notification.createdAt?.toDate?.();

                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                    onClick={() => {
                      if (!notification.read) handleMarkAsRead(notification.id);
                    }}
                  >
                    <div className={`mt-0.5 ${iconColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      {createdAt && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {timeAgo(createdAt)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
