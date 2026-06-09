"use client";

import { useState, useRef, useEffect } from "react";
import type { ProjectTask, ProjectTaskStatus, TaskFile } from "@/types";
import { updateTask, deleteTask, createTask, getProjectTasks } from "@/lib/firebase/project-tasks";
import { Button } from "@/components/ui/button";
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
  X,
  Globe,
  Lock,
  Pencil,
  Check,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Timestamp } from "firebase/firestore";

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

// ─── Date Helpers ────────────────────────────────────────────────────────────

/** Parse dueDate from Firestore Timestamp, Date, or null → local Date or null */
function parseDueDate(dueDate: unknown): Date | null {
  if (!dueDate) return null;
  if (typeof (dueDate as Record<string, unknown>).toDate === "function") return (dueDate as { toDate: () => Date }).toDate();
  if (typeof dueDate === "object" && "seconds" in (dueDate as Record<string, unknown>)) return new Date((dueDate as { seconds: number }).seconds * 1000);
  if (typeof dueDate === "string") { const d = new Date(dueDate); return isNaN(d.getTime()) ? null : d; }
  if (dueDate instanceof Date) return dueDate;
  return null;
}

/** Format date for display */
function formatDate(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Convert Date to YYYY-MM-DD string in LOCAL timezone (for date input value) */
function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse YYYY-MM-DD to Date at NOON local time (avoids timezone offset issues) */
function parseDateInput(val: string): Date {
  const [year, month, day] = val.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

// ─── Rich Text Editor ───────────────────────────────────────────────────────

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

// ─── Props ──────────────────────────────────────────────────────────────────

interface TaskDetailModalProps {
  task: ProjectTask;
  projectId: string;
  workspaceId: string;
  userId: string;
  /** Members for assignee dropdown — should already exclude clients */
  members: Array<{ userId: string; displayName: string; email: string; photoURL?: string | null }>;
  memberMap: Map<string, { displayName: string; photoURL?: string | null }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated?: () => void;
  readOnly?: boolean;
}

// ─── Main Component ────────────────────────────────────────────────────────

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
  // ── Local working copy (not saved until Done) ────────────────────────────
  const [task, setTask] = useState<ProjectTask>(initialTask);
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setTask(initialTask);
      setDirtyFields(new Set());
      setDeleting(false);
    }
  }, [open, initialTask]);

  // ── Title editing ────────────────────────────────────────────────────────
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isEditingTitle && titleRef.current) { titleRef.current.focus(); titleRef.current.select(); }
  }, [isEditingTitle]);

  // ── Dirty field tracker ──────────────────────────────────────────────────
  const markDirty = (field: string) => {
    setDirtyFields((prev) => {
      if (prev.has(field)) return prev;
      return new Set(prev).add(field);
    });
  };

  const hasUnsaved = dirtyFields.size > 0;

  // ── Field updates (local only) ───────────────────────────────────────────
  const setField = <K extends keyof ProjectTask>(key: K, value: ProjectTask[K]) => {
    setTask((prev) => ({ ...prev, [key]: value }));
    markDirty(key as string);
  };

  // ── Save handler ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (dirtyFields.size === 0) {
      onOpenChange(false);
      return;
    }
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {};

      if (dirtyFields.has("taskName")) updates.taskName = task.taskName;
      if (dirtyFields.has("status")) updates.status = task.status;
      if (dirtyFields.has("assigneeId")) updates.assigneeId = task.assigneeId;
      if (dirtyFields.has("description")) updates.description = task.description || null;
      if (dirtyFields.has("visibility")) updates.visibility = task.visibility;

      if (dirtyFields.has("dueDate")) {
        const d = parseDueDate(task.dueDate);
        // Pass Date directly — updateTask() handles Timestamp.fromDate()
        updates.dueDate = d;
      }

      if (Object.keys(updates).length > 0) {
        await updateTask(task.id, updates as Parameters<typeof updateTask>[1]);
      }

      setDirtyFields(new Set());
      onTaskUpdated?.();
      onOpenChange(false);
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete handler ──────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;
    setDeleting(true);
    try {
      await deleteTask(task.id);
      toast.success("Task deleted");
      onOpenChange(false);
      onTaskUpdated?.();
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setDeleting(false);
    }
  };

  // ── File Upload ──────────────────────────────────────────────────────────
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

        const headers = await getApiAuthHeaders(workspaceId);
        const res = await fetch("/api/deliverables/upload-file", {
          method: "POST",
          headers: { ...headers, "x-upload-context": "task" },
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Upload failed" }));
          throw new Error(err.error || "Upload failed");
        }
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload file");
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

  // ── Derived ──────────────────────────────────────────────────────────────
  const dueDateValue = parseDueDate(task.dueDate);
  const assignee = task.assigneeId ? memberMap.get(task.assigneeId) : null;
  const isReadOnly = readOnly || !onTaskUpdated;

  // ═══ RENDER ═════════════════════════════════════════════════════════════
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-lg font-semibold">Task Details</DialogTitle>
            {hasUnsaved && !isReadOnly && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                Unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </div>

        {/* ─── Scrollable Body ─── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* ── Title ── */}
          <div>
            {isEditingTitle && !isReadOnly ? (
              <div className="flex items-center gap-2">
                <input
                  ref={titleRef}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (editTitle.trim() && editTitle.trim() !== task.taskName) {
                        setField("taskName", editTitle.trim());
                      }
                      setIsEditingTitle(false);
                    }
                    if (e.key === "Escape") setIsEditingTitle(false);
                  }}
                  onBlur={() => {
                    if (editTitle.trim() && editTitle.trim() !== task.taskName) {
                      setField("taskName", editTitle.trim());
                    }
                    setIsEditingTitle(false);
                  }}
                  className="flex-1 text-lg font-semibold bg-transparent border-b border-foreground/20 px-1 py-0.5 text-foreground focus:outline-none"
                  autoFocus
                />
              </div>
            ) : (
              <h2
                className={cn("text-lg font-semibold text-foreground group flex items-center gap-2", !isReadOnly && "cursor-pointer hover:text-primary")}
                onClick={() => { if (!isReadOnly) { setEditTitle(task.taskName); setIsEditingTitle(true); } }}
              >
                {task.taskName}
                {!isReadOnly && <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
              </h2>
            )}
          </div>

          {/* ── Info Grid: Status, Due Date, Assignee, Visibility ── */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              {isReadOnly ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={getStatusStyle(task.status.color)}>
                  {task.status.name}
                </span>
              ) : (
                <Select value={task.status.name} onValueChange={(v) => {
                  const opt = STATUS_OPTIONS.find((s) => s.name === v);
                  if (opt) setField("status", opt);
                }}>
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
                    value={toDateInputValue(dueDateValue)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const d = parseDateInput(val);
                        setField("dueDate", Timestamp.fromDate(d));
                      } else {
                        setField("dueDate", null as unknown as ProjectTask["dueDate"]);
                      }
                    }}
                    className="w-full h-8 px-2 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:border-foreground/30"
                  />
                  {dueDateValue && (
                    <button
                      onClick={() => setField("dueDate", null as unknown as ProjectTask["dueDate"])}
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
                        <AvatarImage src={assignee.photoURL || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-[8px]">{getInitials(assignee.displayName)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">{assignee.displayName}</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </div>
              ) : (
                <Select value={task.assigneeId || "none"} onValueChange={(v) => {
                  setField("assigneeId", v === "none" ? null : v);
                }}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs">Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.userId} value={m.userId} className="text-xs">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={m.photoURL || undefined} />
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
                <Select value={task.visibility} onValueChange={(v) => {
                  setField("visibility", v as "Public" | "Private");
                }}>
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

          {/* ── Description ── */}
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
                onChange={(val) => setField("description", val || null as unknown as string)}
                placeholder="Write your description here..."
              />
            )}
          </div>

          {/* ── Files ── */}
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
        </div>

        {/* ─── Footer ─── */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border shrink-0 bg-muted/10">
          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
                Delete
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
              if (hasUnsaved && !confirm("Discard unsaved changes?")) return;
              onOpenChange(false);
            }}>
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              className="text-xs"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : hasUnsaved ? <Check className="h-3.5 w-3.5 mr-1" /> : null}
              {isReadOnly ? "Close" : saving ? "Saving..." : hasUnsaved ? "Save & Close" : "Done"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
