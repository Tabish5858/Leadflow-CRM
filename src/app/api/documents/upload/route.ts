import { NextRequest, NextResponse } from "next/server";
import { cloudinary, getWorkspaceFolder } from "@/lib/cloudinary";
import { withAuth } from "@/lib/api/middleware";
import { getAdminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { getFileType } from "@/lib/cloudinary-config";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "text/plain",
  "text/csv",
];

/**
 * POST /api/documents/upload
 * Multipart form: file + projectId
 * Uploads to Cloudinary and saves document metadata to Firestore.
 */
export async function POST(req: NextRequest) {
  return withAuth(req, async (ctx) => {
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const projectId = formData.get("projectId") as string | null;

      if (!file) {
        return NextResponse.json({ error: "File is required" }, { status: 400 });
      }

      if (!projectId) {
        return NextResponse.json({ error: "projectId is required" }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
          { status: 400 }
        );
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type ${file.type} not allowed` },
          { status: 400 }
        );
      }

      // Convert to base64 for Cloudinary
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

      const folder = `${getWorkspaceFolder(ctx.workspaceId)}/documents`;
      const resourceType = file.type.startsWith("video/") ? "video" : "image";
      const result = await cloudinary.uploader.upload(base64, {
        folder,
        resource_type: resourceType,
        type: "upload",
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      });

      // Save document metadata to Firestore
      const fileType = getFileType(file.type);
      const now = Timestamp.now();
      const db = getAdminDb();
      const docRef = await db.collection("documents").add({
        workspaceId: ctx.workspaceId,
        projectId,
        leadId: "",
        fileName: file.name,
        fileType,
        mimeType: file.type,
        fileSize: file.size,
        cloudinaryPublicId: result.public_id,
        cloudinaryUrl: result.secure_url,
        cloudinaryResourceType: resourceType,
        uploadedBy: ctx.userId,
        createdAt: now,
        updatedAt: now,
        category: null,
        tags: [],
      });

      return NextResponse.json({
        success: true,
        document: {
          id: docRef.id,
          workspaceId: ctx.workspaceId,
          projectId,
          fileName: file.name,
          fileType,
          mimeType: file.type,
          fileSize: file.size,
          cloudinaryPublicId: result.public_id,
          cloudinaryUrl: result.secure_url,
          cloudinaryResourceType: resourceType,
          uploadedBy: ctx.userId,
          createdAt: { seconds: now.seconds, nanoseconds: now.nanoseconds },
        },
      });
    } catch (error) {
      console.error("Document upload error:", error);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
  });
}
