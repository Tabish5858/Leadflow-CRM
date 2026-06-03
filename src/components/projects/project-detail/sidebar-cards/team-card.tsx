"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Plus } from "lucide-react";
import type { WorkspaceMember } from "@/types";

interface TeamCardProps {
  members: WorkspaceMember[];
  memberIds: string[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TeamCard({ members, memberIds }: TeamCardProps) {
  const teamMembers = members.filter((m) => memberIds.includes(m.userId));

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
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {teamMembers.length}
        </span>
      </div>

      <div className="space-y-2">
        {teamMembers.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">
            No team members assigned
          </p>
        ) : (
          teamMembers.map((member) => (
            <div key={member.userId} className="flex items-center gap-2.5">
              <Avatar className="h-7 w-7 border">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                  {getInitials(member.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">
                  {member.displayName}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {member.email}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
