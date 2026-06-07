"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ProjectTask, ProjectTaskStatus, TaskFile } from "@/types";
import { updateTask, deleteTask, createTask, getProjectTasks } from "@/lib/firebase/project-tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { getApiAuthHeaders } from "@/lib/api/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  User,
  Trash2,
  Loader2,
  Upload,
  FileText,
  Image,
  File,
  Eye,
  Download,
  X,
  CheckCircle2,
  Circle,
  Plus,
  GripVertical,
  MoreHorizontal,
  Globe,
  Lock,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ─── Status Config ──────────────────────────────────────────────────────────

const STATUS_OPTIONS: ProjectTaskStatus[] = [
  { parent: "To Do", name: "Not Started", color: "#DDDDDD" },
  { parent: "In Progress", name: "In Progress", color: "#CFE6F5" },
  { parent: "Complete", name: "Complete", color: "#D1F5CF" },
  { parent: "On Hold", name: "On Hold", color: "#FFE0B2" },
];

const COLOR_MAPPING: Record<string, string> = {
  "#DDDDDD": "#5B5B5B",
  "#CFE6F5": "#003180",
  "#D1F5CF": "#008000",
  "#FFE0B2": "#803A00",
};

function getStatusStyle(color: string) {
  const upper = color.toUpperCase();
  if (COLOR_MAPPING[upper]) return { backgroundColor: color, color: COLOR_MAPPING[upper] };
  return { backgroundColor: color, color: "#374151" };
}

function parseDate(dueDate: unknown): Date | null {
  if (!dueDate) return null;
  if (typeof (dueDate as Record<string, unknown>).toDate === "function") return (dueDate as { toDate: () => Date }).toDate();
  if (typeof dueDate === "object" && "seconds" in (dueDate as Record<string, unknown>)) return new Date((dueDate as { seconds: number }).seconds * 1000);
  if (typeof dueDate === "string") { const d = new Date(dueDate); return isNaN(d.getTime()) ? null : d; }
  if (dueDate instanceof Date) return dueDate;
  return null;
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <Image className="h-4 w-4" />;
  if (mimeType === "application/pdf") return <FileText className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
}

// ─── Rich Text Editor (Simple) ─────────────────────────────────────────────

