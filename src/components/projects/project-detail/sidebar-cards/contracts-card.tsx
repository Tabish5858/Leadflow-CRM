"use client";

import { FileText, Plus } from "lucide-react";

interface ContractsCardProps {
  projectId: string;
}

export default function ContractsCard({}: ContractsCardProps) {
  return (
    <div
      style={{ borderRadius: "8px" }}
      className="flex flex-col p-5 w-full bg-card border border-border hover:border-foreground/20 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Contracts</h3>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center py-3">
        No contracts linked to this project
      </p>
    </div>
  );
}
