"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Lead } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { GripVertical, Building2, DollarSign } from "lucide-react";

interface KanbanCardProps {
  lead: Lead;
  isDragging?: boolean;
}

export function KanbanCard({ lead, isDragging }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:border-primary/20 cursor-grab active:cursor-grabbing",
        dragging && "shadow-lg ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 border">
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                {getInitials(`${lead.firstName} ${lead.lastName}`)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {lead.firstName} {lead.lastName}
              </p>
              {lead.company && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{lead.company}</span>
                </div>
              )}
            </div>
          </div>

          {/* Value */}
          {lead.value && lead.value > 0 && (
            <div className="flex items-center gap-1 text-xs font-semibold text-success">
              <DollarSign className="h-3 w-3" />
              {formatCurrency(lead.value, lead.currency)}
            </div>
          )}

          {/* Tags */}
          {lead.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {lead.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0"
                >
                  {tag}
                </Badge>
              ))}
              {lead.tags.length > 2 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  +{lead.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
