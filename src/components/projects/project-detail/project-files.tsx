"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Document as ProjectFile } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatFileSize, getFileIcon, canPreview } from "@/lib/documents";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "@/lib/cloudinary-config";
import { getApiAuthHeaders } from "@/lib/api/client";
import {
  Upload,
  Download,
  Trash2,
  Eye,
  FileText,
  AlertCircle,
  X,
  CheckCircle2,
  FolderKanban,
} from "lucide-react";

const ACCEPTED_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".xls", ".xlsx",
  ".jpg", ".jpeg", ".png", ".gif", ".webp",
  ".txt", ".csv",
].join(",");

interface ProjectFilesProps {
  projectId: string;
  workspaceId: string;
  userId: string;
}

interface UploadState {
  fileName: string;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

function FileRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
      <Skeleton className="h-8 w-8 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

export default function ProjectFiles({ projectId, workspaceId, userId }: ProjectFilesProps) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadStates, setUploadStates] = useState<UploadState[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/documents/list?projectId=${projectId}&workspaceId=${workspaceId}`,
        { headers: await getApiAuthHeaders(workspaceId) }
      );
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      if (data.success) {
        setFiles(
          data.documents.map((d: Record<string, unknown>) => ({
            ...d,
            createdAt: d.createdAt
              ? { toDate: () => new Date((d.createdAt as { seconds: number }).seconds * 1000) }
              : undefined,
          })) as ProjectFile[]
        );
      }
    } catch (err) {
      console.error("Failed to load project files:", err);
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [projectId, workspaceId]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const uploadFile = async (file: File) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error(`File type ${file.type.split("/").pop()} not allowed`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
      return;
    }

    const state: UploadState = { fileName: file.name, progress: 0, status: "uploading" };
    setUploadStates((prev) => [...prev, state]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);

      const headers = await getApiAuthHeaders(workspaceId);
      headers["x-workspace-id"] = workspaceId;

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/documents/upload");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadStates((prev) =>
            prev.map((s) => (s.fileName === file.name ? { ...s, progress } : s))
          );
        }
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) resolve();
          else reject(new Error("Upload failed"));
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        Object.entries(headers).forEach(([key, val]) => xhr.setRequestHeader(key, val as string));
        xhr.send(formData);
      });

      setUploadStates((prev) =>
        prev.map((s) => (s.fileName === file.name ? { ...s, status: "success" as const } : s))
      );
      setTimeout(() => {
        setUploadStates((prev) => prev.filter((s) => s.fileName !== file.name));
      }, 2000);
      fetchFiles();
    } catch {
      setUploadStates((prev) =>
        prev.map((s) =>
          s.fileName === file.name ? { ...s, status: "error" as const, error: "Upload failed" } : s
        )
      );
      toast.error(`Failed to upload ${file.name}`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach(uploadFile);
    if (e.target) e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(uploadFile);
  };

  const handleDelete = async (fileId: string) => {
    setDeletingFileId(fileId);
    try {
      const headers = await getApiAuthHeaders(workspaceId);
      const res = await fetch("/api/documents/list", {
        method: "DELETE",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: fileId }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete file");
    } finally {
      setDeletingFileId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm font-medium text-foreground">
          {isDragOver ? "Drop files here" : "Drag & drop files or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PDF, images, documents up to {MAX_FILE_SIZE / 1024 / 1024}MB
        </p>
      </div>

      {/* Upload progress */}
      {uploadStates.length > 0 && (
        <div className="space-y-2">
          {uploadStates.map((state) => (
            <div key={state.fileName} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              {state.status === "uploading" ? (
                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : state.status === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{state.fileName}</p>
                {state.status === "uploading" && (
                  <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${state.progress}%` }}
                    />
                  </div>
                )}
                {state.error && <p className="text-xs text-destructive mt-0.5">{state.error}</p>}
              </div>
              <button onClick={() => setUploadStates((prev) => prev.filter((s) => s.fileName !== state.fileName))}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Files list */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (<FileRowSkeleton key={i} />))}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <FolderKanban className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No files uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {files.map((file) => {
            const FileIcon = getFileIcon(file.fileType);
            const canPrev = canPreview(file.fileType);

            return (
              <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors group">
                <div className="h-9 w-9 rounded bg-muted flex items-center justify-center shrink-0">
                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.fileSize)} &middot;{" "}
                    {file.createdAt
                      ? new Date(
                          (file.createdAt as unknown as { seconds: number }).seconds * 1000
                        ).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "Unknown date"}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {canPrev && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setPreviewUrl(file.cloudinaryUrl);
                        setPreviewName(file.fileName);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={file.cloudinaryUrl} download={file.fileName} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(file.id)}
                    disabled={deletingFileId === file.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="truncate">{previewName}</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="flex items-center justify-center p-2 bg-muted/30 rounded-lg">
              {previewUrl.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                <img src={previewUrl} alt={previewName} className="max-w-full max-h-[70vh] object-contain rounded" />
              ) : (
                <iframe src={previewUrl} className="w-full h-[70vh] rounded" title={previewName} />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
