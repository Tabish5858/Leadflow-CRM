"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/lib/firebase/projects";
import { getInvoices, getInvoice } from "@/lib/firebase/invoices";
import { getContracts } from "@/lib/firebase/contracts";
import { getMeetings } from "@/lib/firebase/meetings";
import type { Project, Invoice, Contract, ProjectStatus, InvoiceStatus, ContractStatus } from "@/types";

/* ------------------------------------------------------------------ */
/*  Page-level list hooks — used by /projects, /invoices, etc.         */
/*  Pagination can be added via cursor tracking in queryKey params.    */
/* ------------------------------------------------------------------ */

/* ----- Projects ----- */

export function useProjectsQuery(
  workspaceId?: string,
  filters?: { status?: string; max?: number }
) {
  return useQuery({
    queryKey: ["projects", workspaceId, filters],
    queryFn: async () => {
      if (!workspaceId) return [] as Project[];
      return getProjects(workspaceId, { status: filters?.status as ProjectStatus | undefined, max: filters?.max ?? 100 });
    },
    enabled: !!workspaceId,
    staleTime: 3 * 60 * 1000, // 3 min
    placeholderData: (prev) => prev, // keep previous data while fetching
  });
}

/* ----- Invoices ----- */

export function useInvoicesQuery(
  workspaceId?: string,
  filters?: { status?: string; clientId?: string; max?: number }
) {
  return useQuery({
    queryKey: ["invoices", workspaceId, filters],
    queryFn: async () => {
      if (!workspaceId) return [] as Invoice[];
      return getInvoices(workspaceId, {
        status: filters?.status as InvoiceStatus | undefined,
        clientId: filters?.clientId,
        max: filters?.max ?? 100,
      });
    },
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000, // 2 min
    placeholderData: (prev) => prev,
  });
}

/* ----- Contracts ----- */

export function useContractsQuery(
  workspaceId?: string,
  filters?: { status?: string; clientId?: string; projectId?: string; max?: number }
) {
  return useQuery({
    queryKey: ["contracts", workspaceId, filters],
    queryFn: async () => {
      if (!workspaceId) return [] as Contract[];
      return getContracts(workspaceId, {
        status: filters?.status as ContractStatus | undefined,
        clientId: filters?.clientId,
        projectId: filters?.projectId,
        max: filters?.max ?? 100,
      });
    },
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

/* ----- Meetings ----- */

export function useMeetingsQuery(workspaceId?: string) {
  return useQuery({
    queryKey: ["meetings", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      return getMeetings(workspaceId);
    },
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

/* ----- Invoice by ID (for detail pages) ----- */

export function useInvoiceQuery(invoiceId?: string) {
  return useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      return getInvoice(invoiceId);
    },
    enabled: !!invoiceId,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
