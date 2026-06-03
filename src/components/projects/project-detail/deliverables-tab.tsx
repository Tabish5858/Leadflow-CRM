"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Document } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { formatFileSize, getFileIcon, canPreview } from "@/lib/documents";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "@/lib/cloudinary-config";
import { getApiAuthHeaders } from "@/lib/api/client";
import { updateProject } from "@/lib/firebase/projects";
import {
  Upload,
  Download,
  Eye,
  Package,
  CheckCircle2,
  Send,
  X,
  AlertCircle,
  CheckCircle,
  FolderKanban,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeliverableStatus = "not_submitted" | "submitted" | "approved" | "needs_revision";

interface DeliverableFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  uploadedAt: string;
  uploadedBy: string;
  status: DeliverableStatus;
}

const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip";

const STATUS_CONFIG: Record<DeliverableStatus, { label: string; color: string; bg: string }> = {
  not_submitted: { label: "Not Submitted", color: "#6b7280", bg: "#F3F4F6" },
  submitted: { label: "Submitted", color: "#7c3aed", bg: "#EDE9FE" },
  approved: { label: "Approved", color: "#059669", bg: "#D1FAE5" },
  needs_revision: { label: "Needs Revision", color: "#d97706", bg: "#FEF3C7" },
};

interface DeliverablesTabProps {
  projectId: string;
  workspaceId: string;
  userId: string;
  onProjectUpdated: () => void;
  hasFinalPackage: boolean;
}

export default function DeliverablesTab({ projectId, workspaceId, userId, onProjectUpdated, hasFinalPackage }: DeliverablesTabProps) {
  const [deliverables, setDeliverables] = useState<DeliverableFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  const loadDeliverables = useCallback(async () => {
    try {
      // Fetch files tagged as deliverables (we use project files for simplicity)
      const res = await fetch(`/api/documents/list?projectId=${projectId}&workspaceId=${workspaceId}`, {
        headers: await getApiAuthHeaders(workspaceId),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDeliverables(
            data.documents.map((d: Record<string, unknown>) => ({
              id: d.id as string,
              fileName: d.fileName as string,
              fileType: d.fileType as string,
              fileSize: d.fileSize as number,
              cloudinaryUrl: d.cloudinaryUrl as string,
              cloudinaryPublicId: d.cloudinaryPublicId as string,
              uploadedAt: (d.createdAt as any)?.seconds
                ? new Date((d.createdAt as any).seconds * 1000).toISOString()
                : new Date().toISOString(),
              uploadedBy: d.uploadedBy as string,
              status: "not_submitted" as DeliverableStatus,
            }))
          );
        }
      }
    } catch {
      toast.error("Failed to load deliverables");
    } finally {
      setLoading(false);
    }
  }, [projectId, workspaceId]);

  useEffect(() => { loadDeliverables(); }, [loadDeliverables]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("File type not allowed. Use PDF, images, or documents.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);
      const headers = await getApiAuthHeaders(workspaceId);
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        headers: { ...headers, "x-workspace-id": workspaceId },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Deliverable uploaded");
      loadDeliverables();
    } catch {
      toast.error("Failed to upload deliverable");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleDeliverFinalPackage = async () => {
    try {
      await updateProject(projectId, {
        hasFinalPackage: true,
        finalPackageDelivered: true,
        showFinalPackageBanner: false,
      } as any);
      toast.success("Final package delivered");
      onProjectUpdated();
    } catch {
      toast.error("Failed to deliver package");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Deliverables</h3>
            <p className="text-xs text-muted-foreground">
              {deliverables.length} file{deliverables.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleUpload}
            className="hidden"
          />
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "Uploading..." : "Upload Deliverable"}
          </Button>
        </div>
      </div>

      {/* Final Package Banner */}
      {hasFinalPackage ? (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">Final Package Delivered</p>
            <p className="text-xs text-green-600/70">All deliverables have been sent to the client.</p>
          </div>
        </div>
      ) : deliverables.length > 0 && (
        <Button onClick={handleDeliverFinalPackage} className="gap-2 w-full sm:w-auto">
          <Send className="h-4 w-4" />
          Deliver Final Package
        </Button>
      )}

      {/* Deliverables list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (<Skeleton key={i} className="h-16 w-full rounded-lg" />))}
        </div>
      ) : deliverables.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <FolderKanban className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No deliverables yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Upload files to share with your client.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {deliverables.map((d) => {
            const FileIcon = getFileIcon(d.fileType);
            const statusCfg = STATUS_CONFIG[d.status] || STATUS_CONFIG.not_submitted;
            const canPrev = canPreview(d.fileType);

            return (
              <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors group">
                <div className="h-9 w-9 rounded bg-muted flex items-center justify-center shrink-0">
                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{d.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(d.fileSize)} &middot;{" "}
                    {new Date(d.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                  {statusCfg.label}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {canPrev && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setPreviewUrl(d.cloudinaryUrl); setPreviewName(d.fileName); }}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <a href={d.cloudinaryUrl} download={d.fileName} target="_blank" rel="noopener noreferrer">
                      <Download className="h-3.5 w-3.5" />
                    </a>
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
          <DialogHeader><DialogTitle className="truncate">{previewName}</DialogTitle></DialogHeader>
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
