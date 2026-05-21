import type { Lead } from "@/types";

export interface FilterState {
  search: string;
  status: string[];
  source: string[];
  niche: string[];
  country: string;
  valueMin: string;
  valueMax: string;
  assigned: string;
}

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  status: [],
  source: [],
  niche: [],
  country: "",
  valueMin: "",
  valueMax: "",
  assigned: "",
};

export function filtersToUrlParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.status.length > 0) params.set("status", filters.status.join(","));
  if (filters.source.length > 0) params.set("source", filters.source.join(","));
  if (filters.niche.length > 0) params.set("niche", filters.niche.join(","));
  if (filters.country) params.set("country", filters.country);
  if (filters.valueMin) params.set("valueMin", filters.valueMin);
  if (filters.valueMax) params.set("valueMax", filters.valueMax);
  if (filters.assigned) params.set("assigned", filters.assigned);

  return params;
}

export function urlParamsToFilters(params: URLSearchParams): FilterState {
  return {
    search: params.get("search") || "",
    status: params.get("status")
      ? params.get("status")!.split(",").filter(Boolean)
      : [],
    source: params.get("source")
      ? params.get("source")!.split(",").filter(Boolean)
      : [],
    niche: params.get("niche")
      ? params.get("niche")!.split(",").filter(Boolean)
      : [],
    country: params.get("country") || "",
    valueMin: params.get("valueMin") || "",
    valueMax: params.get("valueMax") || "",
    assigned: params.get("assigned") || "",
  };
}

export function applyFilters(leads: Lead[], filters: FilterState): Lead[] {
  let result = leads;

  // Search across multiple fields
  if (filters.search.trim()) {
    const term = filters.search.toLowerCase();
    result = result.filter(
      (lead) =>
        lead.firstName.toLowerCase().includes(term) ||
        lead.lastName.toLowerCase().includes(term) ||
        lead.email.toLowerCase().includes(term) ||
        (lead.company?.toLowerCase().includes(term) ?? false) ||
        (lead.phone?.toLowerCase().includes(term) ?? false) ||
        (lead.notes?.toLowerCase().includes(term) ?? false)
    );
  }

  // Status filter (multi-select)
  if (filters.status.length > 0) {
    result = result.filter((lead) => filters.status.includes(lead.status));
  }

  // Source filter (multi-select)
  if (filters.source.length > 0) {
    result = result.filter(
      (lead) => lead.source && filters.source.includes(lead.source)
    );
  }

  // Niche filter (multi-select)
  if (filters.niche.length > 0) {
    result = result.filter(
      (lead) => lead.niche && filters.niche.includes(lead.niche)
    );
  }

  // Country filter (case-insensitive includes)
  if (filters.country.trim()) {
    const countryTerm = filters.country.toLowerCase();
    result = result.filter(
      (lead) =>
        lead.country?.toLowerCase().includes(countryTerm) ?? false
    );
  }

  // Value range filter
  const minVal = filters.valueMin ? Number(filters.valueMin) : undefined;
  const maxVal = filters.valueMax ? Number(filters.valueMax) : undefined;

  if (minVal !== undefined || maxVal !== undefined) {
    result = result.filter((lead) => {
      if (lead.value === null || lead.value === undefined) return false;
      if (minVal !== undefined && lead.value < minVal) return false;
      if (maxVal !== undefined && lead.value > maxVal) return false;
      return true;
    });
  }

  // Assigned filter (exact match)
  if (filters.assigned.trim()) {
    const assignedTerm = filters.assigned.toLowerCase();
    result = result.filter(
      (lead) => lead.assignedTo?.toLowerCase() === assignedTerm
    );
  }

  return result;
}

export function getActiveFilterCount(filters: FilterState): number {
  let count = 0;
  if (filters.search) count++;
  count += filters.status.length > 0 ? 1 : 0;
  count += filters.source.length > 0 ? 1 : 0;
  count += filters.niche.length > 0 ? 1 : 0;
  if (filters.country) count++;
  if (filters.valueMin || filters.valueMax) count++;
  if (filters.assigned) count++;
  return count;
}

export function getActiveFilterBadges(
  filters: FilterState,
  statusLabels?: Record<string, string>
): { key: keyof FilterState; label: string; value: string }[] {
  const badges: { key: keyof FilterState; label: string; value: string }[] = [];

  if (filters.search) {
    badges.push({ key: "search", label: "Search", value: filters.search });
  }

  for (const status of filters.status) {
    badges.push({
      key: "status",
      label: "Status",
      value: statusLabels?.[status] || status,
    });
  }

  for (const source of filters.source) {
    badges.push({ key: "source", label: "Source", value: source });
  }

  for (const niche of filters.niche) {
    badges.push({ key: "niche", label: "Niche", value: niche });
  }

  if (filters.country) {
    badges.push({ key: "country", label: "Country", value: filters.country });
  }

  if (filters.valueMin || filters.valueMax) {
    const min = filters.valueMin || "0";
    const max = filters.valueMax || "∞";
    badges.push({
      key: "valueMin",
      label: "Value",
      value: `$${min} - $${max}`,
    });
  }

  if (filters.assigned) {
    badges.push({ key: "assigned", label: "Assigned", value: filters.assigned });
  }

  return badges;
}
