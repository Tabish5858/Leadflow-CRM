"use client";

import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, User } from "lucide-react";
import type { Project, WorkspaceMember } from "@/types";

interface ProjectInfoCardProps {
  project: Project;
  memberMap: Map<string, { displayName: string; photoURL?: string | null }>;
}

export default function ProjectInfoCard({ project, memberMap }: ProjectInfoCardProps) {
  const clientNames = project.clients
    .map((cid) => memberMap.get(cid)?.displayName)
    .filter(Boolean)
    .join(", ");

  const daysLeft = project.dueDate
    ? Math.ceil((project.dueDate.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      style={{ borderRadius: "8px" }}
      className="flex flex-col p-5 w-full bg-card border border-border hover:border-foreground/20 transition-colors"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">Project Info</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Status */}
        <div>
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="text-sm font-medium text-foreground capitalize">{project.status.replace("_", " ")}</p>
        </div>

        {/* Priority */}
        <div>
          <p className="text-xs text-muted-foreground">Priority</p>
          <p className="text-sm font-medium text-foreground capitalize">{project.priority || "none"}</p>
        </div>

        {/* Client */}
        <div className="col-span-2">
          <p className="text-xs text-muted-foreground">Client</p>
          <p className="text-sm font-medium text-foreground truncate">{clientNames || "No client"}</p>
        </div>

        {/* Budget */}
        {project.budget && (
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">Budget</p>
            <p className="text-sm font-medium text-foreground">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: project.currency,
              }).format(project.budget)}
            </p>
          </div>
        )}

        {/* Start / Due */}
        {project.startDate && (
          <div>
            <p className="text-xs text-muted-foreground">Start Date</p>
            <p className="text-sm font-medium text-foreground">
              {project.startDate.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
        )}
        {project.dueDate && (
          <div>
            <p className="text-xs text-muted-foreground">Due Date</p>
            <p className={`text-sm font-medium ${daysLeft !== null && daysLeft < 0 ? "text-destructive" : "text-foreground"}`}>
              {project.dueDate.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
        )}

        {/* Days left */}
        {daysLeft !== null && (
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">Days Left</p>
            <p className={`text-sm font-medium ${daysLeft < 0 ? "text-destructive" : daysLeft <= 3 ? "text-amber-600" : "text-foreground"}`}>
              {daysLeft < 0 ? `${Math.abs(daysLeft)} day(s) overdue` : daysLeft === 0 ? "Due today" : `Due in ${daysLeft} day(s)`}
            </p>
          </div>
        )}

        {/* Description */}
        {project.description && (
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">Description</p>
            <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
