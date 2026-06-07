"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientUser } from "@/contexts/client-user-context";
import { db } from "@/lib/firebase/client";
import {
  getProject,
  updateProject as updateProjectFB,
} from "@/lib/firebase/projects";
import {
  getProjectTasks,
} from "@/lib/firebase/project-tasks";
import {
  getProjectMilestones,
} from "@/lib/firebase/project-milestones";
import {
  getProjectNotes,
} from "@/lib/firebase/project-notes";
import { getWorkspaceMembers } from "@/lib/firebase/workspaces";
import type { Project, ProjectTask, ProjectMilestone, ProjectNote, WorkspaceMember, ProjectClient } from "@/types";
import { Timestamp } from "firebase/firestore";
import {
  Calendar,
  Clock,
  DollarSign,
  FolderKanban,
  ListTodo,
  MessageSquare,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";

import {
  BackButton,
  ErrorState,
  SkeletonList,
  SkeletonCard,
} from "@/components/client/module-layout";
import ClientDeliverablesView from "@/components/client/client-deliverables-view";
import ProgressTimeline from "@/components/projects/project-detail/progress-timeline";
import WorkflowSection from "@/components/projects/project-detail/workflow-section";
import ProjectInfoCard from "@/components/projects/project-detail/sidebar-cards/project-info-card";
import LinksEmbedsCard from "@/components/projects/project-detail/sidebar-cards/links-embeds-card";
import { ProjectNotes } from "@/components/projects/shared/project-notes";
import { TaskDetailModal } from "@/components/projects/shared/task-detail-modal";
import { FinalPackageBanner } from "@/components/projects/shared/final-package-banner";
import ProjectFiles from "@/components/projects/project-detail/project-files";
import ProjectTimeTracking from "@/components/projects/project-detail/project-time-tracking";
import { toast } from "@/lib/toast";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  on_hold: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  cancelled: "bg-muted text-muted-foreground",
};

