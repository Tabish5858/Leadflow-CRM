"use client";

import { useState, useEffect, useCallback } from "react";
import { createTimeEntry, getProjectTimeEntries, deleteTimeEntry } from "@/lib/firebase/project-time-entries";
import type { ProjectTimeEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import {
  Clock,
  Plus,
  Trash2,
  Play,
  StopCircle,
  Timer,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

interface ProjectTimeTrackingProps {
  projectId: string;
  workspaceId: string;
  userId: string;
  members?: Array<{ userId: string; displayName: string; email: string; photoURL?: string | null }>;
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ProjectTimeTracking({ projectId, workspaceId, userId, members = [] }: ProjectTimeTrackingProps) {
  const [entries, setEntries] = useState<ProjectTimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Manual entry form
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("30");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerStart) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - timerStart) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerStart]);

  const loadEntries = useCallback(async () => {
    try {
      const data = await getProjectTimeEntries(projectId);
      setEntries(data);
    } catch {
      toast.error("Failed to load time entries");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const totalSeconds = entries.reduce((sum, e) => sum + e.totalTime, 0) + (timerRunning ? elapsed : 0);

  const handleStartTimer = () => {
    if (timerRunning) return;
    setTimerRunning(true);
    setTimerStart(Date.now());
    setElapsed(0);
  };

  const handleStopTimer = async () => {
    if (!timerRunning || !timerStart) return;
    setTimerRunning(false);
    const duration = Math.floor((Date.now() - timerStart) / 1000);

    setSaving(true);
    try {
      await createTimeEntry(projectId, workspaceId, userId, {
        memberId: userId,
        date: new Date(),
        startTime: new Date(timerStart),
        endTime: new Date(),
        totalTime: duration,
        description: description || "Timer entry",
      });
      toast.success("Time entry saved");
      setDescription("");
      setElapsed(0);
      loadEntries();
    } catch {
      toast.error("Failed to save time entry");
    } finally {
      setSaving(false);
    }
  };

  const handleAddManual = async () => {
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
    if (totalMinutes <= 0) {
      toast.error("Enter valid time");
      return;
    }

    setSaving(true);
    try {
      await createTimeEntry(projectId, workspaceId, userId, {
        memberId: userId,
        date: new Date(date),
        totalTime: totalMinutes * 60,
        description: description || "Manual entry",
      });
      toast.success("Time entry added");
      setShowAddForm(false);
      setHours("0");
      setMinutes("30");
      setDescription("");
      loadEntries();
    } catch {
      toast.error("Failed to add time entry");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      await deleteTimeEntry(entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      toast.success("Entry deleted");
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  return (
    <div className="space-y-6">
      {/* Timer + Total */}
      <div className="flex items-center justify-between p-5 rounded-lg border border-border bg-card">
        <div>
          <p className="text-xs text-muted-foreground">Total Tracked</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">{formatDuration(totalSeconds)}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Current Session</p>
            <p className="text-lg font-semibold text-foreground tabular-nums">
              {timerRunning ? formatDuration(elapsed) : "--:--:--"}
            </p>
          </div>
          {timerRunning ? (
            <Button onClick={handleStopTimer} disabled={saving} variant="default" size="sm" className="gap-1.5">
              <StopCircle className="h-4 w-4" /> Stop
            </Button>
          ) : (
            <Button onClick={handleStartTimer} variant="outline" size="sm" className="gap-1.5">
              <Play className="h-4 w-4" /> Start
            </Button>
          )}
        </div>
      </div>

      {/* Manual entry form */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Time Entries</h3>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-3.5 w-3.5" /> {showAddForm ? "Cancel" : "Add Entry"}
        </Button>
      </div>

      {showAddForm && (
        <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Hours</Label>
              <Input type="number" min="0" value={hours} onChange={(e) => setHours(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Minutes</Label>
              <Input type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(e.target.value)} className="h-8 text-xs" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What did you work on?" className="h-8 text-xs" />
          </div>
          <Button onClick={handleAddManual} disabled={saving} size="sm" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      )}

      {/* Entries list */}
      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => (<Skeleton key={i} className="h-14 w-full rounded-lg" />))}</div>
      ) : entries.length === 0 && !timerRunning ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <Timer className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No time entries yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Start the timer or add a manual entry.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors group">
              <div className="h-9 w-9 rounded bg-muted flex items-center justify-center shrink-0">
                {(() => {
                  const entryMember = members.find((m) => m.userId === (entry.memberId || ""));
                  return entryMember ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={entryMember.photoURL || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[9px]">{getInitials(entryMember.displayName)}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  );
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {entry.description || "Time entry"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.date ? formatDate(entry.date.toDate()) : "Unknown date"}
                  {(() => {
                    const entryMember = members.find((m) => m.userId === (entry.memberId || ""));
                    return entryMember ? <> \u00b7 {entryMember.displayName}</> : null;
                  })()}
                  {entry.billable && " \u00b7 Billable"}
                </p>
              </div>
              <span className="text-sm font-medium text-foreground tabular-nums">
                {formatDuration(entry.totalTime)}
              </span>
              <button
                onClick={() => handleDelete(entry.id)}
                className="opacity-0 group-hover:opacity-100 h-7 w-7 flex items-center justify-center rounded hover:bg-destructive/10 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
