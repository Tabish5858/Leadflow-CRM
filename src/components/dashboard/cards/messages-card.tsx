"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, ArrowUpRight } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/workspace-context";
import { getConversations } from "@/lib/firebase/messages";
import type { Conversation } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function MessagesCard() {
  const router = useRouter();
  const { activeWorkspace, user } = useWorkspace();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeWorkspace?.id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getConversations(activeWorkspace.id);
        if (!cancelled) setConversations(data.slice(0, 6));
      } catch (err) {
        if (!cancelled) setError("Failed to load conversations");
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [activeWorkspace?.id]);

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);

  return (
    <DashboardCard
      id="messages"
      title="Messages"
      description={
        totalUnread > 0
          ? `${totalUnread} unread across ${conversations.length} conversations`
          : "Recent conversations"
      }
      loading={loading}
      headerAction={
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => router.push("/messages")}
        >
          Open All
        </Button>
      }
    >
      {error ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : conversations.length === 0 && !loading ? (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <MessageSquare className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start a conversation with a lead or team member.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => router.push("/messages")}>
            Start Messaging
          </Button>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map((conv) => {
            // Check if current user is a participant
            const isParticipant = user?.id
              ? conv.participantIds?.includes(user.id)
              : false;

            // Resolve display name: group > lead > other participant's name
            const resolveName = (): string => {
              if (conv.groupName) return conv.groupName;
              if (conv.leadName) return conv.leadName;
              if (user?.id && conv.participantIds?.length && conv.participantNames?.length) {
                const otherIdx = conv.participantIds.findIndex((id) => id !== user.id);
                if (otherIdx >= 0 && conv.participantNames[otherIdx]) {
                  return conv.participantNames[otherIdx];
                }
              }
              return conv.participantNames?.[0] || "Conversation";
            };
            const displayName = resolveName();
            const initials = displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

            return (
              <div
                key={conv.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50",
                  !isParticipant && "opacity-70"
                )}
                onClick={() => router.push(`/messages/${conv.id}`)}
              >
                {/* Avatar with initials */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">
                      {displayName}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">
                    {conv.lastMessage || "No messages"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/60">
                    {conv.lastMessageAt?.toDate
                      ? formatDistanceToNow(conv.lastMessageAt.toDate(), { addSuffix: true })
                      : ""}
                  </p>
                </div>

                <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60" />
              </div>
            );
          })}
          {conversations.length >= 6 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => router.push("/messages")}
            >
              View all conversations
            </Button>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
