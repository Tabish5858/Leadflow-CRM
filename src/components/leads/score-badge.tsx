"use client";

import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getScoreColor } from "@/lib/lead-scoring";
import type { ScoreBreakdown } from "@/lib/lead-scoring";

interface ScoreBadgeProps {
  score: number;
  breakdown: ScoreBreakdown;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-xs px-1.5 py-0 min-w-[2rem] justify-center",
  md: "text-sm px-2 py-0.5 min-w-[2.5rem] justify-center",
  lg: "text-base px-2.5 py-1 min-w-[3rem] justify-center",
};

export function ScoreBadge({ score, breakdown, size = "md" }: ScoreBadgeProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          className={cn(
            "cursor-pointer font-bold border",
            getScoreColor(score),
            sizeClasses[size]
          )}
        >
          {score}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" side="top" align="center">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">Lead Score</p>
            <Badge
              className={cn(
                "font-bold border",
                getScoreColor(score),
                sizeClasses.sm
              )}
            >
              {score}/100
            </Badge>
          </div>
          <div className="space-y-1.5">
            <ScoreRow label="Deal Value" value={breakdown.dealValue} max={25} />
            <ScoreRow label="Last Activity" value={breakdown.lastActivity} max={20} />
            <ScoreRow label="Pipeline Stage" value={breakdown.pipelineStage} max={20} />
            <ScoreRow label="Email Engagement" value={breakdown.emailEngagement} max={20} />
            <ScoreRow label="Has Notes" value={breakdown.hasNotes} max={15} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ScoreRow({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = (value / max) * 100;
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="font-medium w-8 text-right tabular-nums">
          {value}/{max}
        </span>
      </div>
    </div>
  );
}
