"use client";

import { useState, useEffect, useCallback } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { MeetingTypeDialog } from "@/components/meetings/meeting-type-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Copy,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { MeetingType } from "@/lib/firebase/meeting-types";

const BOOKING_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function MeetingTypesPage() {
  const { user, activeWorkspace, loading: wsLoading } = useWorkspace();
  const { canAccess } = usePermissions();

  const [types, setTypes] = useState<MeetingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadTypes = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    setLoading(true);
    setError(null);
    try {
      const { getMeetingTypes } = await import(
        "@/lib/firebase/meeting-types"
      );
      const data = await getMeetingTypes(activeWorkspace.id);
      setTypes(data);
    } catch {
      setError("Failed to load meeting types");
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => {
    loadTypes();
  }, [loadTypes]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/meetings/types/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-id": user?.id || "",
          "x-workspace-id": activeWorkspace?.id || "",
        },
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete");
        return;
      }
      setTypes((prev) => prev.filter((t) => t.id !== id));
      toast.success("Meeting type deleted");
    } catch {
      toast.error("Failed to delete meeting type");
    } finally {
      setDeleting(null);
    }
  };

  const copyBookingLink = (token: string) => {
    const url = `${BOOKING_BASE_URL}/b/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Booking link copied to clipboard");
  };

  if (wsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!canAccess("meetings")) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground">Access denied</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Meeting Types
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Templates for recurring meeting types and booking pages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={loadTypes}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Type
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-40 gap-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={loadTypes}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && types.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">No meeting types yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create templates for recurring meetings like Discovery Calls,
                Demos, or Follow-ups
              </p>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Create Meeting Type
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && types.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((type) => (
            <Card key={type.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{type.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {type.description || "No description"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    disabled={deleting === type.id}
                    onClick={() => handleDelete(type.id)}
                  >
                    {deleting === type.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">{type.duration} min</Badge>
                  {type.bufferTime > 0 && (
                    <Badge variant="outline">
                      {type.bufferTime}min buffer
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {type.videoTool === "google_meet"
                      ? "Google Meet"
                      : "In-person"}
                  </Badge>
                </div>

                {type.bookingToken && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => copyBookingLink(type.bookingToken)}
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Copy Booking Link
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {user && activeWorkspace && (
        <MeetingTypeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          userId={user.id}
          workspaceId={activeWorkspace.id}
          onSaved={loadTypes}
        />
      )}
    </div>
  );
}
