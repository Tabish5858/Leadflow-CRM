"use client";

import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { getProjects } from "@/lib/firebase/projects";
import { getProjectTasks } from "@/lib/firebase/project-tasks";
import { getInvoices } from "@/lib/firebase/invoices";
import { getContracts } from "@/lib/firebase/contracts";
import { getMeetings } from "@/lib/firebase/meetings";
import { getConversations } from "@/lib/firebase/messages";
import { getWorkspaceMembers } from "@/lib/firebase/workspaces";

/* ------------------------------------------------------------------ */
/*  Dashboard data hooks — each uses React Query with staleTime for   */
/*  caching + deduplication. The workspace context handles demo mode  */
/*  by providing the demo workspace ID, so no special handling here.  */
/* ------------------------------------------------------------------ */

export function useDashboardTasks(workspaceId?: string, userId?: string) {
  return useQuery({
    queryKey: ["dashboard", "tasks", workspaceId, userId],
    queryFn: async () => {
      if (!workspaceId || !userId) return [];

      // Step 1: Get user's projects
      const projects = await getProjects(workspaceId, { max: 20 });
      const userProjects = projects.filter(
        (p) => p.memberIds?.includes(userId) && p.status === "active"
      );

      if (userProjects.length === 0) return [];

      // Step 2: Batched task query — one query instead of N
      const projectIds = userProjects.slice(0, 10).map((p) => p.id);
      const tasksRef = collection(db, "project_tasks");
      const allTasks: Awaited<ReturnType<typeof getProjectTasks>> = [];

      if (projectIds.length <= 10) {
        const q = query(
          tasksRef,
          where("projectId", "in", projectIds),
          where("isDeleted", "==", false)
        );
        const snap = await getDocs(q);
        allTasks.push(...snap.docs.map((d) => ({ id: d.id, ...d.data() } as any)));
      } else {
        for (let i = 0; i < projectIds.length; i += 10) {
          const chunk = projectIds.slice(i, i + 10);
          const q = query(
            tasksRef,
            where("projectId", "in", chunk),
            where("isDeleted", "==", false)
          );
          const snap = await getDocs(q);
          allTasks.push(...snap.docs.map((d) => ({ id: d.id, ...d.data() } as any)));
        }
      }

      // Step 3: Filter and enrich
      const projectMap = new Map(userProjects.map((p) => [p.id, p]));
      const assigned = allTasks
        .filter((t) => t.assigneeId === userId && t.status?.parent !== "Complete")
        .map((t) => ({ ...t, projectName: projectMap.get(t.projectId)?.name }));

      // Step 4: Sort by priority then due date
      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      assigned.sort((a, b) => {
        const pa = priorityOrder[a.priority ?? "low"] ?? 3;
        const pb = priorityOrder[b.priority ?? "low"] ?? 3;
        if (pa !== pb) return pa - pb;
        if (a.dueDate && b.dueDate) return a.dueDate.seconds - b.dueDate.seconds;
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return 0;
      });

      return assigned.slice(0, 8);
    },
    enabled: !!workspaceId && !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDashboardProjects(workspaceId?: string, userId?: string) {
  return useQuery({
    queryKey: ["dashboard", "projects", workspaceId, userId],
    queryFn: async () => {
      if (!workspaceId || !userId) return [];
      const projects = await getProjects(workspaceId, { max: 50 });
      return projects.filter((p) => p.memberIds?.includes(userId)).slice(0, 6);
    },
    enabled: !!workspaceId && !!userId,
    staleTime: 3 * 60 * 1000,
  });
}

export function useDashboardInvoices(workspaceId?: string) {
  return useQuery({
    queryKey: ["dashboard", "invoices", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const invoices = await getInvoices(workspaceId, { max: 10 });
      return invoices.slice(0, 6);
    },
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDashboardContracts(workspaceId?: string) {
  return useQuery({
    queryKey: ["dashboard", "contracts", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const contracts = await getContracts(workspaceId, { max: 10 });
      return contracts.slice(0, 6);
    },
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDashboardMeetings(workspaceId?: string) {
  return useQuery({
    queryKey: ["dashboard", "meetings", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const meetings = await getMeetings(workspaceId);
      const now = new Date();
      return meetings
        .filter((m) => m.startTime && new Date(m.startTime.seconds * 1000) > now)
        .slice(0, 6);
    },
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDashboardMessages(workspaceId?: string) {
  return useQuery({
    queryKey: ["dashboard", "messages", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return { conversations: [], members: [] };
      const [conversations, members] = await Promise.all([
        getConversations(workspaceId),
        getWorkspaceMembers(workspaceId),
      ]);
      return { conversations: conversations.slice(0, 6), members };
    },
    enabled: !!workspaceId,
    staleTime: 60 * 1000, // 1 min — messages change often
  });
}
