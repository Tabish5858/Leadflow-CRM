"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit3, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Project } from "@/types";

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  active: { label: "Active", class: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" },
  on_hold: { label: "On Hold", class: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" },
  completed: { label: "Completed", class: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" },
  cancelled: { label: "Cancelled", class: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" },
};

interface ProjectHeaderProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProjectHeader({ project, onEdit, onDelete }: ProjectHeaderProps) {
  const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.active;

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight truncate">{project.name}</h1>
            <Badge variant="outline" className={statusCfg.class}>
              {statusCfg.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Created {formatDate(project.createdAt?.toDate() ?? null)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="icon" className="text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatDate(date: Date | null): string {
  if (!date) return "Unknown";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
