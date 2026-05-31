"use client";

import { Globe, Check, ChevronDown, Search } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { getCommonTimezones } from "./utils";

interface BookingTimezoneDropdownProps {
  value: string;
  onChange: (tz: string) => void;
  displayDate?: Date;
}

/** Simple IANA name extractor: "Asia/Karachi" → "Karachi" */
function shortName(tz: string): string {
  const parts = tz.split("/");
  return parts[parts.length - 1].replace(/_/g, " ");
}

/** Format offset like "+05:00" */
function formatOffset(tz: string, date: Date): string {
  try {
    const formatted = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "longOffset",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
    const match = formatted.match(/GMT([+-]\d{2}:\d{2})/);
    return match ? `GMT ${match[1]}` : "";
  } catch {
    return "";
  }
}

export function BookingTimezoneDropdown({
  value,
  onChange,
  displayDate,
}: BookingTimezoneDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const timezones = getCommonTimezones();
  const date = displayDate || new Date();

  const filtered = search.trim()
    ? timezones.filter((tz) =>
        tz.toLowerCase().includes(search.toLowerCase())
      )
    : timezones;

  const selectedShortName = shortName(value);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSelect = useCallback(
    (tz: string) => {
      onChange(tz);
      setOpen(false);
      setSearch("");
    },
    [onChange]
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-foreground hover:text-foreground/80 transition-colors"
      >
        <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span>{selectedShortName}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-[280px] bg-card border border-border rounded-xl shadow-elevated z-50 overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search timezone..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-0!"
            />
          </div>

          {/* List */}
          <div className="max-h-[240px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                No timezones found
              </div>
            ) : (
              filtered.map((tz) => {
                const selected = tz === value;
                const offset = formatOffset(tz, date);
                const name = shortName(tz);
                return (
                  <button
                    key={tz}
                    type="button"
                    onClick={() => handleSelect(tz)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                      selected
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="flex-1 truncate">
                      {name} <span className="text-muted-foreground text-xs">{offset}</span>
                    </span>
                    {selected && (
                      <Check className="h-3.5 w-3.5 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
