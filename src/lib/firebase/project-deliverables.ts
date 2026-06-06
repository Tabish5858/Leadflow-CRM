import { db } from "@/lib/firebase/client";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import type {
  Deliverable,
  DeliverableVersion,
  DeliverableFileAttachment,
  DeliverableRevision,
  ThreadedComment,
  VideoMoment,
  ImageMarkup,
  PaymentProof,
} from "@/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const COLLECTION = "project_deliverables";

// ─── CRUD ────────────────────────────────────────────────────────────────────

export async function createDeliverable(
  workspaceId: string,
  projectId: string,
  userId: string,
  data: { title: string; description?: string; deliverableType?: "file" | "link" | "both" }
): Promise<string> {
  const now = serverTimestamp();
  const docRef = await addDoc(collection(db, COLLECTION), {
    projectId,
    workspaceId,
    title: data.title,
    description: data.description || "",
    status: "not_submitted",
    versions: [],
    comments: [],
    deliverableType: data.deliverableType || "file",
    invoiceSettings: {
      requirePaymentToView: false,
      requirePaymentToDownload: false,
    },
    revisionSettings: {
      limitFreeRevisions: false,
      maxFreeRevisions: 0,
      currentRevisionCount: 0,
    },
    revisions: [],
    deliveryFlowSettings: {
      enableFeedback: true,
      enableReferrals: true,
      enableReviews: true,
      enableUpsell: true,
    },
    deliveryProgress: {
      completedSteps: [],
      currentStep: "package",
    },
    finalPackageDelivered: false,
    isDeleted: false,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function getDeliverable(id: string): Promise<Deliverable | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Deliverable;
}

export async function getProjectDeliverables(projectId: string): Promise<Deliverable[]> {
  const q = query(
    collection(db, COLLECTION),
    where("projectId", "==", projectId),
    where("isDeleted", "==", false),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Deliverable);
}

export async function updateDeliverable(
  id: string,
  data: Partial<Deliverable>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDeliverable(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    isDeleted: true,
    updatedAt: serverTimestamp(),
  });
}

// ─── Version Management ──────────────────────────────────────────────────────

export async function addDeliverableVersion(
  deliverableId: string,
  userId: string,
  version: Omit<DeliverableVersion, "id" | "versionNumber" | "uploadedAt" | "uploadedBy" | "status" | "isLatest">
): Promise<void> {
  const del = await getDeliverable(deliverableId);
  if (!del) throw new Error("Deliverable not found");

  const versionNumber = del.versions.length + 1;
  const now = Timestamp.now();

  // Mark all previous versions as not latest
  const updatedVersions = del.versions.map((v) => ({ ...v, isLatest: false }));

  const newVersion: DeliverableVersion = {
    id: `v-${versionNumber}-${Date.now()}`,
    versionNumber,
    files: version.files || [],
    links: version.links || [],
    notes: version.notes,
    uploadedAt: now,
    uploadedBy: userId,
    status: "submitted",
    isLatest: true,
  };

  updatedVersions.push(newVersion);

  await updateDoc(doc(db, COLLECTION, deliverableId), {
    versions: updatedVersions,
    status: "submitted",
    updatedAt: serverTimestamp(),
  });
}

export async function approveVersion(
  deliverableId: string,
  versionId: string,
  userId: string,
  comments?: string
): Promise<void> {
  const del = await getDeliverable(deliverableId);
  if (!del) throw new Error("Deliverable not found");

  const updatedVersions = del.versions.map((v) =>
    v.id === versionId
      ? { ...v, status: "approved" as const, approvedAt: Timestamp.now(), approvedBy: userId, approvalComments: comments }
      : v
  );

  await updateDoc(doc(db, COLLECTION, deliverableId), {
    versions: updatedVersions,
    status: "approved",
    updatedAt: serverTimestamp(),
  });
}

export async function requestRevision(
  deliverableId: string,
  versionId: string,
  userId: string,
  reason: string,
  comments?: { text: string; attachments?: DeliverableFileAttachment[] }[]
): Promise<void> {
  const del = await getDeliverable(deliverableId);
  if (!del) throw new Error("Deliverable not found");

  const now = Timestamp.now();

  const revision: DeliverableRevision = {
    id: `rev-${Date.now()}`,
    versionId,
    versionNumber: del.versions.find((v) => v.id === versionId)?.versionNumber || 1,
    requestedBy: userId,
    requestDate: now,
    reason,
    comments: (comments || []).map((c) => ({
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: c.text,
      createdBy: userId,
      createdAt: now,
      attachments: c.attachments || [],
      mentions: [],
      replies: [],
      versionId,
    })),
    isExtraRevision: false,
    status: "pending",
  };

  const updatedVersions = del.versions.map((v) =>
    v.id === versionId ? { ...v, status: "revision_requested" as const } : v
  );

  await updateDoc(doc(db, COLLECTION, deliverableId), {
    versions: updatedVersions,
    status: "needs_revision",
    revisions: arrayUnion(revision),
    "revisionSettings.currentRevisionCount": increment(1),
    updatedAt: serverTimestamp(),
  });
}

// ─── Payment Proof ───────────────────────────────────────────────────────────

export async function submitPaymentProof(
  deliverableId: string,
  userId: string,
  proof: { fileName: string; filePath: string; fileSize: number }
): Promise<void> {
  const now = Timestamp.now();
  const paymentProof: PaymentProof = {
    status: "pending",
    uploadedBy: userId,
    uploadedAt: now,
    fileName: proof.fileName,
    filePath: proof.filePath,
    fileSize: proof.fileSize,
  };

  await updateDoc(doc(db, COLLECTION, deliverableId), {
    paymentProof,
    updatedAt: serverTimestamp(),
  });
}

export async function approvePaymentProof(
  deliverableId: string,
  userId: string,
  notes?: string
): Promise<void> {
  const del = await getDeliverable(deliverableId);
  if (!del?.paymentProof) throw new Error("No payment proof found");

  const updatedProof: PaymentProof = {
    ...del.paymentProof,
    status: "approved",
    reviewedBy: userId,
    reviewedAt: Timestamp.now(),
    reviewNotes: notes,
  };

  await updateDoc(doc(db, COLLECTION, deliverableId), {
    paymentProof: updatedProof,
    updatedAt: serverTimestamp(),
  });
}

export async function rejectPaymentProof(
  deliverableId: string,
  userId: string,
  notes: string
): Promise<void> {
  const del = await getDeliverable(deliverableId);
  if (!del?.paymentProof) throw new Error("No payment proof found");

  const updatedProof: PaymentProof = {
    ...del.paymentProof,
    status: "rejected",
    reviewedBy: userId,
    reviewedAt: Timestamp.now(),
    reviewNotes: notes,
  };

  await updateDoc(doc(db, COLLECTION, deliverableId), {
    paymentProof: updatedProof,
    updatedAt: serverTimestamp(),
  });
}

// ─── Comments ────────────────────────────────────────────────────────────────

export async function addComment(
  deliverableId: string,
  userId: string,
  comment: { text: string; versionId?: string; fileId?: string; mentions?: string[]; attachments?: DeliverableFileAttachment[] }
): Promise<void> {
  const now = Timestamp.now();
  const newComment: ThreadedComment = {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: comment.text,
    createdBy: userId,
    createdAt: now,
    attachments: comment.attachments || [],
    versionId: comment.versionId,
    fileId: comment.fileId,
    mentions: comment.mentions || [],
    replies: [],
  };

  await updateDoc(doc(db, COLLECTION, deliverableId), {
    comments: arrayUnion(newComment),
    updatedAt: serverTimestamp(),
  });
}

export async function addReply(
  deliverableId: string,
  commentId: string,
  userId: string,
  reply: { text: string; attachments?: DeliverableFileAttachment[] }
): Promise<void> {
  const del = await getDeliverable(deliverableId);
  if (!del) throw new Error("Deliverable not found");

  const now = Timestamp.now();
  const newReply: ThreadedComment = {
    id: `cr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: reply.text,
    createdBy: userId,
    createdAt: now,
    attachments: reply.attachments || [],
    mentions: [],
    replies: [],
  };

  const updatedComments = del.comments.map((c) =>
    c.id === commentId ? { ...c, replies: [...c.replies, newReply] } : c
  );

  await updateDoc(doc(db, COLLECTION, deliverableId), {
    comments: updatedComments,
    updatedAt: serverTimestamp(),
  });
}

// ─── Video Moments ───────────────────────────────────────────────────────────

export async function addVideoMoment(
  deliverableId: string,
  versionId: string,
  fileId: string,
  userId: string,
  moment: { timestamp: number; comment: string; title?: string }
): Promise<void> {
  const del = await getDeliverable(deliverableId);
  if (!del) throw new Error("Deliverable not found");

  const now = Timestamp.now();
  const newMoment: VideoMoment = {
    id: `vm-${Date.now()}`,
    timestamp: moment.timestamp,
    title: moment.title,
    comment: moment.comment,
    createdBy: userId,
    createdAt: now,
    isResolved: false,
    conversation: [],
  };

  const updatedVersions = del.versions.map((v) => {
    if (v.id !== versionId) return v;
    return {
      ...v,
      files: v.files.map((f) =>
        f.id === fileId ? { ...f, videoMoments: [...f.videoMoments, newMoment] } : f
      ),
    };
  });

  await updateDoc(doc(db, COLLECTION, deliverableId), {
    versions: updatedVersions,
    updatedAt: serverTimestamp(),
  });
}

export async function toggleVideoMomentResolution(
  deliverableId: string,
  versionId: string,
  fileId: string,
  momentId: string,
  isResolved: boolean
): Promise<void> {
  const del = await getDeliverable(deliverableId);
  if (!del) throw new Error("Deliverable not found");

  const updatedVersions = del.versions.map((v) => {
    if (v.id !== versionId) return v;
    return {
      ...v,
      files: v.files.map((f) =>
        f.id !== fileId ? f : {
          ...f,
          videoMoments: f.videoMoments.map((m) =>
            m.id === momentId ? { ...m, isResolved } : m
          ),
        }
      ),
    };
  });

  await updateDoc(doc(db, COLLECTION, deliverableId), {
    versions: updatedVersions,
    updatedAt: serverTimestamp(),
  });
}

// ─── Image Markups ───────────────────────────────────────────────────────────

export async function addImageMarkup(
  deliverableId: string,
  versionId: string,
  fileId: string,
  userId: string,
  markup: Omit<ImageMarkup, "id" | "createdAt" | "createdBy">
): Promise<void> {
  const del = await getDeliverable(deliverableId);
  if (!del) throw new Error("Deliverable not found");

  const now = Timestamp.now();
  const newMarkup: ImageMarkup = {
    id: `im-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...markup,
    createdBy: userId,
    createdAt: now,
  };

  const updatedVersions = del.versions.map((v) => {
    if (v.id !== versionId) return v;
    return {
      ...v,
      files: v.files.map((f) =>
        f.id === fileId ? { ...f, imageMarkups: [...f.imageMarkups, newMarkup] } : f
      ),
    };
  });

  await updateDoc(doc(db, COLLECTION, deliverableId), {
    versions: updatedVersions,
    updatedAt: serverTimestamp(),
  });
}

// ─── Final Package ───────────────────────────────────────────────────────────

export async function deliverFinalPackage(
  deliverableId: string,
  userId: string
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, deliverableId), {
    finalPackageDelivered: true,
    finalPackageDeliveredAt: serverTimestamp(),
    finalPackageDeliveredBy: userId,
    status: "delivered",
    updatedAt: serverTimestamp(),
  });
}

