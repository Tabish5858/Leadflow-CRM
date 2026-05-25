"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface MeetingTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  workspaceId: string;
  onSaved: () => void;
}

const DURATIONS = [15, 30, 45, 60, 90, 120];
const BUFFER_TIMES = [0, 5, 10, 15, 30];

export function MeetingTypeDialog({
  open,
  onOpenChange,
  userId,
  workspaceId,
  onSaved,
}: MeetingTypeDialogProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("30");
  const [bufferTime, setBufferTime] = useState("0");
  const [videoTool, setVideoTool] = useState<"google_meet" | "none">("google_meet");
  const [description, setDescription] = useState("");
  const [enableBooking, setEnableBooking] = useState(false);
  const [bookingStart, setBookingStart] = useState("09:00");
  const [bookingEnd, setBookingEnd] = useState("17:00");
  const [bookingDays, setBookingDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri

  useEffect(() => {
    if (!open) return;
    setName("");
    setDuration("30");
    setBufferTime("0");
    setVideoTool("google_meet");
    setDescription("");
    setEnableBooking(false);
    setBookingStart("09:00");
    setBookingEnd("17:00");
    setBookingDays([1, 2, 3, 4, 5]);
  }, [open]);

  const toggleDay = (day: number) => {
    setBookingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Meeting type name is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/meetings/types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
          "x-workspace-id": workspaceId,
        },
        body: JSON.stringify({
          name: name.trim(),
          duration: parseInt(duration, 10),
          bufferTime: parseInt(bufferTime, 10),
          videoTool,
          description: description.trim(),
          availability: enableBooking
            ? {
                daysOfWeek: bookingDays,
                startTime: bookingStart,
                endTime: bookingEnd,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              }
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create meeting type");
        return;
      }

      toast.success("Meeting type created");
      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Meeting Type</DialogTitle>
          <DialogDescription>
            Template for recurring meeting types (e.g. Discovery Call, Demo, Follow-up)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="mt-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mt-name"
              placeholder="e.g. Discovery Call"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mt-duration">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="mt-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mt-buffer">Buffer Time</Label>
              <Select value={bufferTime} onValueChange={setBufferTime}>
                <SelectTrigger id="mt-buffer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUFFER_TIMES.map((b) => (
                    <SelectItem key={b} value={String(b)}>
                      {b === 0 ? "None" : `${b} min`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mt-video">Video Conferencing</Label>
            <Select
              value={videoTool}
              onValueChange={(v) => setVideoTool(v as "google_meet" | "none")}
            >
              <SelectTrigger id="mt-video">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google_meet">Google Meet</SelectItem>
                <SelectItem value="none">None (in-person)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mt-desc">Description (optional)</Label>
            <Textarea
              id="mt-desc"
              placeholder="Describe what this meeting type is for..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Booking page settings */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Public Booking Page</Label>
                <p className="text-xs text-muted-foreground">
                  Allow leads to self-schedule using this meeting type
                </p>
              </div>
              <Switch
                checked={enableBooking}
                onCheckedChange={setEnableBooking}
              />
            </div>

            {enableBooking && (
              <div className="space-y-3 pt-2 border-t">
                <div>
                  <Label className="text-xs font-medium">Available Days</Label>
                  <div className="flex gap-1.5 mt-1.5">
                    {DAY_LABELS.map((label, day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`h-8 w-10 rounded-md text-xs font-medium transition-colors ${
                          bookingDays.includes(day)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Start Time</Label>
                    <Input
                      type="time"
                      value={bookingStart}
                      onChange={(e) => setBookingStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">End Time</Label>
                    <Input
                      type="time"
                      value={bookingEnd}
                      onChange={(e) => setBookingEnd(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" />
                Create Meeting Type
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
