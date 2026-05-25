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
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Timestamp } from "firebase/firestore";

/* ─── Types ─────────────────────────────────────────────────────── */

export interface MeetingType {
  id: string;
  workspaceId: string;
  name: string;
  duration: number; // minutes
  bufferTime: number; // minutes between meetings
  videoTool: "google_meet" | "none";
  description: string;
  /** Public booking token — auto-generated on create */
  bookingToken: string;
  /** Availability windows for booking page */
  availability?: {
    daysOfWeek: number[]; // 0=Sun, 1=Mon, ...
    startTime: string; // "09:00"
    endTime: string; // "17:00"
    timezone: string;
  };
  active: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/* ─── Helpers ────────────────────────────────────────────────────── */

const COLLECTION = "meeting_types";

function generateBookingToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/* ─── Create ─────────────────────────────────────────────────────── */

export async function createMeetingType(
  data: Omit<MeetingType, "id" | "bookingToken" | "createdAt" | "updatedAt">
): Promise<string> {
  const docData: Record<string, unknown> = {
    workspaceId: data.workspaceId,
    name: data.name,
    duration: data.duration,
    bufferTime: data.bufferTime,
    videoTool: data.videoTool,
    description: data.description,
    bookingToken: generateBookingToken(),
    active: data.active ?? true,
    createdBy: data.createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.availability) {
    docData.availability = data.availability;
  }

  const docRef = await addDoc(collection(db, COLLECTION), docData);
  return docRef.id;
}

/* ─── Get Single ─────────────────────────────────────────────────── */

export async function getMeetingType(id: string): Promise<MeetingType | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as MeetingType;
}

/* ─── Get by Booking Token ───────────────────────────────────────── */

export async function getMeetingTypeByToken(token: string): Promise<MeetingType | null> {
  const q = query(
    collection(db, COLLECTION),
    where("bookingToken", "==", token),
    where("active", "==", true),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as MeetingType;
}

/* ─── List for Workspace ─────────────────────────────────────────── */

export async function getMeetingTypes(workspaceId: string): Promise<MeetingType[]> {
  const q = query(
    collection(db, COLLECTION),
    where("workspaceId", "==", workspaceId),
    orderBy("name", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as MeetingType);
}

/* ─── Update ─────────────────────────────────────────────────────── */

export async function updateMeetingType(
  id: string,
  data: Partial<Omit<MeetingType, "id" | "bookingToken" | "createdAt" | "updatedAt">>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/* ─── Delete ─────────────────────────────────────────────────────── */

export async function deleteMeetingType(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
