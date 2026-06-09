"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Loader2, Users } from "lucide-react";
import { getWorkspaceMembers } from "@/lib/firebase/workspaces";
import { getInitials } from "@/lib/utils";
import type { WorkspaceMember } from "@/types";

interface NewMemberConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  currentUserId: string;
  onCreateConversation: (member: WorkspaceMember) => Promise<void>;
}

export function NewMemberConversationDialog({
  open,
  onOpenChange,
  workspaceId,
  currentUserId,
  onCreateConversation,
}: NewMemberConversationDialogProps) {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [creatingId, setCreatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !workspaceId) return;

    setLoading(true);
    setError(null);

    getWorkspaceMembers(workspaceId)
      .then((m) => setMembers(m.filter((m) => m.userId !== currentUserId)))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load members");
      })
      .finally(() => setLoading(false));
  }, [open, workspaceId, currentUserId]);

  const filteredMembers = members.filter(
    (m) =>
      m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (member: WorkspaceMember) => {
    setCreatingId(member.userId);
    try {
      await onCreateConversation(member);
      onOpenChange(false);
    } catch {
      // Error handled by parent via toast
    } finally {
      setCreatingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message Team Member</DialogTitle>
          <DialogDescription>
            Start a direct conversation with a workspace member.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
            autoFocus
          />
        </div>

        {/* Content */}
        <div className="max-h-[320px] overflow-y-auto -mx-6 px-6">
          {loading ? (
            <div className="space-y-2 py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-sm font-medium text-destructive">
                Failed to load members
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{error}</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery
                  ? "No members match your search."
                  : "No other members in this workspace."}
              </p>
            </div>
          ) : (
            <div className="space-y-px py-2">
              {filteredMembers.map((member) => {
                const isCreating = creatingId === member.userId;

                return (
                  <button
                    key={member.userId}
                    onClick={() => handleCreate(member)}
                    disabled={!!creatingId}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60 disabled:opacity-60"
                  >
                    <Avatar className="h-9 w-9 border shrink-0">
                      <AvatarImage src={member.photoURL || undefined} />
                      <AvatarFallback className="text-xs bg-amber-500/10 text-amber-600">
                        {getInitials(member.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {member.displayName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                    {isCreating && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
