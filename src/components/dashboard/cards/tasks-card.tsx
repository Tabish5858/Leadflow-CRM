"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Clock, ListTodo, AlertCircle, CalendarDays } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/workspace-context";
import { getProjectTasks } from "@/lib/firebase/project-tasks";
import { getProjects } from "@/lib/firebase/projects";
import type { ProjectTask } from "@/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isPast, isToday } from "date-fns";

/** Get the status dot color for a task */
function getStatusColor(status: string): string {
  switch (status) {
    case "Complete":
      return "text-emerald-500";
    case "In Progress":
      return "text-blue-500";
    case "On Hold":
      return "text-amber-500";
    default:
      return "text-muted-foreground";
  }
}

/** Get status icon */
function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "Complete":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "In Progress":
      return <Clock className="h-4 w-4 text-blue-500" />;
    case "On Hold":
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground/50" />;
  }
}

/** Format due date with color coding */
function DueDate({ dueDate }: { dueDate?: { seconds: number } | null }) {
  if (!dueDate) return null;
  const date = new Date(dueDate.seconds * 1000);
  const past = isPast(date) && !isToday(date);
  const today = isToday(date);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] shrink-0",
        past && "text-red-500 font-medium",
        today && "text-amber-500 font-medium",
        !past && !today && "text-muted-foreground"
      )}
    >
      <CalendarDays className="h-3 w-3" />
      {past ? "Overdue" : today ? "Today" : formatDistanceToNow(date, { addSuffix: true })}
    </span>
  );
}

export function TasksCard() {
  const router = useRouter();
  const { activeWorkspace, user } = useWorkspace();
  const [tasks, setTasks] = useState<(ProjectTask & { projectName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeWorkspace?.id || !user?.id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user's projects (limit to 20 to keep N+1 bounded)
        const projects = await getProjects(activeWorkspace.id, { max: 20 });
        const userProjects = projects.filter(
          (p) => p.memberIds?.includes(user.id) && p.status === "active"
        );

        // Get tasks from each project and filter by assignee
        const allTasks: (ProjectTask & { projectName?: string })[] = [];
        await Promise.all(
          userProjects.map(async (project) => {
            try {
              const projectTasks = await getProjectTasks(project.id);
              const assigned = projectTasks.filter(
                (t) =>
                  t.assigneeId === user.id &&
                  !t.isDeleted &&
                  t.status?.parent !== "Complete"
              );
              assigned.forEach((t) => {
                allTasks.push({ ...t, projectName: project.name });
              });
            } catch {
              // Skip projects we can't read
            }
          })
        );

      // Sort: by priority (urgent > high > medium > low), then by dueDate
      const priorityOrder: Record<string, number> = {
        urgent: 0,
        high: 1,
        medium: 2,
        low: 3,
      };
      allTasks.sort((a, b) => {
        const pa = priorityOrder[a.priority ?? "low"] ?? 3;
        const pb = priorityOrder[b.priority ?? "low"] ?? 3;
        if (pa !== pb) return pa - pb;
        if (a.dueDate && b.dueDate) return a.dueDate.seconds - b.dueDate.seconds;
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return 0;
      });

      if (!cancelled) setTasks(allTasks.slice(0, 8));
    } catch (err) {
      if (!cancelled) setError("Failed to load tasks");
      console.error(err);
    } finally {
      if (!cancelled) setLoading(false);
    }
  })();

  return () => { cancelled = true; };
}, [activeWorkspace?.id, user?.id]);

  return (
    <DashboardCard
      id="tasks"
      title="My Tasks"
      description="Tasks assigned to you"
      loading={loading}
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
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : tasks.length === 0 && !loading ? (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ListTodo className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">
              No tasks assigned to you right now.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => router.push("/projects")}>
            Browse Projects
          </Button>
        </div>
      ) : (
        <div className="space-y-0.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 transition-colors hover:bg-muted/50"
              onClick={() => router.push(`/projects/${task.projectId}`)}
            >
              <div className="shrink-0">
                <StatusIcon status={task.status?.parent ?? ""} />
              </div>
              <p className="text-sm font-medium truncate min-w-0 flex-1">
                {task.taskName}
              </p>
              {task.priority && task.priority !== "medium" && (
                <span
                  className={cn(
                    "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase",
                    task.priority === "urgent" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                    task.priority === "high" && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                    task.priority === "low" && "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  )}
                >
                  {task.priority}
                </span>
              )}
              <DueDate dueDate={task.dueDate} />
            </div>
          ))}
          {tasks.length >= 8 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => router.push("/projects")}
            >
              View all tasks
            </Button>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
