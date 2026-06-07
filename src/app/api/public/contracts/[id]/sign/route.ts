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
    const { signerId, signature, token } = body;

    if (!id || !signerId || !signature) {
      return NextResponse.json(
        { error: "Missing required fields: contractId, signerId, signature" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const docRef = db.collection(CONTRACTS_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    const contract = docSnap.data()!;
    const signers = contract.signers || [];
    const signerIndex = signers.findIndex((s: any) => s.id === signerId);

    if (signerIndex === -1) {
      return NextResponse.json(
        { error: "Signer not found on this contract" },
        { status: 404 }
      );
    }

    if (signers[signerIndex].status === "signed") {
      return NextResponse.json(
        { error: "Signer has already signed" },
        { status: 409 }
      );
    }

    // Update signer status
    signers[signerIndex].status = "signed";
    signers[signerIndex].signedAt = Timestamp.now();
    signers[signerIndex].selectedFields = {
      ...(signers[signerIndex].selectedFields || {}),
      signature,
    };

    // Add to signatures array
    const signatures = [
      ...(contract.signatures || []),
      {
        signer: signerId,
        signature,
        signedAt: Timestamp.now(),
      },
    ];

    // Check if all signers have signed
    const allSigned = signers.every((s: any) => s.status === "signed");
    const updateData: Record<string, unknown> = {
      signers,
      signatures,
      updatedAt: Timestamp.now(),
    };

    if (allSigned) {
      updateData.status = "signed";
      updateData.dateSigned = Timestamp.now();
    }

    // Add activity
    const activities = [
      ...(contract.activities || []),
      {
        type: "signed",
        userId: signerId,
        userName: signers[signerIndex].name || "Signer",
        timestamp: Timestamp.now(),
        details: `Signed by ${signers[signerIndex].email}`,
      },
    ];
    updateData.activities = activities;

    await docRef.update(updateData);

    return NextResponse.json({
      success: true,
      status: allSigned ? "signed" : "partial",
    });
  } catch (error) {
    console.error("Public sign error:", error);
    return NextResponse.json(
      { error: "Failed to sign contract" },
      { status: 500 }
    );
  }
}
