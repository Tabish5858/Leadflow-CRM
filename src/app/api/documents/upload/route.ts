import { NextRequest, NextResponse } from "next/server";
import { cloudinary, getWorkspaceFolder, getFileType, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/cloudinary";
import { db } from "@/lib/firebase/client";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const DOCUMENTS_COLLECTION = "documents";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const leadId = formData.get("leadId") as string;
    const workspaceId = formData.get("workspaceId") as string;
    const userId = formData.get("userId") as string;

    if (!file || !workspaceId || !userId) {
      return NextResponse.json(
        { error: "file, workspaceId, and userId are required" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} not allowed. Allowed: ${ALLOWED_FILE_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Convert file to base64 for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary
    const folder = getWorkspaceFolder(workspaceId);
    const result = await cloudinary.uploader.upload(base64, {
      folder,
      resource_type: "auto",
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    // Store metadata in Firestore
    const docData: Record<string, unknown> = {
      workspaceId,
      fileName: file.name,
      fileType: getFileType(file.type),
      mimeType: file.type,
      fileSize: file.size,
      cloudinaryPublicId: result.public_id,
      cloudinaryUrl: result.secure_url,
      cloudinaryResourceType: result.resource_type,
      uploadedBy: userId,
      createdAt: Timestamp.now(),
    };
    if (leadId) docData.leadId = leadId;
    const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), docData);

    return NextResponse.json({
      success: true,
      documentId: docRef.id,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Document upload error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload document";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
