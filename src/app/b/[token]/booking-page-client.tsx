"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, Loader2, Video } from "lucide-react";
import { toast } from "sonner";

interface BookingMeetingType {
  id: string;
  name: string;
  duration: number;
  description: string;
  videoTool: string;
  availability: {
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
    timezone: string;
  } | null;
  bookingToken: string;
}

interface BookingPageClientProps {
  token: string;
}

function generateTimeSlots(
  availability: BookingMeetingType["availability"],
  duration: number
): string[] {
  if (!availability) return [];
  const slots: string[] = [];
  const [startH, startM] = availability.startTime.split(":").map(Number);
  const [endH, endM] = availability.endTime.split(":").map(Number);
  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;

  for (let min = startMin; min + duration <= endMin; min += 30) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    slots.push(`${h12}:${m.toString().padStart(2, "0")} ${period}`);
  }

  return slots;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function BookingPageClient({ token }: BookingPageClientProps) {
  const [meetingType, setMeetingType] = useState<BookingMeetingType | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking form
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  // Fetch meeting type info
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/meetings/book/${token}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Booking not found");
          return;
        }
        const data = await res.json();
        setMeetingType(data.meetingType);
        setWorkspaceName(data.workspaceName);
      } catch {
        setError("Failed to load booking page");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Generate available dates
  useEffect(() => {
    if (!meetingType?.availability) return;
    const { daysOfWeek } = meetingType.availability;
    const dates: Date[] = [];
    const today = new Date();
    // Generate next 30 days
    for (let i = 1; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      if (daysOfWeek.includes(d.getDay())) {
        dates.push(d);
      }
    }
    setAvailableDates(dates);
    if (dates.length > 0) setSelectedDate(dates[0]);
  }, [meetingType]);

  const timeSlots =
    meetingType && selectedDate
      ? generateTimeSlots(meetingType.availability, meetingType.duration)
      : [];

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !name.trim() || !email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Parse time to ISO
    const [timeStr, period] = selectedTime.split(" ");
    const parts = timeStr.split(":").map(Number);
    let hours = parts[0];
    const minutes = parts[1] || 0;
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(hours, minutes, 0, 0);

    if (startDateTime <= new Date()) {
      toast.error("This time has already passed");
      return;
    }

    setBooking(true);
    try {
      const res = await fetch(`/api/meetings/book/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: startDateTime.toISOString(),
          name: name.trim(),
          email: email.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to book meeting");
        return;
      }

      setBooked(true);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBooking(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading booking page...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !meetingType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Calendar className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Booking Not Found</h2>
            <p className="text-sm text-muted-foreground text-center">
              {error || "This booking link is invalid or has been deactivated."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (booked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold">Meeting Booked!</h2>
            <p className="text-sm text-muted-foreground text-center">
              Your {meetingType.name} has been scheduled. Check your email for
              the calendar invitation.
            </p>
            <Badge variant="secondary" className="mt-2">
              {meetingType.duration} min
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="mx-auto max-w-4xl px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3">
            {workspaceName}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">
            Book a {meetingType.name}
          </h1>
          {meetingType.description && (
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              {meetingType.description}
            </p>
          )}
          <div className="flex items-center justify-center gap-3 mt-3">
            <Badge variant="secondary">
              <Clock className="mr-1 h-3 w-3" />
              {meetingType.duration} min
            </Badge>
            {meetingType.videoTool === "google_meet" && (
              <Badge variant="outline">
                <Video className="mr-1 h-3 w-3" />
                Google Meet
              </Badge>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Date picker */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select a Date</CardTitle>
              <CardDescription>
                Choose a day for your meeting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                {availableDates.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No available dates in the next 30 days
                  </p>
                ) : (
                  availableDates.map((date) => (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedTime("");
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedDate?.toDateString() === date.toDateString()
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                    >
                      {formatDate(date)}
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Time picker + form */}
          <div className="space-y-4">
            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select a Time</CardTitle>
                  <CardDescription>
                    {formatDate(selectedDate)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.length === 0 ? (
                      <p className="text-sm text-muted-foreground col-span-3 text-center py-4">
                        No available times on this day
                      </p>
                    ) : (
                      timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`px-2 py-2 rounded-md text-xs font-medium transition-colors ${
                            selectedTime === slot
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-accent"
                          }`}
                        >
                          {slot}
                        </button>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedTime && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Details</CardTitle>
                  <CardDescription>
                    We&apos;ll send the calendar invitation to this email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="book-name">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="book-name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="book-email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="book-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="book-notes">Notes (optional)</Label>
                    <Textarea
                      id="book-notes"
                      placeholder="Anything you'd like to discuss..."
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleBook}
                    disabled={
                      booking || !name.trim() || !email.trim()
                    }
                  >
                    {booking ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-1.5 h-4 w-4" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
