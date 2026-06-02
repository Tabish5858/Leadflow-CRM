import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Project, ProjectStatus } from "@/types";

const COLLECTION = "projects";

// ── Helpers ──────────────────────────────────────────────────────────────────

function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("leadflow_demo_mode") === "true";
}

// ── Create ───────────────────────────────────────────────────────────────────

export type CreateProjectData = Pick<
  Project,
  "name" | "description" | "status" | "clients" | "priority" | "budget" | "currency"
> & {
  startDate?: Date | null;
  dueDate?: Date | null;
};

export async function createProject(
  workspaceId: string,
  userId: string,
  data: CreateProjectData
): Promise<string> {
  if (isDemoMode()) {
    const { demoStore } = await import("@/lib/demo/demo-data");
    return demoStore.createProject(workspaceId, userId, data);
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    workspaceId,
    name: data.name,
    description: data.description || null,
    status: data.status || "active",
    clients: data.clients || [],
    leadId: null,
    startDate: data.startDate ? Timestamp.fromDate(data.startDate) : null,
    dueDate: data.dueDate ? Timestamp.fromDate(data.dueDate) : null,
    completedDate: null,
    progress: 0,
    priority: data.priority || "medium",
    budget: data.budget || null,
    currency: data.currency || "USD",
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// ── Read (single) ────────────────────────────────────────────────────────────

export async function getProject(id: string): Promise<Project | null> {
  if (isDemoMode()) {
    const { demoStore } = await import("@/lib/demo/demo-data");
    return demoStore.getProject(id);
  }

  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Project;
}

// ── Read (list) ──────────────────────────────────────────────────────────────

export async function getProjects(
  workspaceId: string,
  opts?: {
    status?: ProjectStatus;
    max?: number;
  }
): Promise<Project[]> {
  if (isDemoMode()) {
    const { demoStore } = await import("@/lib/demo/demo-data");
    let items = demoStore.getProjects().filter((p) => p.workspaceId === workspaceId);
    if (opts?.status) items = items.filter((p) => p.status === opts.status);
    return items;
  }

  const conditions = [where("workspaceId", "==", workspaceId)];
  if (opts?.status) conditions.push(where("status", "==", opts.status));

  const q = opts?.max
    ? query(collection(db, COLLECTION), ...conditions, orderBy("createdAt", "desc"), limit(opts.max))
    : query(collection(db, COLLECTION), ...conditions, orderBy("createdAt", "desc"));

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Project);
}

// ── Update ───────────────────────────────────────────────────────────────────

export type UpdateProjectData = Partial<
  Pick<Project, "name" | "description" | "status" | "clients" | "priority" | "budget" | "currency" | "progress">
> & {
  startDate?: Date | null;
  dueDate?: Date | null;
};

export async function updateProject(id: string, data: UpdateProjectData): Promise<void> {
  if (isDemoMode()) {
    const { demoStore } = await import("@/lib/demo/demo-data");
    demoStore.updateProject(id, data);
    return;
  }

  const updatePayload: Record<string, unknown> = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  // Handle date conversions
  if (data.startDate !== undefined) {
    updatePayload.startDate = data.startDate ? Timestamp.fromDate(data.startDate) : null;
  }
  if (data.dueDate !== undefined) {
    updatePayload.dueDate = data.dueDate ? Timestamp.fromDate(data.dueDate) : null;
  }

  // If status changed to completed, set completedDate
  if (data.status === "completed") {
    updatePayload.completedDate = Timestamp.now();
  }

  await updateDoc(doc(db, COLLECTION, id), updatePayload);
}

// ── Delete ───────────────────────────────────────────────────────────────────

export async function deleteProject(id: string): Promise<void> {
  if (isDemoMode()) {
    const { demoStore } = await import("@/lib/demo/demo-data");
    demoStore.deleteProject(id);
    return;
  }

  await deleteDoc(doc(db, COLLECTION, id));
}
