"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientUser } from "@/contexts/client-user-context";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase/client";
import type { Conversation } from "@/types";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Loader2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClientConversation {
  id: string;
  participantIds: string[];
  participantNames: string[];
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

interface ClientMessage {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: Date | null;
  pending?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMessageTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (days === 1) return "Yesterday";
  if (days < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatMessageDate(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Conversation List ───────────────────────────────────────────────────────

function ConversationList({
  conversations,
  selectedId,
  userId,
  onSelect,
}: {
  conversations: ClientConversation[];
  selectedId: string | null;
  userId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-1">
      {conversations.map((conv) => {
        const otherNames = conv.participantNames.filter(
          (_, i) => conv.participantIds[i] !== userId
        );
        const displayName = otherNames.join(", ") || "Team";
        const initial = displayName.charAt(0).toUpperCase();
        const isSelected = conv.id === selectedId;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
              isSelected
                ? "bg-primary/10"
                : "hover:bg-accent/50"
            )}
          >
            <Avatar className="h-9 w-9 border shrink-0">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatMessageTime(conv.lastMessageAt)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {conv.lastMessage || "No messages yet"}
              </p>
            </div>
            {conv.unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground shrink-0">
                {conv.unreadCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Message Thread ──────────────────────────────────────────────────────────

function MessageThread({
  conversationId,
  userId,
  displayName,
  onBack,
}: {
  conversationId: string;
  userId: string;
  displayName: string;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Real-time message subscription
  useEffect(() => {
    const msgsRef = collection(db, "messages");
    const q = query(
      msgsRef,
      where("conversationId", "==", conversationId),
      orderBy("createdAt", "asc"),
      limit(200)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const msgs: ClientMessage[] = [];
        snap.forEach((d) => {
          const data = d.data();
          msgs.push({
            id: d.id,
            senderId: data.senderId || "",
            senderName: data.senderName || "Unknown",
            body: data.body || "",
            createdAt: (data.createdAt as Timestamp)?.toDate() ?? null,
          });
        });
        setMessages(msgs);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [conversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark conversation as read
  useEffect(() => {
    const convRef = doc(db, "conversations", conversationId);
    updateDoc(convRef, { unreadCount: 0 }).catch(() => {});
  }, [conversationId]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setSending(true);

    // Optimistic: add temp message
    const tempMsg: ClientMessage = {
      id: `temp_${Date.now()}`,
      senderId: userId,
      senderName: displayName,
      body: text,
      createdAt: new Date(),
      pending: true,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const msgsRef = collection(db, "messages");
      const docRef = await addDoc(msgsRef, {
        conversationId,
        workspaceId: "", // Will be set by the actual query context
        senderId: userId,
        senderName: displayName,
        body: text,
        deleted: false,
        edited: false,
        readBy: [userId],
        createdAt: serverTimestamp(),
      });

      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMsg.id ? { ...m, id: docRef.id, pending: false } : m))
      );

      // Update conversation's lastMessage
      const convRef = doc(db, "conversations", conversationId);
      updateDoc(convRef, {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
      }).catch(() => {});
    } catch {
      // Rollback: remove temp message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, sending, userId, displayName, conversationId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: ClientMessage[] }[] = [];
  let currentGroup: { date: string; messages: ClientMessage[] } | null = null;

  for (const msg of messages) {
    if (!msg.createdAt) continue;
    const dateKey = msg.createdAt.toDateString();
    if (!currentGroup || currentGroup.date !== dateKey) {
      currentGroup = { date: dateKey, messages: [] };
      groupedMessages.push(currentGroup);
    }
    currentGroup.messages.push(msg);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Thread header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-sm font-semibold">Messages</h2>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}
              >
                <Skeleton className={cn("h-12 w-3/4 rounded-lg")} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              No messages yet. Send a message to start the conversation!
            </p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              <div className="flex items-center justify-center mb-4">
                <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                  {formatMessageDate(new Date(group.date))}
                </span>
              </div>
              {group.messages.map((msg) => {
                const isMe = msg.senderId === userId;
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex mb-3",
                      isMe ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md",
                        msg.pending && "opacity-60"
                      )}
                    >
                      {!isMe && (
                        <p className="text-[10px] font-medium mb-1 opacity-70">
                          {msg.senderName}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                      <div
                        className={cn(
                          "flex items-center justify-end gap-1 mt-1",
                          isMe ? "text-primary-foreground/60" : "text-muted-foreground/60"
                        )}
                      >
                        <span className="text-[10px]">
                          {msg.createdAt
                            ? msg.createdAt.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                        {msg.pending && <Loader2 className="h-3 w-3 animate-spin" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="shrink-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ClientMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clientWorkspaceId, uid, displayName } = useClientUser();

  const [conversations, setConversations] = useState<ClientConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const conversationId = searchParams.get("conversation");

  // Fetch conversations where client is a participant
  useEffect(() => {
    if (!clientWorkspaceId || !uid) return;

    (async () => {
      try {
        const convRef = collection(db, "conversations");
        const q = query(
          convRef,
          where("workspaceId", "==", clientWorkspaceId),
          orderBy("lastMessageAt", "desc"),
          limit(50)
        );
        const snap = await getDocs(q);

        const filtered = snap.docs
          .map((d) => {
            const data = d.data() as Conversation;
            return {
              id: d.id,
              participantIds: data.participantIds || [],
              participantNames: data.participantNames || [],
              lastMessage: data.lastMessage || "",
              lastMessageAt: (data.lastMessageAt as Timestamp)?.toDate() ?? new Date(),
              unreadCount: data.unreadCount || 0,
            };
          })
          .filter((c) => c.participantIds.includes(uid));

        setConversations(filtered);
      } catch {
        setConversations([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [clientWorkspaceId, uid]);

  const selectConversation = useCallback(
    (id: string) => {
      router.push(`/client/messages?conversation=${id}`);
    },
    [router]
  );

  const goBackToList = useCallback(() => {
    router.push("/client/messages");
  }, [router]);

  return (
    <div className="h-[calc(100vh-8rem)] -m-4 sm:-m-6">
      <div className="flex h-full">
        {/* Conversation sidebar — hidden on mobile when a conversation is selected */}
        <div
          className={cn(
            "w-full lg:w-80 lg:border-r flex flex-col",
            conversationId && "hidden lg:flex"
          )}
        >
          <div className="border-b px-4 py-3">
            <h1 className="text-lg font-bold">Messages</h1>
            <p className="text-xs text-muted-foreground">
              {loading
                ? "Loading..."
                : `${conversations.length} conversation${conversations.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="space-y-3 p-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No conversations yet
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  When a team member messages you, it will appear here.
                </p>
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                selectedId={conversationId}
                userId={uid}
                onSelect={selectConversation}
              />
            )}
          </div>
        </div>

        {/* Message thread */}
        <div
          className={cn(
            "flex-1 flex flex-col",
            !conversationId && "hidden lg:flex"
          )}
        >
          {conversationId ? (
            <MessageThread
              conversationId={conversationId}
              userId={uid}
              displayName={displayName}
              onBack={goBackToList}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <MessageSquare className="h-16 w-16 text-muted-foreground/20 mb-4" />
              <h2 className="text-lg font-semibold text-muted-foreground">
                Select a conversation
              </h2>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Choose a conversation from the list to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
