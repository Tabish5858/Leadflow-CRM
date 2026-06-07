"use client";

import { useState } from "react";
import type { LinkEmbed } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Code, Eye, Copy, Check } from "lucide-react";

interface EmbedViewerModalProps {
  embed: LinkEmbed | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EmbedViewerModal({ embed, isOpen, onClose }: EmbedViewerModalProps) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!embed) return null;

  const handleCopyCode = async () => {
    if (embed.embedCode) {
      try {
        await navigator.clipboard.writeText(embed.embedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* ignore */ }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{embed.title || "Embed"}</DialogTitle>
            <div className="flex items-center gap-2">
              {embed.embedCode && (
                <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 bg-muted/30">
                  <button
                    onClick={() => setShowCode(false)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors ${!showCode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Eye className="h-3.5 w-3.5 inline mr-1" /> Preview
                  </button>
                  <button
                    onClick={() => setShowCode(true)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors ${showCode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Code className="h-3.5 w-3.5 inline mr-1" /> Code
                  </button>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {showCode && embed.embedCode ? (
            <div className="relative">
              <pre className="bg-muted/50 border border-border rounded-lg p-4 text-xs text-foreground overflow-x-auto whitespace-pre-wrap max-h-[400px]">
                {embed.embedCode}
              </pre>
              <button
                onClick={handleCopyCode}
                className="absolute top-2 right-2 p-1.5 rounded bg-background border border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                title="Copy code"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          ) : embed.embedCode ? (
            <div
              className="flex items-center justify-center min-h-[400px]"
              dangerouslySetInnerHTML={{ __html: embed.embedCode }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-muted-foreground">
              <Code className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No embed code available</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end px-6 py-3 border-t border-border shrink-0 bg-muted/10">
          <Button variant="default" size="sm" className="text-xs" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
