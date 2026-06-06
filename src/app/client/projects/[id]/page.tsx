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
import type { Project, ProjectTask, ProjectMilestone, ProjectNote, WorkspaceMember } from "@/types";
import { Timestamp } from "firebase/firestore";
import {
  Calendar,
  Clock,
  DollarSign,
  FolderKanban,
  ListTodo,
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
import { ProjectNotes } from "@/components/projects/shared/project-notes";
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

  // ─── Computed Values ─────────────────────────────────────────────────────────

  const computedProgress = useMemo(() => {
    if (!tasks.length) return project?.progress ?? 0;
    const completed = tasks.filter((t) => t.status.parent === "Complete").length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks, project?.progress]);

  const tasksCompleted = tasks.filter((t) => t.status.parent === "Complete").length;

  // Build milestone->tasks map for WorkflowSection
  const milestoneTaskMap = useMemo(() => {
    const map = new Map<string, ProjectTask[]>();
    for (const task of tasks) {
      if (task.milestoneId) {
        const existing = map.get(task.milestoneId) || [];
        existing.push(task);
        map.set(task.milestoneId, existing);
      }
    }
    return map;
  }, [tasks]);

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
          {/* Progress timeline */}
          <Card className="border-border">
            <CardContent className="p-5">
              <ProgressTimeline progress={computedProgress} tasksCompleted={tasksCompleted} tasksTotal={tasks.length} />
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
                  tasks={tasks}
                  milestones={milestones}
                  memberMap={memberMap}
                  taskMembers={members}
                  milestoneTaskMap={milestoneTaskMap}
                  readOnly
                />
              )}
            </div>

            {/* Right: Sidebar cards (client-appropriate subset — only info card) */}
            <div className="w-full lg:w-[35%] space-y-4 lg:sticky lg:top-4 lg:self-start max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
              <ProjectInfoCard project={project} memberMap={memberMap} />
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
              tasks={tasks}
              milestones={milestones}
              memberMap={memberMap}
              taskMembers={members}
              milestoneTaskMap={milestoneTaskMap}
              readOnly
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
        <ProjectTimeTracking projectId={id} workspaceId={clientWorkspaceId} userId={uid} />
      )}
    </div>
  );
}
