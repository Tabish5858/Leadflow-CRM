import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  startAfter,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { AuditLog, AuditFilters, AuditAction } from "@/types";

const AUDIT_LOGS_COLLECTION = "audit_logs";

export interface AuditLogEntry {
  workspaceId: string;
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: "lead" | "document" | "task" | "user" | "workspace" | "settings" | "member" | "pipeline" | "custom_field";
  entityId: string;
  entityName: string | null;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
}

export interface PaginatedAuditLogs {
  logs: AuditLog[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
  total: number;
}

export async function logAuditEvent(data: AuditLogEntry): Promise<string> {
  const docRef = await addDoc(collection(db, AUDIT_LOGS_COLLECTION), {
    ...data,
    oldValue: data.oldValue ?? null,
    newValue: data.newValue ?? null,
    timestamp: Timestamp.now(),
  });
  return docRef.id;
}

export async function getAuditLogs(
  workspaceId: string,
  filters?: AuditFilters,
  pageSize: number = 50,
  lastVisible?: QueryDocumentSnapshot<DocumentData>
): Promise<PaginatedAuditLogs> {
  const constraints: QueryConstraint[] = [where("workspaceId", "==", workspaceId)];

  if (filters?.dateFrom) {
    constraints.push(where("timestamp", ">=", Timestamp.fromDate(filters.dateFrom)));
  }
  if (filters?.dateTo) {
    const endOfDay = new Date(filters.dateTo);
    endOfDay.setHours(23, 59, 59, 999);
    constraints.push(where("timestamp", "<=", Timestamp.fromDate(endOfDay)));
  }
  if (filters?.userId) {
    constraints.push(where("userId", "==", filters.userId));
  }
  if (filters?.action) {
    constraints.push(where("action", "==", filters.action));
  }

  constraints.push(orderBy("timestamp", "desc"));
  constraints.push(limit(pageSize));

  if (lastVisible) {
    constraints.push(startAfter(lastVisible));
  }

  const q = query(collection(db, AUDIT_LOGS_COLLECTION), ...constraints);
  let snapshot;
  try {
    snapshot = await getDocs(q);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("getAuditLogs query failed, using fallback:", message);

    // Fallback: query without orderBy (requires no composite index)
    // and sort in-memory instead
    if (message.includes("index")) {
      console.warn("getAuditLogs: falling back to simple query + in-memory sort");
      const fallbackConstraints: QueryConstraint[] = [where("workspaceId", "==", workspaceId)];
      if (filters?.userId) fallbackConstraints.push(where("userId", "==", filters.userId));
      if (filters?.action) fallbackConstraints.push(where("action", "==", filters.action));
      fallbackConstraints.push(limit(pageSize * 4)); // over-fetch to allow in-memory sort

      const fallbackQ = query(collection(db, AUDIT_LOGS_COLLECTION), ...fallbackConstraints);
      const fallbackSnap = await getDocs(fallbackQ);

      const allLogs = fallbackSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AuditLog[];

      // Sort in-memory by timestamp descending
      allLogs.sort((a, b) => b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime());

      // Apply date filters in-memory
      let filtered = allLogs;
      if (filters?.dateFrom) {
        const from = filters.dateFrom.getTime();
        filtered = filtered.filter((l) => l.timestamp.toDate().getTime() >= from);
      }
      if (filters?.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        filtered = filtered.filter((l) => l.timestamp.toDate().getTime() <= to.getTime());
      }

      const logs = filtered.slice(0, pageSize);

      return {
        logs,
        lastVisible: null,
        hasMore: false,
        total: logs.length,
      };
    }

    throw new Error(message);
  }

  const logs = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AuditLog[];

  const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

  let total = 0;
  if (!filters && !lastVisible) {
    try {
      const countQuery = query(
        collection(db, AUDIT_LOGS_COLLECTION),
        where("workspaceId", "==", workspaceId)
      );
      const countSnapshot = await getDocs(countQuery);
      total = countSnapshot.size;
    } catch (err: unknown) {
      console.warn("getAuditLogs count query failed, using page size:", err);
      total = logs.length;
    }
  } else {
    total = logs.length;
  }

  return {
    logs,
    lastVisible: lastDoc,
    hasMore: snapshot.docs.length === pageSize,
    total,
  };
}

export async function getAuditLogsByLead(
  workspaceId: string,
  leadId: string,
  limitCount: number = 100
): Promise<AuditLog[]> {
  const q = query(
    collection(db, AUDIT_LOGS_COLLECTION),
    where("workspaceId", "==", workspaceId),
    where("entityId", "==", leadId),
    orderBy("timestamp", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AuditLog[];
}

export function formatAuditAction(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    lead_created: "Lead Created",
    lead_updated: "Lead Updated",
    lead_deleted: "Lead Deleted",
    status_changed: "Status Changed",
    email_sent: "Email Sent",
    document_uploaded: "Document Uploaded",
    document_deleted: "Document Deleted",
    task_created: "Task Created",
    task_completed: "Task Completed",
    user_login: "User Login",
    user_logout: "User Logout",
    settings_changed: "Settings Changed",
    note_added: "Note Added",
    call_logged: "Call Logged",
    meeting_logged: "Meeting Logged",
    member_added: "Member Added",
    member_removed: "Member Removed",
    member_role_changed: "Role Changed",
    pipeline_changed: "Pipeline Changed",
    custom_field_changed: "Custom Field Changed",
    workspace_created: "Workspace Created",
    workspace_deleted: "Workspace Deleted",
  };
  return labels[action] || action;
}

export function getActionBadgeVariant(action: AuditAction): "default" | "secondary" | "destructive" | "outline" {
  if (action.includes("deleted")) return "destructive";
  if (action.includes("created") || action.includes("uploaded") || action.includes("login")) return "default";
  if (action.includes("updated") || action.includes("changed") || action.includes("completed")) return "secondary";
  return "outline";
}
