"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, List, Columns3 } from "lucide-react";
import { generateMonthCalendar } from "./utils";

type ViewMode = "month" | "week" | "column";

interface BookingCalendarProps {
  calendarYear: number;
  calendarMonth: number;
  selectedDate: Date | null;
  availableDates: Date[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (day: number) => void;
  canSelectNextMonth: boolean;
}

export function BookingCalendar({
  calendarYear,
  calendarMonth,
  selectedDate,
  availableDates,
  onPrevMonth,
  onNextMonth,
  onDayClick,
  canSelectNextMonth,
}: BookingCalendarProps) {
  const calendarGrid = generateMonthCalendar(calendarYear, calendarMonth);
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  // Reset to month view on mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    if (mq.matches) setViewMode("month");
  }, []);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(calendarYear, calendarMonth));

  const isDateAvailable = (day: number) => {
    return availableDates.some(
      (d) =>
        d.getFullYear() === calendarYear &&
        d.getMonth() === calendarMonth &&
        d.getDate() === day
    );
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === calendarYear &&
      selectedDate.getMonth() === calendarMonth &&
      selectedDate.getDate() === day
    );
  };

  const isPast = (day: number) => {
    const today = new Date();
    return (
      calendarYear < today.getFullYear() ||
      (calendarYear === today.getFullYear() &&
        calendarMonth < today.getMonth()) ||
      (calendarYear === today.getFullYear() &&
        calendarMonth === today.getMonth() &&
        day < today.getDate())
    );
  };

  return (
    <div>
      {/* View Mode Toggle + Month Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {/* Layout toggle (hidden on mobile) */}
          <div className="hidden md:flex items-center rounded-lg border border-border p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "month"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Monthly view"
            >
              <CalendarDays className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "week"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Weekly view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("column")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "column"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Column view"
            >
              <Columns3 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevMonth}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-sm font-semibold text-foreground min-w-[140px] text-center">
            {monthLabel}
          </h2>
          <button
            type="button"
            onClick={onNextMonth}
            disabled={!canSelectNextMonth}
            className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarGrid.flat().map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="h-12" />;
          }

          const available = isDateAvailable(day);
          const selected = isDateSelected(day);
          const past = isPast(day);

          return (
            <button
              key={`day-${day}`}
              type="button"
              disabled={!available || past}
              onClick={() => onDayClick(day)}
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
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
