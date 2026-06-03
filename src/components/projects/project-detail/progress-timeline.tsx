"use client";

import { CheckCircle2 } from "lucide-react";

interface ProgressTimelineProps {
  progress: number;
  tasksCompleted: number;
  tasksTotal: number;
}

export default function ProgressTimeline({ progress, tasksCompleted, tasksTotal }: ProgressTimelineProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Progress</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{tasksCompleted}/{tasksTotal} tasks</span>
          <span className="font-semibold text-foreground">{progress}%</span>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
