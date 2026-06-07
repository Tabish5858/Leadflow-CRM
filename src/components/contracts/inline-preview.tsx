"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, X, ZoomIn, ZoomOut } from "lucide-react";

interface InlinePreviewProps {
  open: boolean;
  onClose: () => void;
  url: string;
  fileName: string;
  fileType: string;
  mimeType: string;
}

export function InlinePreview({
  open,
  onClose,
  url,
  fileName,
  fileType,
  mimeType,
}: InlinePreviewProps) {
  const [zoom, setZoom] = useState(1);

  const isImage = mimeType?.startsWith("image/");
  const isPdf = fileType === "pdf" || mimeType?.includes("pdf");
  const isVideo = mimeType?.startsWith("video/");
  const isAudio = mimeType?.startsWith("audio/");
  const isText = mimeType?.startsWith("text/") || fileType === "text" || fileType === "code";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-row items-center justify-between">
          <DialogTitle className="truncate text-base">{fileName}</DialogTitle>
          <div className="flex items-center gap-2">
            {(isImage || isPdf) && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Open
              </a>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href={url} download={fileName}>
                <Download className="h-3.5 w-3.5" />
                Download
              </a>
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto rounded-lg border bg-muted/20 p-4 flex items-center justify-center min-h-[400px]">
          {isImage ? (
            <img
              src={url}
              alt={fileName}
              style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
              className="max-w-full max-h-[70vh] transition-transform duration-200"
            />
          ) : isPdf ? (
            <iframe
              src={`${url}#view=FitH`}
              className="w-full h-[70vh] rounded"
              title={fileName}
            />
          ) : isVideo ? (
            <video controls className="max-w-full max-h-[70vh]" src={url}>
              Your browser does not support video playback.
            </video>
          ) : isAudio ? (
            <audio controls src={url} className="w-full max-w-md">
              Your browser does not support audio playback.
            </audio>
          ) : isText ? (
            <object data={url} type={mimeType} className="w-full h-[70vh] rounded bg-white">
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-8">
                <p className="text-sm">Preview not available inline.</p>
                <Button variant="outline" size="sm" asChild>
                  <a href={url} target="_blank" rel="noopener noreferrer">Open file</a>
                </Button>
              </div>
            </object>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground p-8">
              <p className="text-sm">Preview not available for this file type.</p>
              <Button variant="outline" size="sm" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">Open file</a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
