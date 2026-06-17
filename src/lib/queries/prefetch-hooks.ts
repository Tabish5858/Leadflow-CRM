"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { getProjects } from "@/lib/firebase/projects";
import { getInvoices } from "@/lib/firebase/invoices";
import { getContracts } from "@/lib/firebase/contracts";
import { getMeetings } from "@/lib/firebase/meetings";
import { getConversations } from "@/lib/firebase/messages";

type PrefetchPage = "projects" | "invoices" | "contracts" | "meetings" | "messages";

/**
 * Returns a prefetch function for sidebar hover. When the user hovers
 * over a navigation link, data is preloaded into React Query cache.
 * By the time they click, the page renders with cached data instantly.
 */
export function usePrefetch(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useCallback(
    (page: PrefetchPage) => {
      if (!workspaceId) return;

      const opts = { staleTime: 3 * 60 * 1000 };

      switch (page) {
        case "projects":
          queryClient.prefetchQuery({
            queryKey: ["projects", workspaceId],
            queryFn: () => getProjects(workspaceId, { max: 100 }),
            ...opts,
          });
          break;
        case "invoices":
          queryClient.prefetchQuery({
            queryKey: ["invoices", workspaceId],
            queryFn: () => getInvoices(workspaceId, { max: 100 }),
            ...opts,
          });
          break;
        case "contracts":
          queryClient.prefetchQuery({
            queryKey: ["contracts", workspaceId],
            queryFn: () => getContracts(workspaceId, { max: 100 }),
            ...opts,
          });
          break;
        case "meetings":
          queryClient.prefetchQuery({
            queryKey: ["meetings", workspaceId],
            queryFn: () => getMeetings(workspaceId),
            ...opts,
          });
          break;
        case "messages":
          queryClient.prefetchQuery({
            queryKey: ["messages-list", workspaceId],
            queryFn: () => getConversations(workspaceId),
            ...opts,
          });
          break;
      }
    },
    [workspaceId, queryClient]
  );
}
