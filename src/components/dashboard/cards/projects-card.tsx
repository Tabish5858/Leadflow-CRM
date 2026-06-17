"use client";

import { useRouter } from "next/navigation";
import { FolderKanban, ArrowUpRight } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/contexts/workspace-context";
import { useDashboardProjects } from "@/lib/queries/dashboard-queries";
import { cn, formatCurrency } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  on_hold: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  cancelled: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

export function ProjectsCard() {
  const router = useRouter();
  const { activeWorkspace, user } = useWorkspace();
  const { data: projects = [], isLoading, error } = useDashboardProjects(activeWorkspace?.id, user?.id);

  return (
    <DashboardCard
      id="projects"
      title="My Projects"
      description="Projects you're part of"
      loading={isLoading}
      headerAction={
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => router.push("/projects")}
        >
          View All
        </Button>
      }
    >
      {error ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-destructive">{error?.message}</p>
        </div>
      ) : projects.length === 0 && !isLoading ? (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FolderKanban className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">No projects yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              You haven&apos;t been added to any projects.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => router.push("/projects")}>
            Browse Projects
          </Button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group/item flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <FolderKanban className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{project.name}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 px-1.5 py-0 text-[10px] font-medium capitalize",
                      STATUS_COLORS[project.status] ?? ""
                    )}
                  >
                    {project.status?.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {project.budget ? `${formatCurrency(project.budget)}` : ""}
                  {project.budget && project.dueDate ? " · " : ""}
                  {project.dueDate?.toDate
                    ? `Due ${formatDistanceToNow(project.dueDate.toDate(), { addSuffix: true })}`
                    : ""}
                </p>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/item:opacity-60" />
            </div>
          ))}
          {projects.length >= 6 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => router.push("/projects")}
            >
              View all projects
            </Button>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
