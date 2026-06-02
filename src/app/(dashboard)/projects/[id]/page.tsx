"use client";

import { useWorkspace } from "@/contexts/workspace-context";
import { getProject, updateProject, deleteProject } from "@/lib/firebase/projects";
import { getWorkspaceMembers } from "@/lib/firebase/workspaces";
import type { Project, ProjectStatus, WorkspaceMember } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  DollarSign,
  Edit3,
  Loader2,
  MoreHorizontal,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  active: { label: "Active", class: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" },
  on_hold: { label: "On Hold", class: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" },
  completed: { label: "Completed", class: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" },
  cancelled: { label: "Cancelled", class: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" },
};

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: Date | null): string {
  if (!date) return "Not set";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState<ProjectStatus>("active");
  const [editProgress, setEditProgress] = useState("");
  const [editBudget, setEditBudget] = useState("");

  const loadProject = useCallback(async () => {
    if (!activeWorkspace?.id || !projectId) return;
    setLoading(true);
    setError(null);
    try {
      const [data, memberData] = await Promise.all([
        getProject(projectId),
        getWorkspaceMembers(activeWorkspace.id),
      ]);
      if (!data) {
        setError("Project not found");
        return;
      }
      setProject(data);
      setMembers(memberData);
    } catch {
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace?.id, projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const startEditing = () => {
    if (!project) return;
    setEditName(project.name);
    setEditDesc(project.description || "");
    setEditStatus(project.status);
    setEditProgress(String(project.progress));
    setEditBudget(project.budget ? String(project.budget) : "");
    setEditing(true);
  };

  const handleSave = async () => {
    if (!project || !editName.trim()) return;
    setSaving(true);
    try {
      await updateProject(project.id, {
        name: editName.trim(),
        description: editDesc.trim() || null,
        status: editStatus,
        progress: Math.min(100, Math.max(0, parseInt(editProgress) || 0)),
        budget: editBudget ? parseFloat(editBudget) : null,
      });
      setProject((prev) =>
        prev
          ? {
              ...prev,
              name: editName.trim(),
              description: editDesc.trim() || null,
              status: editStatus,
              progress: Math.min(100, Math.max(0, parseInt(editProgress) || 0)),
              budget: editBudget ? parseFloat(editBudget) : null,
            }
          : prev
      );
      setEditing(false);
      toast.success("Project updated");
    } catch {
      toast.error("Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    setDeleting(true);
    try {
      await deleteProject(project.id);
      toast.success("Project deleted");
      router.push("/projects");
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-destructive">{error || "Project not found"}</p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/projects">Back to Projects</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.active;
  const clientMembers = members.filter((m) => project.clients.includes(m.userId));
  const memberMap = new Map(members.map((m) => [m.userId, m]));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight truncate">{project.name}</h1>
            <Badge variant="outline" className={`${statusCfg.class}`}>
              {statusCfg.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Created {project.createdAt ? formatDate(project.createdAt.toDate()) : "Unknown"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={startEditing} className="gap-2">
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {project.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Progress + Status */}
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(project.progress, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Clients */}
          {clientMembers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Clients
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {clientMembers.map((client) => (
                  <div key={client.userId} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src={client.photoURL || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(client.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{client.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Meta */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant="outline" className={`${statusCfg.class}`}>
                  {statusCfg.label}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Priority</p>
                <p className="text-sm font-medium capitalize">{project.priority}</p>
              </div>
              {project.budget && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="text-sm font-medium">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: project.currency,
                    }).format(project.budget)}
                  </p>
                </div>
              )}
              <Separator />
              {project.startDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Start: {formatDate(project.startDate.toDate())}
                  </span>
                </div>
              )}
              {project.dueDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Due: {formatDate(project.dueDate.toDate())}
                  </span>
                </div>
              )}
              {project.completedDate && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Calendar className="h-4 w-4" />
                  <span>Completed: {formatDate(project.completedDate.toDate())}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Edit Dialog ── */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project details and progress.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as ProjectStatus)}>
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-progress">Progress (%)</Label>
                <Input
                  id="edit-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={editProgress}
                  onChange={(e) => setEditProgress(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-budget">Budget (USD)</Label>
              <Input
                id="edit-budget"
                type="number"
                min="0"
                step="0.01"
                value={editBudget}
                onChange={(e) => setEditBudget(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !editName.trim()}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Project?</DialogTitle>
            <DialogDescription>
              This will permanently delete &ldquo;{project.name}&rdquo; and all its data. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
