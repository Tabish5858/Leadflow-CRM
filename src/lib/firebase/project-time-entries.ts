import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { ProjectTimeEntry } from "@/types";

const COLLECTION = "project_time_entries";

export async function createTimeEntry(
  projectId: string,
  workspaceId: string,
  userId: string,
  data: {
    taskId?: string;
    memberId: string;
    date: Date;
    startTime?: Date;
    endTime?: Date;
    totalTime: number;
    description?: string;
    billable?: boolean;
  }
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    projectId,
    workspaceId,
    taskId: data.taskId || "",
    memberId: data.memberId || userId,
    date: Timestamp.fromDate(data.date),
    startTime: data.startTime ? Timestamp.fromDate(data.startTime) : null,
    endTime: data.endTime ? Timestamp.fromDate(data.endTime) : null,
    totalTime: data.totalTime,
    isPaused: false,
    billable: data.billable ?? true,
    billed: false,
    invoiceId: null,
    invoiceNumber: null,
    description: data.description || "",
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isDeleted: false,
  });

  return docRef.id;
}

export async function getProjectTimeEntries(
  projectId: string
): Promise<ProjectTimeEntry[]> {
  const q = query(
    collection(db, COLLECTION),
    where("projectId", "==", projectId),
    where("isDeleted", "==", false),
    orderBy("date", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ProjectTimeEntry);
}

export async function deleteTimeEntry(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    isDeleted: true,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Mark multiple time entries as billed on a given invoice.
 */
export async function markTimeEntriesAsBilled(
  entryIds: string[],
  invoiceId: string,
  invoiceNumber: string
): Promise<void> {
  const writes = entryIds.map((id) =>
    updateDoc(doc(db, COLLECTION, id), {
      billed: true,
      invoiceId,
      invoiceNumber,
      updatedAt: serverTimestamp(),
    })
  );
  await Promise.all(writes);
}
