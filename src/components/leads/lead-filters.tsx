"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Filter,
  X,
  ChevronDown,
} from "lucide-react";
import {
  type FilterState,
  DEFAULT_FILTERS,
  getActiveFilterCount,
  getActiveFilterBadges,
} from "@/lib/lead-filters";
import type { PipelineStage } from "@/types";

interface LeadFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  stages: PipelineStage[];
  sources: string[];
  niches: string[];
  statusLabels?: Record<string, string>;
}

export function LeadFilters({
  filters,
  onFilterChange,
  stages,
  sources,
  niches,
  statusLabels,
}: LeadFiltersProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const handleApply = useCallback(() => {
    onFilterChange(localFilters);
    setOpen(false);
  }, [localFilters, onFilterChange]);

  const handleReset = useCallback(() => {
    setLocalFilters(DEFAULT_FILTERS);
    onFilterChange(DEFAULT_FILTERS);
  }, [onFilterChange]);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: "status" | "source" | "niche", value: string) => {
    setLocalFilters((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const activeCount = getActiveFilterCount(filters);
  const badges = getActiveFilterBadges(filters, statusLabels);

  const removeBadge = (key: keyof FilterState, value?: string) => {
    if (key === "search") {
      updateFilter("search", "");
      onFilterChange({ ...filters, search: "" });
    } else if (key === "country") {
      updateFilter("country", "");
      onFilterChange({ ...filters, country: "" });
    } else if (key === "valueMin") {
      updateFilter("valueMin", "");
      updateFilter("valueMax", "");
      onFilterChange({ ...filters, valueMin: "", valueMax: "" });
    } else if (key === "assigned") {
      updateFilter("assigned", "");
      onFilterChange({ ...filters, assigned: "" });
    } else if (value && (key === "status" || key === "source" || key === "niche")) {
      const newArr = filters[key].filter((v) => v !== value);
      updateFilter(key, newArr);
      onFilterChange({ ...filters, [key]: newArr });
    }
  };

  return (
    <div className="space-y-3">
      {/* Filter badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active:</span>
          {badges.map((badge, i) => (
            <Badge
              key={`${badge.key}-${badge.value}-${i}`}
              variant="secondary"
              className="gap-1 pr-1"
            >
              <span className="text-xs">
                {badge.label}: {badge.value}
              </span>
              <button
                onClick={() => removeBadge(badge.key, badge.value)}
                className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                aria-label={`Remove ${badge.label} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleReset}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filter popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {activeCount}
              </span>
            )}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Filters</h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {stages.map((stage) => (
                  <label
                    key={stage.id}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={localFilters.status.includes(stage.id)}
                      onCheckedChange={() => toggleArrayFilter("status", stage.id)}
                    />
                    <span className="flex items-center gap-1.5">
                      {stage.color && (
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                      )}
                      {statusLabels?.[stage.id] || stage.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Source */}
            {sources.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Source</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {sources.map((source) => (
                    <label
                      key={source}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={localFilters.source.includes(source)}
                        onCheckedChange={() => toggleArrayFilter("source", source)}
                      />
                      {source}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Niche */}
            {niches.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Niche / Industry</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {niches.map((niche) => (
                    <label
                      key={niche}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={localFilters.niche.includes(niche)}
                        onCheckedChange={() => toggleArrayFilter("niche", niche)}
                      />
                      {niche}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Country */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <Input
                placeholder="Search country..."
                value={localFilters.country}
                onChange={(e) => updateFilter("country", e.target.value)}
                className="h-8"
              />
            </div>

            {/* Value range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Value Range</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={localFilters.valueMin}
                  onChange={(e) => updateFilter("valueMin", e.target.value)}
                  className="h-8"
                  min={0}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={localFilters.valueMax}
                  onChange={(e) => updateFilter("valueMax", e.target.value)}
                  className="h-8"
                  min={0}
                />
              </div>
            </div>

            {/* Assigned to */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Assigned To</label>
              <Input
                placeholder="User ID or name..."
                value={localFilters.assigned}
                onChange={(e) => updateFilter("assigned", e.target.value)}
                className="h-8"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" className="flex-1" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
