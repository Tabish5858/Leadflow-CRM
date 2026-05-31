"use client";

import { Loader2, AlertCircle, Clock } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AvailabilitySlot } from "./types";

export interface ColumnDayData {
  date: Date;
  slots: AvailabilitySlot[];
  loading: boolean;
  error: string | null;
}

interface BookingColumnViewProps {
  columns: ColumnDayData[];
  selectedTime: string;
  onSelectTime: (time: string) => void;
  onPrev: () => void;
  onNext: () => void;
  canSelectNext: boolean;
}

function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatSlotTime(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function BookingColumnView({
  columns,
  selectedTime,
  onSelectTime,
  onPrev,
  onNext,
  canSelectNext,
}: BookingColumnViewProps) {
  if (columns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Clock className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">No available dates</p>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-foreground">
          Select a time
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canSelectNext}
            className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {columns.map((col, idx) => (
          <div key={idx} className="border border-border rounded-xl p-4">
            {/* Date header */}
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {formatDateShort(col.date)}
            </h3>

            {/* Slots */}
            {col.loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : col.error ? (
              <div className="flex items-center gap-2 py-4 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{col.error}</span>
              </div>
            ) : col.slots.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  No available times
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {col.slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => onSelectTime(slot.time)}
                    className={`
                      w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border
                      ${
                        selectedTime === slot.time
                          ? "bg-foreground text-background border-foreground"
                          : "bg-transparent text-foreground border-border hover:bg-muted"
                      }
                    `}
                  >
                    {formatSlotTime(slot.time)}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
