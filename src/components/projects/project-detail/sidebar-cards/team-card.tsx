"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Plus, Trash2, ChevronDown, X } from "lucide-react";
import type { WorkspaceMember } from "@/types";
import { updateProject } from "@/lib/firebase/projects";
import { toast } from "@/lib/toast";

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

interface TeamCardProps {
  projectId: string;
  members: WorkspaceMember[];
  memberIds: string[];
  onMembersChange?: (memberIds: string[]) => void;
}

export default function TeamCard({ projectId, members, memberIds, onMembersChange }: TeamCardProps) {
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showAddDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowAddDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showAddDropdown]);

  const teamMembers = members.filter((m) => memberIds.includes(m.userId));
  const availableMembers = members.filter((m) => !memberIds.includes(m.userId));

  const canEdit = !!onMembersChange;

  const handleAddMember = async (userId: string) => {
    if (!onMembersChange) return;
    const newIds = [...memberIds, userId];
    // Optimistic update
    onMembersChange(newIds);
    setShowAddDropdown(false);
    setSaving(true);
    try {
      await updateProject(projectId, { memberIds: newIds });
      toast.success("Member added");
    } catch {
      toast.error("Failed to add member");
      onMembersChange(memberIds); // Rollback
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!onMembersChange) return;
    if (!confirm("Remove this member from the project?")) return;
    const newIds = memberIds.filter((id) => id !== userId);
    // Optimistic update
    onMembersChange(newIds);
    setSaving(true);
    try {
      await updateProject(projectId, { memberIds: newIds });
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
      onMembersChange(memberIds); // Rollback
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{ borderRadius: "8px" }}
      className="flex flex-col p-5 w-full bg-card border border-border hover:border-foreground/20 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Team</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {teamMembers.length}
          </span>
          {canEdit && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowAddDropdown(!showAddDropdown)}
              className="h-6 w-6 rounded-full border border-border bg-card flex items-center justify-center hover:bg-accent"
              title="Add member"
            >
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            {showAddDropdown && (
              <div className="absolute right-0 top-8 bg-popover border border-border rounded-md shadow-lg z-50 py-1 min-w-[200px] max-h-[250px] overflow-y-auto">
                {availableMembers.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-muted-foreground">No members available</p>
                ) : (
                  availableMembers.map((m) => (
                    <button
                      key={m.userId}
                      onClick={() => handleAddMember(m.userId)}
                      disabled={saving}
                      className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-accent disabled:opacity-50"
                    >
                      <Avatar className="h-6 w-6 border">
                        <AvatarFallback className="bg-primary/10 text-primary text-[8px]">
                          {getInitials(m.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{m.displayName}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{m.email}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {teamMembers.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">No team members assigned</p>
        ) : (
          teamMembers.map((member) => (
            <div key={member.userId} className="flex items-center gap-2.5 group pr-1">
              <Avatar className="h-7 w-7 border shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                  {getInitials(member.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{member.displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
              </div>
              {canEdit && (
              <button
                onClick={() => handleRemoveMember(member.userId)}
                className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded hover:bg-destructive/10 transition-opacity shrink-0"
                title="Remove member"
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
