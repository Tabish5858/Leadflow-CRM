"use client";

import { Clock } from "lucide-react";
import { BookingMeetingType } from "./types";
import { formatDate, formatSlotWithTz } from "./utils";
import { BookingTimezoneDropdown } from "./BookingTimezoneDropdown";

interface BookingInfoPanelProps {
  meetingType: BookingMeetingType;
  workspaceName: string;
  selectedDate: Date | null;
  selectedTime: string | null;
  displayTimezone: string;
  onTimezoneChange?: (tz: string) => void;
}

function GoogleMeetIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="100"
      height="100"
      viewBox="0 0 48 48"
    >
      <rect
        width="16"
        height="16"
        x="12"
        y="16"
        fill="#fff"
        transform="rotate(-90 20 24)"
      />
      <polygon fill="#1e88e5" points="3,17 3,31 8,32 13,31 13,17 8,16" />
      <path
        fill="#4caf50"
        d="M37,24v14c0,1.657-1.343,3-3,3H13l-1-5l1-5h14v-7l5-1L37,24z"
      />
      <path
        fill="#fbc02d"
        d="M37,10v14H27v-7H13l-1-5l1-5h21C35.657,7,37,8.343,37,10z"
      />
      <path
        fill="#1565c0"
        d="M13,31v10H6c-1.657,0-3-1.343-3-3v-7H13z"
      />
      <polygon fill="#e53935" points="13,7 13,17 3,17" />
      <polygon
        fill="#2e7d32"
        points="38,24 37,32.45 27,24 37,15.55"
      />
      <path
        fill="#4caf50"
        d="M46,10.11v27.78c0,0.84-0.98,1.31-1.63,0.78L37,32.45v-16.9l7.37-6.22C45.02,8.8,46,9.27,46,10.11z"
      />
    </svg>
  );
}

export function BookingInfoPanel({
  meetingType,
  workspaceName,
  selectedDate,
  selectedTime,
  displayTimezone,
  onTimezoneChange,
}: BookingInfoPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo / Avatar */}
      <div className="mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="text-lg font-bold text-primary">
            {workspaceName?.charAt(0) || "M"}
          </span>
        </div>
      </div>

      {/* Workspace Name */}
      <p className="text-sm text-primary font-medium mb-1">{workspaceName}</p>

      {/* Meeting Title */}
      <h1 className="text-2xl font-bold text-foreground mb-3">
        {meetingType.name}
      </h1>

      {/* Description */}
      {meetingType.description && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {meetingType.description}
        </p>
      )}

      {/* Selected Date & Time (shown after time selection, replacing empty space) */}
      {selectedDate && selectedTime && (
        <div className="mb-6 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{formatDate(selectedDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <span className="ml-6">
              {formatSlotWithTz(selectedTime, displayTimezone, selectedDate)} ·{" "}
              {meetingType.duration} min
            </span>
          </div>
        </div>
      )}

      {/* Duration */}
      <div className="flex items-center gap-2 text-sm text-foreground mb-3">
        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
        <span>{meetingType.duration}m</span>
      </div>

      {/* Video Tool */}
      {meetingType.videoTool === "google_meet" && (
        <div className="flex items-center gap-2 text-sm text-foreground mb-4">
          <GoogleMeetIcon className="h-5 w-5" />
          <span className="capitalize">
            {meetingType.videoTool.replace(/_/g, " ")}
          </span>
        </div>
      )}

      {/* Timezone Dropdown */}
      <div className="mt-auto pt-4 border-t border-border">
        <BookingTimezoneDropdown
          value={displayTimezone}
          onChange={(tz) => onTimezoneChange?.(tz)}
          displayDate={selectedDate || undefined}
        />
      </div>
    </div>
  );
}
