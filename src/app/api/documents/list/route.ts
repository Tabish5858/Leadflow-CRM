import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/client";
import { collection, query, where, orderBy, getDocs, doc, deleteDoc } from "firebase/firestore";
import { cloudinary } from "@/lib/cloudinary";

const DOCUMENTS_COLLECTION = "documents";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");
    const workspaceId = searchParams.get("workspaceId");

    if (!leadId && !workspaceId) {
      return NextResponse.json(
        { error: "leadId or workspaceId is required" },
        { status: 400 }
      );
    }

    let q;
    if (leadId) {
      q = query(
        collection(db, DOCUMENTS_COLLECTION),
        where("leadId", "==", leadId),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        collection(db, DOCUMENTS_COLLECTION),
        where("workspaceId", "==", workspaceId),
        orderBy("createdAt", "desc")
      );
    }

    const snapshot = await getDocs(q);
    const documents = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json({ success: true, documents });
  } catch (error) {
    console.error("Document list error:", error);
    const message = error instanceof Error ? error.message : "Failed to list documents";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentId, workspaceId } = body;

    if (!documentId || !workspaceId) {
      return NextResponse.json(
        { error: "documentId and workspaceId are required" },
        { status: 400 }
      );
    }

    // Get document metadata
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where("workspaceId", "==", workspaceId),
      where("__name__", "==", documentId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "Document not found or access denied" },
        { status: 404 }
      );
    }

    const docData = snapshot.docs[0].data();
    const cloudinaryPublicId = docData.cloudinaryPublicId;

    // Delete from Cloudinary
    if (cloudinaryPublicId) {
      await cloudinary.uploader.destroy(cloudinaryPublicId);
    }

    // Delete from Firestore
    await deleteDoc(doc(db, DOCUMENTS_COLLECTION, documentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Document delete error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete document";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
