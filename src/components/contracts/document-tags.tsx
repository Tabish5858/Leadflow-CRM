"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, X, Tag } from "lucide-react";

interface DocumentTagsProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  editable?: boolean;
}

const PRESET_TAGS = [
  "Contract", "Invoice", "Proposal", "Report",
  "Design", "Screenshot", "Receipt", "Legal",
  "Internal", "Client-Facing", "Archive",
];

export function DocumentTags({
  tags,
  onAddTag,
  onRemoveTag,
  editable = true,
}: DocumentTagsProps) {
  const [newTag, setNewTag] = useState("");
  const [open, setOpen] = useState(false);

  const handleAddCustom = () => {
    const tag = newTag.trim().toLowerCase();
    if (!tag || tags.includes(tag)) return;
    onAddTag(tag);
    setNewTag("");
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 text-xs">
          <Tag className="h-3 w-3" />
          {tag}
          {editable && (
            <button
              onClick={() => onRemoveTag(tag)}
              className="ml-0.5 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
      {editable && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs text-muted-foreground">
              <Plus className="h-3 w-3" />
              Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium mb-2">Preset tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TAGS.filter((t) => !tags.includes(t.toLowerCase())).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => { onAddTag(tag.toLowerCase()); setOpen(false); }}
                      className="px-2 py-1 text-xs rounded-md border hover:bg-muted transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t pt-2">
                <p className="text-xs font-medium mb-2">Custom tag</p>
                <div className="flex gap-1">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Tag name"
                    className="h-8 text-xs"
                    onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                  />
                  <Button size="sm" className="h-8" onClick={handleAddCustom} disabled={!newTag.trim()}>
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

// ─── Category Selector ────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "", label: "No category" },
  { value: "document", label: "Document" },
  { value: "image", label: "Image" },
  { value: "spreadsheet", label: "Spreadsheet" },
  { value: "presentation", label: "Presentation" },
  { value: "contract", label: "Contract" },
  { value: "invoice", label: "Invoice" },
  { value: "design", label: "Design" },
  { value: "archive", label: "Archive" },
];

interface DocumentCategoryProps {
  value: string;
  onChange: (category: string) => void;
  editable?: boolean;
}

export function DocumentCategory({
  value,
  onChange,
  editable = true,
}: DocumentCategoryProps) {
  if (!editable) {
    if (!value) return null;
    return <Badge variant="outline" className="text-xs">{value}</Badge>;
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
    >
      {CATEGORIES.map((cat) => (
        <option key={cat.value} value={cat.value}>
          {cat.label}
        </option>
      ))}
    </select>
  );
}
