"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Clock, ListTodo, AlertCircle, CalendarDays } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/workspace-context";
import { useDashboardTasks } from "@/lib/queries/dashboard-queries";
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
  const { data: tasks = [], isLoading, error } = useDashboardTasks(activeWorkspace?.id, user?.id);

  return (
    <DashboardCard
      id="tasks"
      title="My Tasks"
      description="Tasks assigned to you"
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
      ) : tasks.length === 0 && !isLoading ? (
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