// ─── Tab Definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "tasks", label: "Tasks" },
  { id: "deliverables", label: "Deliverables" },
  { id: "notes", label: "Notes" },
  { id: "files", label: "Files" },
  { id: "time", label: "Time" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function ClientProjectDetailPage() {
  const params = useParams();
  const { clientWorkspaceId, uid } = useClientUser();
  const id = params.id as string;

  // Core data
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Tab
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // Task data
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Milestone data
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [milestonesLoading, setMilestonesLoading] = useState(false);

  // Note data
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);

  // Task detail modal
  const [detailTask, setDetailTask] = useState<ProjectTask | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Client notes state
  const [clientNotes, setClientNotes] = useState<Record<string, string>>({});
  const [savingClientNote, setSavingClientNote] = useState(false);

  // Build member map
  const memberMap = useMemo(() => {
    const map = new Map<string, { displayName: string; photoURL?: string | null }>();
    for (const m of members) {
      map.set(m.userId, { displayName: m.displayName, photoURL: m.photoURL });
    }
    return map;
  }, [members]);

  // ─── Load Project ────────────────────────────────────────────────────────────

  const loadProject = useCallback(async () => {
    if (!clientWorkspaceId || !id) return;
    setLoading(true);
    setError(null);
    try {
      const [data, memberData] = await Promise.all([
        getProject(id),
        getWorkspaceMembers(clientWorkspaceId),
      ]);
      if (!data) { setError(new Error("Project not found")); return; }

      // Verify client is assigned
      if (!data.clients?.includes(uid)) {
        setError(new Error("You don't have access to this project"));
        return;
      }

      setProject(data);
      setMembers(memberData);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [clientWorkspaceId, id, uid]);

  useEffect(() => { loadProject(); }, [loadProject]);

  // ─── Load Tab Data ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;
    if (activeTab === "tasks" || activeTab === "overview") {
      setTasksLoading(true);
      getProjectTasks(id)
        .then(setTasks)
        .catch(() => toast.error("Failed to load tasks"))
        .finally(() => setTasksLoading(false));
    }
    if (activeTab === "notes" || activeTab === "overview") {
      setNotesLoading(true);
      getProjectNotes(id)
        .then(setNotes)
        .catch(() => toast.error("Failed to load notes"))
        .finally(() => setNotesLoading(false));
    }
    if (activeTab === "overview" || activeTab === "tasks") {
      setMilestonesLoading(true);
      getProjectMilestones(id)
        .then(setMilestones)
        .catch(() => toast.error("Failed to load milestones"))
        .finally(() => setMilestonesLoading(false));
    }
  }, [id, activeTab]);

  // ─── Filter private tasks (clients only see Public) ──────────────────────────

  const visibleTasks = useMemo(() => tasks.filter((t) => t.visibility !== "Private"), [tasks]);

  // ─── Computed Values ─────────────────────────────────────────────────────────

  const computedProgress = useMemo(() => {
    if (!visibleTasks.length) return project?.progress ?? 0;
    const completed = visibleTasks.filter((t) => t.status.parent === "Complete").length;
    return Math.round((completed / visibleTasks.length) * 100);
  }, [visibleTasks, project?.progress]);

  const tasksCompleted = visibleTasks.filter((t) => t.status.parent === "Complete").length;

  // ─── Task Detail Modal Handler ─────────────────────────────────────────────

  const handleOpenTaskDetail = useCallback((task: ProjectTask) => {
    setDetailTask(task);
    setShowDetailModal(true);
  }, []);

  // ─── Client Notes Handlers ─────────────────────────────────────────────────

  useEffect(() => {
    if (!project || !uid) return;
    // Load existing client notes from projectClients
    const pc = project.projectClients?.find((c) => c.clientId === uid);
    if (pc?.clientNotes) setClientNotes({ [uid]: pc.clientNotes });
  }, [project, uid]);

  const handleSaveClientNote = async (note: string) => {
    if (!project || !uid) return;
    setSavingClientNote(true);
    try {
      const existing: ProjectClient[] = project.projectClients || [];
      const idx = existing.findIndex((c) => c.clientId === uid);
      let updated: ProjectClient[];
      if (idx >= 0) {
        updated = [...existing];
        updated[idx] = { ...updated[idx], clientNotes: note };
      } else {
        updated = [...existing, {
          clientId: uid,
          clientNotes: note,
          isMainContact: false,
          addedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as Timestamp,
          addedBy: uid,
        }];
      }
      await updateProjectFB(project.id, { projectClients: updated });
      setProject((prev) => prev ? { ...prev, projectClients: updated } : prev);
      setClientNotes({ [uid]: note });
      toast.success("Note saved");
    } catch { toast.error("Failed to save note"); }
    finally { setSavingClientNote(false); }
  };

  // Build milestone->tasks map for WorkflowSection (use visibleTasks for client)
  const milestoneTaskMap = useMemo(() => {
    const map = new Map<string, ProjectTask[]>();
    for (const task of visibleTasks) {
      if (task.milestoneId) {
        const existing = map.get(task.milestoneId) || [];
        existing.push(task);
        map.set(task.milestoneId, existing);
      }
    }
    return map;
  }, [visibleTasks]);

  // ─── Loading / Error ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <BackButton href="/client/projects" />
        <SkeletonCard className="mb-6" />
        <SkeletonList count={3} height="h-16" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div>
        <BackButton href="/client/projects" />
        <ErrorState
          message={error?.message || "Project not found"}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <BackButton href="/client/projects" />
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <Badge
              variant="outline"
              className={`shrink-0 ${STATUS_COLORS[project.status] || ""}`}
            >
              {project.status === "on_hold" ? "On Hold" : project.status}
            </Badge>
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {project.description}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}
        className="rounded-lg border border-border bg-card p-1"
      >
        <TabsList className="w-full justify-start bg-transparent gap-0 h-auto">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}
              className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground rounded-md px-3 py-1.5 text-sm font-medium"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* ═══ TAB CONTENT ═════════════════════════════════════════════════ */}

      {/* ─── OVERVIEW ─── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Final Package Banner */}
          {project.hasFinalPackage && (
            <FinalPackageBanner project={project} />
          )}

          {/* Progress timeline */}
          <Card className="border-border">
            <CardContent className="p-5">
              <ProgressTimeline progress={computedProgress} tasksCompleted={tasksCompleted} tasksTotal={visibleTasks.length} />
            </CardContent>
          </Card>

          {/* Two-column layout: Workflow + Sidebar */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Workflow (read-only for clients) */}
            <div className="w-full lg:w-[65%] space-y-6">
              {tasksLoading || milestonesLoading ? (
                <SkeletonList count={3} height="h-16" />
              ) : (
                <WorkflowSection
                  tasks={visibleTasks}
                  milestones={milestones}
                  memberMap={memberMap}
                  taskMembers={members}
                  milestoneTaskMap={milestoneTaskMap}
                  readOnly
                  onOpenTaskDetail={handleOpenTaskDetail}
                />
              )}
            </div>

            {/* Right: Sidebar cards (client-appropriate subset) */}
            <div className="w-full lg:w-[35%] space-y-4 lg:sticky lg:top-4 lg:self-start max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
              <ProjectInfoCard project={project} memberMap={memberMap} />
              <LinksEmbedsCard project={project} canEdit={false} />

              {/* Client Notes */}
              <div className="flex flex-col p-5 w-full bg-card border border-border hover:border-foreground/20 transition-colors" style={{ borderRadius: "8px" }}>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">My Notes</h3>
                </div>
                <textarea
                  value={clientNotes[uid] || ""}
                  onChange={(e) => setClientNotes({ [uid]: e.target.value })}
                  placeholder="Add your private notes about this project..."
                  rows={4}
                  className="w-full text-xs bg-transparent border border-border rounded-lg p-2.5 resize-none focus:outline-none focus:border-foreground/30 placeholder:text-muted-foreground/50"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleSaveClientNote(clientNotes[uid] || "")}
                    disabled={savingClientNote}
                    className="text-xs px-3 py-1.5 bg-foreground text-background rounded hover:opacity-90 disabled:opacity-50"
                  >
                    {savingClientNote ? "Saving..." : "Save Note"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TASKS (full-width WorkflowSection, read-only) ─── */}
      {activeTab === "tasks" && (
        <div className="w-full">
          {tasksLoading || milestonesLoading ? (
            <SkeletonList count={3} height="h-16" />
          ) : (
            <WorkflowSection
              tasks={visibleTasks}
              milestones={milestones}
              memberMap={memberMap}
              taskMembers={members}
              milestoneTaskMap={milestoneTaskMap}
              readOnly
              onOpenTaskDetail={handleOpenTaskDetail}
            />
          )}
        </div>
      )}

      {/* ─── DELIVERABLES ─── */}
      {activeTab === "deliverables" && (
        <ClientDeliverablesView projectId={id} workspaceId={clientWorkspaceId} userId={uid} />
      )}

      {/* ─── NOTES (read-only for client) ─── */}
      {activeTab === "notes" && (
        <div>
          {notesLoading ? (
            <SkeletonList count={3} height="h-24" />
          ) : (
            <div className="max-w-2xl">
              <ProjectNotes notes={notes} memberMap={memberMap} />
            </div>
          )}
        </div>
      )}

      {/* ─── FILES (view/download) ─── */}
      {activeTab === "files" && (
        <ProjectFiles projectId={id} workspaceId={clientWorkspaceId} userId={uid} />
      )}

      {/* ─── TIME (client can add own entries) ─── */}
      {activeTab === "time" && (
        <ProjectTimeTracking projectId={id} workspaceId={clientWorkspaceId} userId={uid} members={members} />
      )}

      {/* ── Task Detail Modal (read-only) ── */}
      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          projectId={id}
          workspaceId={clientWorkspaceId}
          userId={uid}
          members={members}
          memberMap={memberMap}
          open={showDetailModal}
          onOpenChange={(open) => { setShowDetailModal(open); if (!open) setDetailTask(null); }}
          readOnly
        />
      )}
    </div>
  );
}