// ─── Delivery Flow Settings ──────────────────────────────────────────────────

export async function updateDeliveryFlowSettings(
  deliverableId: string,
  settings: {
    enableFeedback?: boolean;
    enableReferrals?: boolean;
    enableReviews?: boolean;
    enableUpsell?: boolean;
  }
): Promise<void> {
  const updates: Record<string, unknown> = {};
  if (settings.enableFeedback !== undefined) updates["deliveryFlowSettings.enableFeedback"] = settings.enableFeedback;
  if (settings.enableReferrals !== undefined) updates["deliveryFlowSettings.enableReferrals"] = settings.enableReferrals;
  if (settings.enableReviews !== undefined) updates["deliveryFlowSettings.enableReviews"] = settings.enableReviews;
  if (settings.enableUpsell !== undefined) updates["deliveryFlowSettings.enableUpsell"] = settings.enableUpsell;
  updates.updatedAt = serverTimestamp();

  await updateDoc(doc(db, COLLECTION, deliverableId), updates);
}

export async function updateDeliveryProgress(
  deliverableId: string,
  step: string
): Promise<void> {
  const del = await getDeliverable(deliverableId);
  if (!del) throw new Error("Deliverable not found");

  const completedSteps = [...new Set([...del.deliveryProgress.completedSteps, step])];

  await updateDoc(doc(db, COLLECTION, deliverableId), {
    "deliveryProgress.completedSteps": completedSteps,
    "deliveryProgress.currentStep": step,
    updatedAt: serverTimestamp(),
  });
}
