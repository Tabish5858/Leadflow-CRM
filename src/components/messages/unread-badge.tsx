"use client";

import { useEffect, useState } from "react";
import { subscribeToConversations } from "@/lib/firebase/messages";
import type { Conversation } from "@/types";

interface UnreadBadgeProps {
  workspaceId: string;
  userId: string;
}

export function UnreadBadge({ workspaceId, userId }: UnreadBadgeProps) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!workspaceId || !userId) return;

    const unsub = subscribeToConversations(workspaceId, (convs: Conversation[]) => {
      const myConvs = convs.filter((c) => c.participantIds?.includes(userId));
      const count = myConvs.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      setTotal(count);
    });

    return () => unsub();
  }, [workspaceId, userId]);

  if (total === 0) return null;

  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground leading-none">
      {total > 99 ? "99+" : total}
    </span>
  );
}
