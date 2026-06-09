import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { withAuth } from "@/lib/api/middleware";
import { Timestamp } from "firebase-admin/firestore";

/**
 * GET /api/documents/list?projectId=xxx&workspaceId=xxx
 * Returns all documents for a project, ordered by createdAt desc.
 */
export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const db = getAdminDb();
    const snapshot = await db
      .collection("documents")
      .where("projectId", "==", projectId)
      .orderBy("createdAt", "desc")
      .get();

    const documents = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
      };
    });

    return NextResponse.json({ success: true, documents });
  });
}

/**
 * DELETE /api/documents/list
 * Body: { documentId: string }
 * Deletes a document from Firestore.
 */
export async function DELETE(req: NextRequest) {
  return withAuth(req, async () => {
    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection("documents").doc(documentId).delete();

    return NextResponse.json({ success: true });
  });
}
