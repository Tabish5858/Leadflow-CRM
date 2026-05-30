import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Notification } from "@/types";

const NOTIFICATIONS_COLLECTION = "notifications";

// ── Create ─────────────────────────────────────────────────────────

export async function createNotification(
  data: Omit<Notification, "id" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ── Read ───────────────────────────────────────────────────────────

export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Notification)
      );
      callback(notifications);
    },
    (error) => {
      onError?.(error as Error);
    }
  );
}

export async function getNotifications(
  userId: string
): Promise<Notification[]> {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() } as Notification)
  );
}

// ── Update ─────────────────────────────────────────────────────────

export async function markAsRead(notificationId: string): Promise<void> {
  const ref = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
  await updateDoc(ref, { read: true });
}

export async function markAllAsRead(userId: string): Promise<void> {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where("userId", "==", userId),
    where("read", "==", false)
  );
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    batch.update(d.ref, { read: true });
  });
  await batch.commit();
}

// ── Delete ─────────────────────────────────────────────────────────

export async function deleteNotification(
  notificationId: string
): Promise<void> {
  const ref = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
  await deleteDoc(ref);
}

export async function clearAllNotifications(userId: string): Promise<void> {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    batch.delete(d.ref);
  });
  await batch.commit();
}
