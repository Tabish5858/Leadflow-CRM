import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Document } from "@/types";

const COLLECTION = "documents";

// ── Helpers ──────────────────────────────────────────────────────────────────

function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("leadflow_demo_mode") === "true";
}

// ── Create (upload) ──────────────────────────────────────────────────────────

export async function uploadDocument(
  workspaceId: string,
  file: File,
  leadId?: string,
  projectId?: string
): Promise<{ documentId: string; url: string } | null> {
  if (isDemoMode()) {
    const { demoStore } = await import("@/lib/demo/demo-data");
    return demoStore.uploadDocument(workspaceId, file.name, leadId);
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    if (leadId) formData.append("leadId", leadId);
    if (projectId) formData.append("projectId", projectId);

    const idToken = await getIdToken();
    const response = await fetch("/api/documents/upload", {
      method: "POST",
      headers: {
        "x-workspace-id": workspaceId,
        Authorization: `Bearer ${idToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(err.error || "Upload failed");
    }

    return response.json();
  } catch (error) {
    console.error("Document upload error:", error);
    throw error;
  }
}

// ── Read (single) ────────────────────────────────────────────────────────────

export async function getDocument(id: string): Promise<Document | null> {
  if (isDemoMode()) {
    const { demoStore } = await import("@/lib/demo/demo-data");
    return demoStore.getDocument(id);
  }

  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Document;
}

// ── Read (by project) ─────────────────────────────────────────────────────────

export async function getProjectDocuments(
  projectId: string,
  workspaceId: string
): Promise<Document[]> {
  if (isDemoMode()) {
    const { demoStore } = await import("@/lib/demo/demo-data");
    return demoStore.getDocuments().filter(
      (d) => d.workspaceId === workspaceId && (d as Document).projectId === projectId
    );
  }

  const q = query(
    collection(db, COLLECTION),
    where("projectId", "==", projectId),
    where("workspaceId", "==", workspaceId),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Document);
}

// ── Read (list) ──────────────────────────────────────────────────────────────

export async function getDocuments(
  workspaceId: string,
  opts?: { max?: number }
): Promise<Document[]> {
  if (isDemoMode()) {
    const { demoStore } = await import("@/lib/demo/demo-data");
    return demoStore.getDocuments().filter((d) => d.workspaceId === workspaceId);
  }

  const conditions = [where("workspaceId", "==", workspaceId)];
  const q = opts?.max
    ? query(collection(db, COLLECTION), ...conditions, orderBy("createdAt", "desc"), limit(opts.max))
    : query(collection(db, COLLECTION), ...conditions, orderBy("createdAt", "desc"));

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Document);
}

// ── Delete ───────────────────────────────────────────────────────────────────

export async function deleteDocument(
  workspaceId: string,
  documentId: string
): Promise<void> {
  if (isDemoMode()) {
    const { demoStore } = await import("@/lib/demo/demo-data");
    demoStore.deleteDocument(documentId);
    return;
  }

  try {
    const idToken = await getIdToken();
    const response = await fetch("/api/documents/list", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-workspace-id": workspaceId,
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ documentId }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Delete failed" }));
      throw new Error(err.error || "Delete failed");
    }
  } catch (error) {
    console.error("Document delete error:", error);
    throw error;
  }
}

// ── Helpers (internal) ───────────────────────────────────────────────────────

async function getIdToken(): Promise<string> {
  const { getAuth } = await import("firebase/auth");
  const { auth } = await import("@/lib/firebase/client");
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}
