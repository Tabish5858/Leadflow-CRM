"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BookingWeekViewProps {
  /** The Monday of the current week being viewed */
  weekStart: Date;
  selectedDate: Date | null;
  availableDates: Date[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onDayClick: (date: Date) => void;
  canSelectNextWeek: boolean;
}

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function BookingWeekView({
  weekStart,
  selectedDate,
  availableDates,
  onPrevWeek,
  onNextWeek,
  onDayClick,
  canSelectNextWeek,
}: BookingWeekViewProps) {
  // Generate the 7 days of the week starting from weekStart
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekStart]);

  const isDateAvailable = (date: Date) => {
    return availableDates.some(
      (d) =>
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
    );
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === date.getFullYear() &&
      selectedDate.getMonth() === date.getMonth() &&
      selectedDate.getDate() === date.getDate()
    );
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date.getTime() < today.getTime();
  };

  const weekLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).formatRange(weekDays[0], weekDays[6]);

  return (
    <div>
      {/* Week Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-foreground">{weekLabel}</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevWeek}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNextWeek}
            disabled={!canSelectNextWeek}
            className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Week Day Strip */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((dayName, i) => (
          <div
            key={dayName}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {dayName}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((date) => {
          const available = isDateAvailable(date);
          const selected = isDateSelected(date);
          const past = isPast(date);
          const dayNum = date.getDate();

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={!available || past}
              onClick={() => onDayClick(date)}
              className={`
                h-12 rounded-lg text-sm font-medium transition-all duration-150
                ${selected
                  ? "bg-foreground text-background font-semibold"
                  : available && !past
                    ? "bg-muted/70 hover:bg-muted text-foreground cursor-pointer"
                    : past
                      ? "text-muted-foreground/30 cursor-not-allowed"
                      : "text-muted-foreground/50 cursor-not-allowed"
                }
              `}
            >
              {dayNum}
              {available && !past && !selected && (
                <div className="h-1 w-1 rounded-full bg-foreground/60 mx-auto mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
