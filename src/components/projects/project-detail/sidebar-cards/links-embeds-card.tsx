"use client";

import { useState } from "react";
import { Link as LinkIcon, Code, ExternalLink, Plus, Trash2 } from "lucide-react";
import type { Project, LinkEmbed } from "@/types";
import { updateProject } from "@/lib/firebase/projects";
import { toast } from "@/lib/toast";
import { EmbedViewerModal } from "@/components/projects/shared/embed-viewer-modal";

interface LinksEmbedsCardProps {
  project: Project;
  onProjectUpdated?: () => void;
  canEdit?: boolean;
}

export default function LinksEmbedsCard({ project, onProjectUpdated, canEdit = true }: LinksEmbedsCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"link" | "embed">("link");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [embedCode, setEmbedCode] = useState("");
  const [saving, setSaving] = useState(false);

  // Embed viewer
  const [viewingEmbed, setViewingEmbed] = useState<LinkEmbed | null>(null);
  const [showEmbedModal, setShowEmbedModal] = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) return;
    if (formType === "link" && !url.trim()) return;
    if (formType === "embed" && !embedCode.trim()) return;
    setSaving(true);
    try {
      const newItem: LinkEmbed = {
        id: `${formType}-${Date.now()}`,
        type: formType,
        title: title.trim(),
        url: formType === "link"
          ? (url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`)
          : undefined,
        embedCode: formType === "embed" ? embedCode.trim() : undefined,
        addedBy: "",
        addedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as import("firebase/firestore").Timestamp,
      };
      await updateProject(project.id, {
        linksAndEmbeds: [...(project.linksAndEmbeds || []), newItem],
      });
      toast.success(formType === "link" ? "Link added" : "Embed added");
      setTitle("");
      setUrl("");
      setEmbedCode("");
      setShowForm(false);
      onProjectUpdated?.();
    } catch {
      toast.error("Failed to add");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await updateProject(project.id, {
        linksAndEmbeds: (project.linksAndEmbeds || []).filter((l) => l.id !== itemId),
      });
      toast.success("Removed");
      onProjectUpdated?.();
    } catch {
      toast.error("Failed to remove");
    }
  };

  const items = project.linksAndEmbeds || [];

  return (
    <>
      <div className="flex flex-col p-5 w-full bg-card border border-border hover:border-foreground/20 transition-colors" style={{ borderRadius: "8px" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Links &amp; Embeds</h3>
          </div>
          {canEdit && (
            <div className="relative">
              <button
                onClick={() => { setShowForm(!showForm); setFormType("link"); }}
                className="h-6 w-6 rounded-full border border-border bg-card flex items-center justify-center hover:bg-accent"
                title="Add link or embed"
              >
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>

        {showForm && canEdit && (
          <div className="mb-3 space-y-2 p-3 border border-border rounded-lg bg-muted/30">
            <div className="flex gap-1 border-b border-border pb-2">
              <button
                onClick={() => setFormType("link")}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${formType === "link" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Link
              </button>
              <button
                onClick={() => setFormType("embed")}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${formType === "embed" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Embed
              </button>
            </div>
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs bg-transparent border-0 border-b border-border pb-1 focus:outline-none focus:border-foreground"
              autoFocus
            />
            {formType === "link" ? (
              <input
                placeholder="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full text-xs bg-transparent border-0 border-b border-border pb-1 focus:outline-none focus:border-foreground"
              />
            ) : (
              <textarea
                placeholder="Paste embed code (HTML/iframe)..."
                value={embedCode}
                onChange={(e) => setEmbedCode(e.target.value)}
                rows={3}
                className="w-full text-xs bg-transparent border-0 border-b border-border pb-1 focus:outline-none focus:border-foreground resize-none"
              />
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowForm(false); setTitle(""); setUrl(""); setEmbedCode(""); }}
                className="text-[10px] px-2 py-1 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !title.trim() || (formType === "link" && !url.trim()) || (formType === "embed" && !embedCode.trim())}
                className="text-[10px] px-2 py-1 bg-foreground text-background rounded hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1.5 max-h-[250px] overflow-y-auto custom-scrollbar">
          {items.length === 0 ? (
            canEdit ? (
              <button
                onClick={() => { setShowForm(true); setFormType("link"); }}
                className="w-full py-3 border-2 border-dashed border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                <Plus className="h-4 w-4 mx-auto mb-1" />
                Add Link or Embed
              </button>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-3">No links or embeds</p>
            )
          ) : (
            items.map((item) => (
              <div key={item.id} className="group flex items-center gap-2 p-2 rounded-lg hover:bg-accent/30 transition-colors">
                {item.type === "embed" ? (
                  <Code className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                ) : (
                  <LinkIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
                {item.type === "link" ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-0 text-xs font-medium text-foreground truncate hover:underline"
                  >
                    {item.title}
                  </a>
                ) : (
                  <button
                    onClick={() => { setViewingEmbed(item); setShowEmbedModal(true); }}
                    className="flex-1 min-w-0 text-xs font-medium text-foreground truncate text-left hover:underline"
                  >
                    {item.title}
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded hover:bg-destructive/10 shrink-0"
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <EmbedViewerModal embed={viewingEmbed} isOpen={showEmbedModal} onClose={() => { setShowEmbedModal(false); setViewingEmbed(null); }} />
    </>
  );
}
