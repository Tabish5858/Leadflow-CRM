"use client";

import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import { Link as LinkIcon, Plus, Trash2, ExternalLink } from "lucide-react";
import type { Project, LinkEmbed } from "@/types";
import { updateProject } from "@/lib/firebase/projects";
import { toast } from "@/lib/toast";

interface LinksCardProps {
  project: Project;
  onProjectUpdated: () => void;
}

export default function LinksCard({ project, onProjectUpdated }: LinksCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAddLink = async () => {
    if (!title.trim() || !url.trim()) return;
    setSaving(true);
    try {
      const newLink: LinkEmbed = {
        id: `link-${Date.now()}`,
        type: "link",
        title: title.trim(),
        url: url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`,
        addedBy: "",
        addedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as Timestamp,
      };
      await updateProject(project.id, {
        linksAndEmbeds: [...(project.linksAndEmbeds || []), newLink],
      });
      toast.success("Link added");
      setTitle("");
      setUrl("");
      setShowForm(false);
      onProjectUpdated();
    } catch {
      toast.error("Failed to add link");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await updateProject(project.id, {
        linksAndEmbeds: (project.linksAndEmbeds || []).filter((l) => l.id !== linkId),
      });
      toast.success("Link removed");
      onProjectUpdated();
    } catch {
      toast.error("Failed to remove link");
    }
  };

  const links = project.linksAndEmbeds || [];

  return (
    <div
      style={{ borderRadius: "8px" }}
      className="flex flex-col p-5 w-full bg-card border border-border hover:border-foreground/20 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Links</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="h-6 w-6 rounded-full border border-border bg-card flex items-center justify-center hover:bg-accent"
        >
          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {showForm && (
        <div className="mb-3 space-y-2 p-3 border border-border rounded-lg bg-muted/30">
          <input
            placeholder="Link title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs bg-transparent border-0 border-b border-border pb-1 focus:outline-none focus:border-foreground"
            autoFocus
          />
          <input
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full text-xs bg-transparent border-0 border-b border-border pb-1 focus:outline-none focus:border-foreground"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowForm(false); setTitle(""); setUrl(""); }}
              className="text-[10px] px-2 py-1 text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleAddLink}
              disabled={saving || !title.trim() || !url.trim()}
              className="text-[10px] px-2 py-1 bg-foreground text-background rounded hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1.5 max-h-[200px] overflow-y-auto custom-scrollbar">
        {links.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">No links added</p>
        ) : (
          links.map((link) => (
            <div key={link.id} className="group flex items-center gap-2 p-2 rounded-lg hover:bg-accent/30 transition-colors">
              <LinkIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 text-xs font-medium text-foreground truncate hover:underline">
                {link.title}
              </a>
              <button
                onClick={() => handleDeleteLink(link.id)}
                className="opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
