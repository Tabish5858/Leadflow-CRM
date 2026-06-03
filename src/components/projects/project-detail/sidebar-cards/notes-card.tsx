"use client";

import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { ProjectNote, WorkspaceMember } from "@/types";

interface NotesCardProps {
  notes: ProjectNote[];
  onCreateNote: (data: { title: string; content: string }) => void;
  onDeleteNote: (noteId: string) => void;
}

export default function NotesCard({ notes, onCreateNote, onDeleteNote }: NotesCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenuId) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenuId]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onCreateNote({ title: title.trim(), content: content.trim() });
    setTitle("");
    setContent("");
    setShowForm(false);
  };

  return (
    <div
      style={{ borderRadius: "8px" }}
      className="flex flex-col p-5 w-full bg-card border border-border hover:border-foreground/20 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Notes</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="h-6 w-6 rounded-full border border-border bg-card flex items-center justify-center hover:bg-accent"
          title="Add note"
        >
          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Inline add form */}
      {showForm && (
        <div className="mb-3 space-y-2 p-3 border border-border rounded-lg bg-muted/30">
          <input
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs bg-transparent border-0 border-b border-border pb-1 focus:outline-none focus:border-foreground"
            autoFocus
          />
          <textarea
            placeholder="Write your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            className="w-full text-xs bg-transparent border-0 resize-none focus:outline-none placeholder:text-muted-foreground/50"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowForm(false); setTitle(""); setContent(""); }}
              className="text-[10px] px-2 py-1 text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="text-[10px] px-2 py-1 bg-foreground text-background rounded hover:opacity-90 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
        {notes.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">
            No notes yet
          </p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="group relative p-2.5 border border-border rounded-lg hover:bg-accent/30 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{note.title}</p>
                  {note.content && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{note.content}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {note.createdAt?.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === note.id ? null : note.id); }}
                    className="opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded hover:bg-muted transition-opacity"
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                  </button>
                  {openMenuId === note.id && (
                    <div className="absolute right-0 top-6 bg-popover border border-border rounded-md shadow-lg z-50 py-1 min-w-[100px]">
                      <button
                        onClick={() => { onDeleteNote(note.id); setOpenMenuId(null); }}
                        className="w-full px-3 py-1.5 text-left text-[11px] text-destructive hover:bg-destructive/10 flex items-center gap-2"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
