"use client";

import { useState, useEffect } from "react";
import { Calendar, DollarSign, User, ChevronDown } from "lucide-react";
import type { Project, ProjectStatus, WorkspaceMember } from "@/types";

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  active: { label: "Active", class: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" },
  on_hold: { label: "On Hold", class: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" },
  completed: { label: "Completed", class: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" },
  cancelled: { label: "Cancelled", class: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" },
};

interface ProjectInfoCardProps {
  project: Project;
  memberMap: Map<string, { displayName: string; photoURL?: string | null }>;
  onStatusChange?: (newStatus: ProjectStatus) => void;
}

export default function ProjectInfoCard({ project, memberMap, onStatusChange }: ProjectInfoCardProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const clientNames = project.clients
    .map((cid) => memberMap.get(cid)?.displayName)
    .filter(Boolean)
    .join(", ");

  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!project.dueDate) { setDaysLeft(null); return; }
    setDaysLeft(Math.ceil((project.dueDate.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }, [project.dueDate]);

  const handleStatusChange = (newStatus: ProjectStatus) => {
    if (newStatus === project.status) return;
    setShowStatusMenu(false);
    onStatusChange?.(newStatus);
  };

  return (
    <div
      style={{ borderRadius: "8px" }}
      className="flex flex-col p-5 w-full bg-card border border-border hover:border-foreground/20 transition-colors"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">Project Info</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Status with dropdown */}
        <div className="relative">
          <p className="text-xs text-muted-foreground">Status</p>
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="flex items-center gap-1.5 text-sm font-medium text-foreground capitalize hover:text-primary transition-colors mt-0.5"
          >
            <span className={`inline-block w-2 h-2 rounded-full ${
              project.status === "active" ? "bg-green-500" :
              project.status === "on_hold" ? "bg-amber-500" :
              project.status === "completed" ? "bg-blue-500" :
              "bg-red-500"
            }`} />
            {project.status.replace("_", " ")}
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
          {showStatusMenu && (
            <div className="absolute left-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg z-50 py-1 min-w-[140px]">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => handleStatusChange(key as ProjectStatus)}
                  className={`w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-accent ${
                    key === project.status ? "font-medium text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    key === "active" ? "bg-green-500" :
                    key === "on_hold" ? "bg-amber-500" :
                    key === "completed" ? "bg-blue-500" :
                    "bg-red-500"
                  }`} />
                  {cfg.label}
                </button>
              ))}
            </div>
          )}
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
