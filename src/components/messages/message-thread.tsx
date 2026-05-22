"use client";

import { useRef, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Message } from "@/types";

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  loading: boolean;
  error: string | null;
}

export function MessageThread({
  messages,
  currentUserId,
  loading,
  error,
}: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Loading State ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
          >
            <Skeleton className={`h-16 rounded-lg ${i % 2 === 0 ? "w-3/4" : "w-3/4"}`} />
          </div>
        ))}
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <p className="mt-3 text-sm font-medium text-destructive">
          Failed to load messages
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

  // ─── Empty State ────────────────────────────────────────────────────────

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center">
        <div className="max-w-xs space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">
            No messages yet
          </p>
          <p className="text-xs text-muted-foreground">
            Start the conversation by sending a message below.
          </p>
        </div>
      </div>
    );
  }

  // ─── Messages ───────────────────────────────────────────────────────────

  return (
    <div className="flex-1 space-y-1 overflow-y-auto p-4">
      {messages.map((msg, idx) => {
        const isOwn = msg.senderId === currentUserId;
        const isFirstInGroup =
          idx === 0 || messages[idx - 1].senderId !== msg.senderId;
        const isLastInGroup =
          idx === messages.length - 1 ||
          messages[idx + 1].senderId !== msg.senderId;

        return (
          <div
            key={msg.id}
            className={`flex ${isOwn ? "justify-end" : "justify-start"} ${
              isFirstInGroup ? "pt-1" : "pt-0.5"
            } ${isLastInGroup ? "pb-1" : "pb-0.5"}`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-3.5 py-2 ${
                isOwn
                  ? "bg-primary text-primary-foreground rounded-br-lg"
                  : "bg-muted rounded-bl-lg"
              }`}
            >
              {!isOwn && isFirstInGroup && (
                <p className="mb-1 text-[11px] font-semibold leading-tight opacity-80">
                  {msg.senderName}
                </p>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {msg.body}
              </p>
              {isLastInGroup && (
                <p
                  className={`mt-1 text-right text-[10px] leading-none opacity-70 ${
                    isOwn ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {msg.createdAt?.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
