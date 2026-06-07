import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

const CONTRACTS_COLLECTION = "contracts";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { viewerEmail, viewerName } = body;

    if (!id) {
      return NextResponse.json({ error: "Contract ID required" }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db.collection(CONTRACTS_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Add view activity
    const activities = docSnap.data()?.activities || [];
    activities.push({
      type: "viewed",
      userId: viewerEmail || "anonymous",
      userName: viewerName || "Anonymous",
      timestamp: Timestamp.now(),
      details: viewerEmail ? `Viewed by ${viewerEmail}` : "Viewed anonymously",
    });

    await docRef.update({
      activities,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("View tracking error:", error);
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 }
    );
  }
}
