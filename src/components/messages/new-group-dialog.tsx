"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Loader2, Users } from "lucide-react";
import { getWorkspaceMembers } from "@/lib/firebase/workspaces";
import { getInitials } from "@/lib/utils";
import type { WorkspaceMember } from "@/types";

interface NewGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  currentUserId: string;
  currentUserName: string;
  onCreateGroup: (name: string, members: WorkspaceMember[]) => Promise<void>;
}

export function NewGroupDialog({
  open,
  onOpenChange,
  workspaceId,
  currentUserId,
  currentUserName,
  onCreateGroup,
}: NewGroupDialogProps) {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open || !workspaceId) return;
    setLoading(true);
    setError(null);
    setSelectedIds(new Set());
    setGroupName("");

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

  const toggleMember = (userId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const selectedMembers = members.filter((m) => selectedIds.has(m.userId));

  const handleCreate = async () => {
    if (selectedMembers.length === 0) return;
    setCreating(true);
    try {
      const name =
        groupName.trim() ||
        selectedMembers
          .map((m) => m.displayName.split(" ")[0])
          .join(", ");
      await onCreateGroup(name, selectedMembers);
      onOpenChange(false);
    } catch {
      // Error handled by parent via toast
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Group Chat</DialogTitle>
          <DialogDescription>
            Select members to add to the group conversation.
          </DialogDescription>
        </DialogHeader>

        {/* Group name */}
        <div className="space-y-1.5">
          <Input
            placeholder="Group name (optional)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {selectedMembers.length > 0
              ? groupName.trim()
                ? `${selectedMembers.length} member${selectedMembers.length > 1 ? "s" : ""} selected`
                : `Default name: ${selectedMembers.map((m) => m.displayName.split(" ")[0]).join(", ")}`
              : "Select at least one member"}
          </p>
        </div>

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
        <div className="max-h-[280px] overflow-y-auto -mx-6 px-6">
          {loading ? (
            <div className="space-y-2 py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
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
                const isSelected = selectedIds.has(member.userId);

                return (
                  <button
                    key={member.userId}
                    type="button"
                    onClick={() => toggleMember(member.userId)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60"
                  >
                    <Checkbox checked={isSelected} className="shrink-0" />
                    <Avatar className="h-8 w-8 border shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
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
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={selectedMembers.length === 0 || creating}
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              `Create Group${selectedMembers.length > 1 ? ` (${selectedMembers.length})` : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
