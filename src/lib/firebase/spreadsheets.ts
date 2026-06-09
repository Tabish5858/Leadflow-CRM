import { db } from "@/lib/firebase/client";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import type { IWorkbookData } from "@univerjs/core";

export interface Spreadsheet {
  id: string;
  workspaceId: string;
  name: string;
  snapshot: IWorkbookData | null;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("leadflow_demo_mode") === "true";
}

const spreadsheetsCol = (workspaceId: string) =>
  collection(db, "workspaces", workspaceId, "spreadsheets").withConverter<Omit<Spreadsheet, "id">>({
    toFirestore: (data) => data,
    fromFirestore: (snap) => snap.data() as Omit<Spreadsheet, "id">,
  });

export async function getSpreadsheets(workspaceId: string): Promise<Spreadsheet[]> {
  if (isDemoMode()) {
    const { demoStore } = await import("@/lib/demo/demo-data");
    return demoStore.getSpreadsheets() as unknown as Spreadsheet[];
  }
  const q = query(spreadsheetsCol(workspaceId), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Spreadsheet, "id">) }));
}

export async function getSpreadsheet(
  workspaceId: string,
  spreadsheetId: string
): Promise<Spreadsheet | null> {
  if (isDemoMode()) {
    const { demoStore } = await import("@/lib/demo/demo-data");
    return demoStore.getSpreadsheet(spreadsheetId) as unknown as Spreadsheet | null;
  }
  const ref = doc(db, "workspaces", workspaceId, "spreadsheets", spreadsheetId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Spreadsheet, "id">) };
}

export async function createSpreadsheet(
  workspaceId: string,
  name: string,
  createdBy: string
): Promise<string> {
  if (isDemoMode()) {
    const { demoStore } = await import("@/lib/demo/demo-data");
    return demoStore.createSpreadsheet(workspaceId, name, createdBy);
  }
  const ref = await addDoc(spreadsheetsCol(workspaceId), {
    workspaceId,
    name,
    snapshot: null,
    createdBy,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  });
  return ref.id;
}

export async function updateSpreadsheetSnapshot(
  workspaceId: string,
  spreadsheetId: string,
  snapshot: IWorkbookData
): Promise<void> {
  if (isDemoMode()) {
    const { demoStore } = await import("@/lib/demo/demo-data");
    return demoStore.updateSpreadsheetSnapshot(spreadsheetId, snapshot as unknown as Record<string, unknown>);
  }
  const ref = doc(db, "workspaces", workspaceId, "spreadsheets", spreadsheetId);
  await updateDoc(ref, {
    snapshot,
    updatedAt: serverTimestamp(),
  });
}

export async function updateSpreadsheetName(
  workspaceId: string,
  spreadsheetId: string,
  name: string
): Promise<void> {
  if (isDemoMode()) {
    const { demoStore } = await import("@/lib/demo/demo-data");
    return demoStore.updateSpreadsheetName(spreadsheetId, name);
  }
  const ref = doc(db, "workspaces", workspaceId, "spreadsheets", spreadsheetId);
  await updateDoc(ref, {
    name,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSpreadsheet(
  workspaceId: string,
  spreadsheetId: string
): Promise<void> {
  if (isDemoMode()) {
    const { demoStore } = await import("@/lib/demo/demo-data");
    return demoStore.deleteSpreadsheet(spreadsheetId);
  }
  const ref = doc(db, "workspaces", workspaceId, "spreadsheets", spreadsheetId);
  await deleteDoc(ref);
}
