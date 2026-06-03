"use client";

import { useState } from "react";
import type { ProjectTask, ProjectMilestone, WorkspaceMember } from "@/types";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/projects/shared/task-card";
import {
  Plus,
  List,
  Columns,
  Flag,
  Diamond,
  Package,
  FileText,
  Info,
  Eye,
  EyeOff,
  GripVertical,
  MoreHorizontal,
  Trash2,
  Copy,
  CheckCircle2,
  Send,
  Loader2,
} from "lucide-react";

// ─── Section Action Button ────────────────────────────────────────────────────

const ITEM_ICONS: Record<string, React.ReactNode> = {
  task: <div className="w-4 h-4 rounded-full border-2 border-[#202020]" />,
  milestone: <Diamond className="h-4 w-4 text-[#202020]" />,
  deliverable: <Package className="h-4 w-4 text-[#202020]" />,
};

function SectionActionButton({
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}: {
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (!secondaryLabel) {
    return (
      <button onClick={onPrimary}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
      >
        <Plus className="h-4 w-4" /> {primaryLabel}
      </button>
    );
  }

  return (
    <div className="relative flex items-center">
      <button onClick={onPrimary}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-black text-white rounded-l-md hover:bg-gray-800 transition-colors border-r border-white/20"
      >
        <Plus className="h-4 w-4" /> {primaryLabel}
      </button>
      <button onClick={() => setOpen(!open)}
        className="px-2 py-2 text-sm font-medium bg-black text-white rounded-r-md hover:bg-gray-800 transition-colors"
      >
        <svg className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
          <button onClick={() => { setOpen(false); onSecondary?.(); }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
          >
            {ITEM_ICONS[secondaryLabel?.toLowerCase() || ""] || <Plus className="h-4 w-4" />}
            <span>Add {secondaryLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── WorkflowSection Component ─────────────────────────────────────────────────

interface WorkflowSectionProps {
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  memberMap: Map<string, { displayName: string; photoURL?: string | null }>;
  onToggleTaskComplete: (task: ProjectTask) => void;
  onTaskStatusChange: (task: ProjectTask, newStatus: { parent: string; name: string; color: string }) => void;
  onDeleteTask: (task: ProjectTask) => void;
  onAddTask: () => void;
  onAddMilestone: () => void;
  getSubtasks: (parentId: string) => ProjectTask[];
  expandedTasks: Set<string>;
  onToggleSubtaskExpand: (task: ProjectTask) => void;
}

export default function WorkflowSection({
  tasks,
  milestones,
  memberMap,
  onToggleTaskComplete,
  onTaskStatusChange,
  onDeleteTask,
  onAddTask,
  onAddMilestone,
  getSubtasks,
  expandedTasks,
  onToggleSubtaskExpand,
}: WorkflowSectionProps) {
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const topLevelTasks = tasks.filter((t) => !t.parentTaskId && !t.isSubtask);
  const completedTasks = tasks.filter((t) => t.status.parent === "Complete").length;

  return (
    <div className="space-y-4">
      {/* ─── Tasks & Milestones Section ─── */}
      <div className="workflow-section">
        <div className="border border-border hover:border-black rounded-lg bg-card transition-colors">
          {/* Section Header */}
          <div className="px-5 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-[#202020]">Tasks & Milestones</h3>
                  </div>
                  <p className="text-xs text-gray-500">Track progress through project phases</p>
                </div>
                {/* List/Board toggle */}
                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                  <button onClick={() => setViewMode("list")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      viewMode === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <List className="h-3.5 w-3.5 inline mr-1" /> List
                  </button>
                  <button onClick={() => setViewMode("board")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      viewMode === "board" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Columns className="h-3.5 w-3.5 inline mr-1" /> Board
                  </button>
                </div>
              </div>
              <SectionActionButton
                primaryLabel="Add Task"
                secondaryLabel="Milestone"
                onPrimary={onAddTask}
                onSecondary={onAddMilestone}
              />
            </div>
          </div>

          {/* Section Content */}
          <div className="px-5 pb-4">
            {viewMode === "board" ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <Columns className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>Kanban board view</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Milestones first */}
                {milestones.map((ms) => (
                  <div key={ms.id} className="flex items-start gap-2.5 p-2 rounded-md hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button className="mt-0.5 shrink-0 cursor-pointer hover:opacity-80" title={ms.status === "Completed" ? "Mark incomplete" : "Mark complete"}>
                        {ms.status === "Completed" ? (
                          <div className="w-5 h-5 rounded-sm bg-[#060606] flex items-center justify-center">
                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                          </div>
                        ) : (
                          <Diamond className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-semibold text-[#202020]">{ms.milestoneName}</span>
                        {ms.description && <p className="text-xs text-gray-500 truncate">{ms.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {ms.dueDate && (
                        <span className="text-xs text-gray-500">
                          {ms.dueDate.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        ms.status === "Completed" ? "bg-green-100 text-green-700" :
                        ms.status === "Failed" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {ms.status}
                      </span>
                      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all">
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Tasks */}
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
                          onStatusChange={onTaskStatusChange}
                          onDelete={onDeleteTask}
                          showSubtasks={isExpanded}
                          onToggleSubtasks={onToggleSubtaskExpand}
                        />
                        {isExpanded && subtasks.length > 0 && (
                          <div className="mt-1.5 space-y-1.5 pl-5 ml-8 border-l-2 border-gray-200">
                            {subtasks.map((sub) => (
                              <TaskCard key={sub.id} task={sub} memberMap={memberMap} onToggleComplete={onToggleTaskComplete} onStatusChange={onTaskStatusChange} onDelete={onDeleteTask} isSubtask />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : milestones.length === 0 ? (
                  <div className="flex items-center justify-center py-6">
                    <button onClick={onAddTask}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="font-medium">Add Task</span>
                    </button>
                  </div>
                ) : null}

                {/* Bottom Add Task button */}
                {topLevelTasks.length > 0 && (
                  <button onClick={onAddTask}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="font-medium">Add Task</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Progress Summary ─── */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
        <span>{tasks.length} task{tasks.length !== 1 ? "s" : ""}</span>
        <span className="text-muted-foreground/30">|</span>
        <span>{completedTasks} complete</span>
        <span className="text-muted-foreground/30">|</span>
        <span>{milestones.length} milestone{milestones.length !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}
