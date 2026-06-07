"use client";

import { Package, ChevronRight } from "lucide-react";
import type { Project } from "@/types";

interface FinalPackageBannerProps {
  project: Project;
  onClick?: () => void;
}

export function FinalPackageBanner({ project, onClick }: FinalPackageBannerProps) {
  if (!project.hasFinalPackage && !project.showFinalPackageBanner) return null;

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 border-border hover:bg-accent/30 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
          <Package className="h-5 w-5 text-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {project.hasFinalPackage ? "Your final project deliverables are ready" : "Final Package"}
          </p>
          {project.finalPackageDeliveredAt && (
            <p className="text-xs text-muted-foreground">
              Delivered {new Date(project.finalPackageDeliveredAt.seconds * 1000).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
  );
}