function RichTextEditor({ value, onChange, readOnly, placeholder }: {
  value: string;
  onChange: (val: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className={cn(
      "rounded-lg border transition-colors",
      isFocused ? "border-foreground/30" : "border-border",
      readOnly ? "bg-muted/20" : "bg-background"
    )}>
      {!readOnly && (
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-muted/20 rounded-t-lg">
          <button
            type="button"
            onClick={() => {
              const el = textareaRef.current;
              if (!el) return;
              const start = el.selectionStart;
              const end = el.selectionEnd;
              const text = value;
              const newText = text.substring(0, start) + "**" + text.substring(start, end) + "**" + text.substring(end);
              onChange(newText);
            }}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground text-xs font-bold"
            title="Bold"
          >B</button>
          <button
            type="button"
            onClick={() => {
              const el = textareaRef.current;
              if (!el) return;
              const start = el.selectionStart;
              const end = el.selectionEnd;
              const text = value;
              const newText = text.substring(0, start) + "_" + text.substring(start, end) + "_" + text.substring(end);
              onChange(newText);
            }}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground text-xs italic"
            title="Italic"
          >I</button>
          <button
            type="button"
            onClick={() => {
              const el = textareaRef.current;
              if (!el) return;
              const start = el.selectionStart;
              const end = el.selectionEnd;
              const text = value;
              const prefix = "- ";
              const lines = text.substring(start, end).split("\n");
              const newLines = lines.map((l: string) => l.startsWith("- ") ? l.substring(2) : prefix + l);
              const newText = text.substring(0, start) + newLines.join("\n") + text.substring(end);
              onChange(newText);
            }}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground text-xs"
            title="Bullet List"
          >≡</button>
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        readOnly={readOnly}
        placeholder={placeholder || "Write your description here..."}
        className={cn(
          "w-full resize-none bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none min-h-[100px]",
          readOnly && "cursor-default"
        )}
      />
    </div>
  );
}

// ─── File Item ─────────────────────────────────────────────────────────────

function FileItem({ file, onDelete, readOnly }: { file: TaskFile; onDelete?: () => void; readOnly?: boolean }) {
  return (
    <div className="group relative flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:bg-accent/30 transition-colors">
      <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
        {getFileIcon(file.fileType)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{file.originalName}</p>
        <p className="text-[10px] text-muted-foreground">{file.fileType} · {formatFileSize(file.fileSize)}</p>
      </div>
      <div className="flex items-center gap-1">
        <a
          href={file.cloudinaryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground"
          title="View file"
        >
          <Eye className="h-3.5 w-3.5" />
        </a>
        {!readOnly && onDelete && (
          <button
            onClick={onDelete}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            title="Remove file"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Subtask Item ──────────────────────────────────────────────────────────

function SubtaskItem({ task, memberMap, onToggle, onDelete }: {
  task: ProjectTask;
  memberMap: Map<string, { displayName: string; photoURL?: string | null }>;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const isComplete = task.status.parent === "Complete";
  const assignee = task.assigneeId ? memberMap.get(task.assigneeId) : null;

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-accent/30 group transition-colors">
      <button onClick={onToggle} className="shrink-0">
        {isComplete ? (
          <CheckCircle2 className="h-4 w-4 text-foreground" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      <span className={cn("flex-1 text-sm min-w-0 truncate", isComplete && "line-through text-muted-foreground")}>
        {task.taskName}
      </span>
      {assignee && (
        <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center shrink-0" title={assignee.displayName}>
          <span className="text-[8px] font-medium text-foreground">{getInitials(assignee.displayName)}</span>
        </div>
      )}
      {task.dueDate && (
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatDate(parseDate(task.dueDate))}</span>
      )}
      <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={getStatusStyle(task.status.color)}>
        {task.status.name}
      </span>
      <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

interface TaskDetailModalProps {
  task: ProjectTask;
  projectId: string;
  workspaceId: string;
  userId: string;
  members: Array<{ userId: string; displayName: string; email: string; photoURL?: string | null }>;
  memberMap: Map<string, { displayName: string; photoURL?: string | null }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated?: () => void;
  readOnly?: boolean;
}

export function TaskDetailModal({
  task: initialTask,
  projectId,
  workspaceId,
  userId,
  members,
  memberMap,
  open,
  onOpenChange,
  onTaskUpdated,
  readOnly,
}: TaskDetailModalProps) {
  const [task, setTask] = useState<ProjectTask>(initialTask);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  // Subtask creation
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState("");
  const [creatingSubtask, setCreatingSubtask] = useState(false);

  // All subtasks for this task
  const [subtasks, setSubtasks] = useState<ProjectTask[]>([]);

  const loadSubtasks = useCallback(async () => {
    if (!task.hasSubtasks) return;
    try {
      const { getSubtasks } = await import("@/lib/firebase/project-tasks");
      const data = await getSubtasks(task.id);
      setSubtasks(data);
    } catch { /* ignore */ }
  }, [task.id, task.hasSubtasks]);

  useEffect(() => { if (open) { setTask(initialTask); loadSubtasks(); } }, [open, initialTask, loadSubtasks]);
  useEffect(() => { if (isEditingTitle && titleRef.current) { titleRef.current.focus(); titleRef.current.select(); } }, [isEditingTitle]);

  // ─── File Upload ───────────────────────────────────────────────────────

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploadedFiles: TaskFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("workspaceId", workspaceId);
        formData.append("projectId", projectId);
        formData.append("taskId", task.id);

        const headers = await getApiAuthHeaders();
        const res = await fetch("/api/deliverables/upload-file", {
          method: "POST",
          headers: { ...headers, "x-upload-context": "task" },
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();

        const taskFile: TaskFile = {
          id: `tf-${Date.now()}-${i}`,
          fileName: data.fileName || data.publicId || `file-${Date.now()}`,
          originalName: file.name,
          fileType: file.type,
          fileSize: file.size,
          cloudinaryUrl: data.cloudinaryUrl || data.url || data.secureUrl || "",
          uploadedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as import("firebase/firestore").Timestamp,
          uploadedBy: userId,
        };
        uploadedFiles.push(taskFile);
      }

      const updatedFiles = [...(task.files || []), ...uploadedFiles];
      await updateTask(task.id, { files: updatedFiles });
      setTask((prev) => ({ ...prev, files: updatedFiles }));
      toast.success(`${uploadedFiles.length} file(s) uploaded`);
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    const updatedFiles = (task.files || []).filter((f) => f.id !== fileId);
    try {
      await updateTask(task.id, { files: updatedFiles });
      setTask((prev) => ({ ...prev, files: updatedFiles }));
      toast.success("File removed");
    } catch {
      toast.error("Failed to remove file");
    }
  };

  // ─── Field Updates ─────────────────────────────────────────────────────

  const updateField = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      await updateTask(task.id, data);
      setTask((prev) => ({ ...prev, ...data }));
      onTaskUpdated?.();
    } catch {
      toast.error("Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = (value: string) => {
    const opt = STATUS_OPTIONS.find((s) => s.name === value);
    if (opt) updateField({ status: opt });
  };

  const handleAssigneeChange = (value: string) => {
    updateField({ assigneeId: value === "none" ? null : value });
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateField({ dueDate: val ? new Date(val + "T00:00:00") : null });
  };

  const handleTitleSave = () => {
    if (editTitle.trim() && editTitle.trim() !== task.taskName) {
      updateField({ taskName: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionChange = (val: string) => {
    updateField({ description: val || null });
  };

  const handleVisibilityChange = (value: string) => {
    updateField({ visibility: value as "Public" | "Private" });
  };

  // ─── Subtask Creation ──────────────────────────────────────────────────

  const handleCreateSubtask = async () => {
    if (!newSubtaskName.trim()) return;
    setCreatingSubtask(true);
    try {
      await createTask(projectId, workspaceId, userId, {
        taskName: newSubtaskName.trim(),
        parentTaskId: task.id,
      });
      // Mark parent as having subtasks
      if (!task.hasSubtasks) {
        await updateTask(task.id, { hasSubtasks: true });
        setTask((prev) => ({ ...prev, hasSubtasks: true }));
      }
      setNewSubtaskName("");
      setShowAddSubtask(false);
      toast.success("Subtask created");
      const { getSubtasks } = await import("@/lib/firebase/project-tasks");
      const data = await getSubtasks(task.id);
      setSubtasks(data);
      onTaskUpdated?.();
    } catch {
      toast.error("Failed to create subtask");
    } finally {
      setCreatingSubtask(false);
    }
  };

  const handleSubtaskToggle = async (subtask: ProjectTask) => {
    const isComplete = subtask.status.parent === "Complete";
    try {
      await updateTask(subtask.id, {
        status: isComplete
          ? { parent: "To Do", name: "Not Started", color: "#DDDDDD" }
          : { parent: "Complete", name: "Complete", color: "#D1F5CF" },
      });
      setSubtasks((prev) => prev.map((t) => t.id === subtask.id ? {
        ...t,
        status: isComplete
          ? { parent: "To Do", name: "Not Started", color: "#DDDDDD" }
          : { parent: "Complete", name: "Complete", color: "#D1F5CF" },
      } : t));
      onTaskUpdated?.();
    } catch { toast.error("Failed to update subtask"); }
  };

  const handleSubtaskDelete = async (subtask: ProjectTask) => {
    try {
      await deleteTask(subtask.id);
      setSubtasks((prev) => prev.filter((t) => t.id !== subtask.id));
      toast.success("Subtask deleted");
      onTaskUpdated?.();
    } catch { toast.error("Failed to delete subtask"); }
  };

  // ─── Derived ───────────────────────────────────────────────────────────

  const dueDateValue = parseDate(task.dueDate);
  const assignee = task.assigneeId ? memberMap.get(task.assigneeId) : null;
  const isReadOnly = readOnly || !onTaskUpdated;

  // ═══ RENDER ═════════════════════════════════════════════════════════════

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <DialogTitle className="text-lg font-semibold">Task Details</DialogTitle>
          {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {/* ─── Scrollable Body ─── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Title */}
          <div>
            {isEditingTitle && !isReadOnly ? (
              <div className="flex items-center gap-2">
                <input
                  ref={titleRef}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleTitleSave(); if (e.key === "Escape") setIsEditingTitle(false); }}
                  onBlur={handleTitleSave}
                  className="flex-1 text-lg font-semibold bg-transparent border-b border-foreground/20 px-1 py-0.5 text-foreground focus:outline-none"
                  autoFocus
                />
              </div>
            ) : (
              <h2
                className={cn("text-lg font-semibold text-foreground", !isReadOnly && "cursor-pointer hover:text-primary")}
                onClick={() => { if (!isReadOnly) { setEditTitle(task.taskName); setIsEditingTitle(true); } }}
              >
                {task.taskName}
              </h2>
            )}
          </div>

          {/* Info Grid: Status, Due Date, Assignee, Visibility */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              {isReadOnly ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={getStatusStyle(task.status.color)}>
                  {task.status.name}
                </span>
              ) : (
                <Select value={task.status.name} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.name} value={opt.name} className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.color }} />
                          {opt.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Due Date</Label>
              {isReadOnly ? (
                <p className="text-sm font-medium text-foreground">{dueDateValue ? formatDate(dueDateValue) : "Not set"}</p>
              ) : (
                <div className="relative">
                  <input
                    type="date"
                    value={dueDateValue ? dueDateValue.toISOString().split("T")[0] : ""}
                    onChange={handleDueDateChange}
                    className="w-full h-8 px-2 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:border-foreground/30"
                  />
                  {dueDateValue && (
                    <button
                      onClick={() => updateField({ dueDate: null })}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Assignee</Label>
              {isReadOnly ? (
                <div className="flex items-center gap-2">
                  {assignee ? (
                    <>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary/10 text-primary text-[8px]">{getInitials(assignee.displayName)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">{assignee.displayName}</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </div>
              ) : (
                <Select value={task.assigneeId || "none"} onValueChange={handleAssigneeChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs">Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.userId} value={m.userId} className="text-xs">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="bg-primary/10 text-primary text-[7px]">{getInitials(m.displayName)}</AvatarFallback>
                          </Avatar>
                          {m.displayName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Visibility */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Visibility</Label>
              {isReadOnly ? (
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  {task.visibility === "Private" ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                  {task.visibility}
                </div>
              ) : (
                <Select value={task.visibility} onValueChange={handleVisibilityChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Public" className="text-xs">
                      <div className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> Public</div>
                    </SelectItem>
                    <SelectItem value="Private" className="text-xs">
                      <div className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> Private</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Description</Label>
            {isReadOnly ? (
              <div className="p-3 rounded-lg border border-border bg-muted/20 min-h-[60px]">
                {task.description ? (
                  <p className="text-sm text-foreground whitespace-pre-wrap">{task.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No description</p>
                )}
              </div>
            ) : (
              <RichTextEditor
                value={task.description || ""}
                onChange={handleDescriptionChange}
                placeholder="Write your description here..."
              />
            )}
          </div>

          {/* Subtasks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Subtasks ({subtasks.length})</Label>
              {!isReadOnly && (
                <button
                  onClick={() => setShowAddSubtask(!showAddSubtask)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
                >
                  <Plus className="h-3 w-3" /> Add Subtask
                </button>
              )}
            </div>

            {showAddSubtask && !isReadOnly && (
              <div className="flex items-center gap-2 p-2 border border-border rounded-lg bg-muted/30">
                <input
                  value={newSubtaskName}
                  onChange={(e) => setNewSubtaskName(e.target.value)}
                  placeholder="Subtask name..."
                  className="flex-1 bg-transparent text-sm border-0 focus:outline-none placeholder:text-muted-foreground/50"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateSubtask(); if (e.key === "Escape") setShowAddSubtask(false); }}
                />
                <button
                  onClick={handleCreateSubtask}
                  disabled={creatingSubtask || !newSubtaskName.trim()}
                  className="text-xs px-2 py-1 bg-foreground text-background rounded hover:opacity-90 disabled:opacity-50"
                >
                  {creatingSubtask ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
                </button>
                <button
                  onClick={() => { setShowAddSubtask(false); setNewSubtaskName(""); }}
                  className="text-xs px-2 py-1 text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="space-y-0.5">
              {subtasks.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No subtasks</p>
              ) : (
                subtasks.map((sub) => (
                  <SubtaskItem
                    key={sub.id}
                    task={sub}
                    memberMap={memberMap}
                    onToggle={() => handleSubtaskToggle(sub)}
                    onDelete={() => handleSubtaskDelete(sub)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Files */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Files ({(task.files || []).length})</Label>
              {!isReadOnly && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    {uploading ? "Uploading..." : "Upload Files"}
                  </button>
                </>
              )}
            </div>

            <div className="space-y-1.5">
              {(!task.files || task.files.length === 0) ? (
                <p className="text-xs text-muted-foreground py-2">No files attached</p>
              ) : (
                task.files.map((file) => (
                  <FileItem
                    key={file.id}
                    file={file}
                    onDelete={() => handleDeleteFile(file.id)}
                    readOnly={isReadOnly}
                  />
                ))
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span>Created {task.createdAt?.toDate?.()?.toLocaleDateString?.() || "—"}</span>
              <span>ID: {task.id.slice(0, 8)}...</span>
              {task.completedAt && <span>Completed {task.completedAt.toDate().toLocaleDateString()}</span>}
            </div>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border shrink-0 bg-muted/10">
          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  if (confirm("Delete this task and all its subtasks?")) {
                    const allIds = [task.id, ...subtasks.map((s) => s.id)];
                    Promise.all(allIds.map((id) => deleteTask(id))).then(() => {
                      toast.success("Task deleted");
                      onOpenChange(false);
                      onTaskUpdated?.();
                    }).catch(() => toast.error("Failed to delete task"));
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
              </Button>
            )}
          </div>
          <Button variant="default" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>
            {isReadOnly ? "Close" : "Done"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
