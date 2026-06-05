"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWorkspace } from "@/contexts/workspace-context";
import { SpreadsheetEditor } from "@/components/leads/spreadsheet-editor";
import { getSpreadsheet } from "@/lib/firebase/spreadsheets";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import type { IWorkbookData } from "@univerjs/core";

export default function SpreadsheetEditorPage() {
  const params = useParams();
  const { activeWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [spreadsheetData, setSpreadsheetData] = useState<{
    name: string;
    snapshot: IWorkbookData | null;
  } | null>(null);

  const spreadsheetId = params?.id as string;

  useEffect(() => {
    if (!activeWorkspace || !spreadsheetId) return;
    setLoading(true);
    getSpreadsheet(activeWorkspace.id, spreadsheetId)
      .then((data) => {
        if (!data) {
          setNotFound(true);
          return;
        }
        setSpreadsheetData({
          name: data.name,
          snapshot: data.snapshot,
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [activeWorkspace?.id, spreadsheetId]);

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[70vh] w-full rounded-lg" />
      </div>
    );
  }

  if (notFound || !spreadsheetData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium">Spreadsheet not found</p>
        <p className="text-sm text-muted-foreground mt-1">
          This spreadsheet may have been deleted.
        </p>
      </div>
    );
  }

  return (
    <div>
      <SpreadsheetEditor
        workspaceId={activeWorkspace.id}
        spreadsheetId={spreadsheetId}
        initialName={spreadsheetData.name}
        initialSnapshot={spreadsheetData.snapshot}
      />
    </div>
  );
}
