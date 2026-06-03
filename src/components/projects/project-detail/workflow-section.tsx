"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListTodo, Flag, Plus } from "lucide-react";
import type { ProjectTask, ProjectMilestone, WorkspaceMember } from "@/types";
import { TaskCard } from "@/components/projects/shared/task-card";

interface WorkflowSectionProps {
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  memberMap: Map<string, { displayName: string; photoURL?: string | null }>;
  onToggleTaskComplete: (task: ProjectTask) => void;
  onDeleteTask: (task: ProjectTask) => void;
  onAddTask: () => void;
  getSubtasks: (parentId: string) => ProjectTask[];
  expandedTasks: Set<string>;
  onToggleSubtaskExpand: (task: ProjectTask) => void;
}

export default function WorkflowSection({
  tasks,
  milestones,
  memberMap,
  onToggleTaskComplete,
  onDeleteTask,
  onAddTask,
  getSubtasks,
  expandedTasks,
  onToggleSubtaskExpand,
}: WorkflowSectionProps) {
  const topLevelTasks = tasks.filter((t) => !t.parentTaskId && !t.isSubtask);
  const completedTasks = tasks.filter((t) => t.status.parent === "Complete").length;

  return (
    <div className="space-y-6">
      {/* Tasks & Milestones section header */}
      <div>
        <h3 className="text-base font-semibold text-foreground">Tasks & Milestones</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Track progress through project phases. {completedTasks}/{tasks.length} tasks complete.
        </p>
      </div>

      {/* Milestone cards */}
      {milestones.length > 0 && (
        <div className="space-y-2">
          {milestones.map((ms) => (
            <Card key={ms.id} className="border border-border hover:border-foreground/20 transition-colors">
              <CardContent className="p-3 flex items-center gap-3">
                <Flag className={`h-4 w-4 shrink-0 ${ms.status === "Completed" ? "text-green-600" : ms.status === "Failed" ? "text-red-600" : "text-amber-600"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{ms.milestoneName}</p>
                  {ms.description && (
                    <p className="text-xs text-muted-foreground truncate">{ms.description}</p>
                  )}
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  ms.status === "Completed" ? "bg-green-100 text-green-700" :
                  ms.status === "Failed" ? "bg-red-100 text-red-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {ms.status}
                </span>
                {ms.dueDate && (
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {ms.dueDate.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Task list */}
      <div className="space-y-1.5">
        {topLevelTasks.length > 0 ? (
          topLevelTasks.map((task) => {
            const subtasks = getSubtasks(task.id);
            const isExpanded = expandedTasks.has(task.id);
            return (
              <div key={task.id}>
                <TaskCard
                  task={task}
                  memberMap={memberMap}
                  onToggleComplete={onToggleTaskComplete}
                  onDelete={onDeleteTask}
                  showSubtasks={isExpanded}
                  onToggleSubtasks={onToggleSubtaskExpand}
                />
                {isExpanded && subtasks.length > 0 && (
                  <div className="mt-1 space-y-1 pl-4 border-l-2 border-muted ml-6">
                    {subtasks.map((sub) => (
                      <TaskCard
                        key={sub.id}
                        task={sub}
                        memberMap={memberMap}
                        onToggleComplete={onToggleTaskComplete}
                        onDelete={onDeleteTask}
                        isSubtask
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 border border-dashed border-border rounded-lg">
            <ListTodo className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No tasks yet</p>
          </div>
        )}
      </div>

      {/* Add task button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onAddTask}
        className="w-full border-dashed gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Task
      </Button>
    </div>
  );
}
