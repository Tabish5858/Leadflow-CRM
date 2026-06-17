"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,      // 5 min — data considered fresh
        gcTime: 30 * 60 * 1000,         // 30 min — keep in garbage collection
        refetchOnWindowFocus: true,      // refresh when tab regains focus
        refetchOnMount: true,            // fetch on component mount if stale
        retry: 2,                        // retry twice on failure
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

/**
 * QueryClient singleton provider.
 * Creates a new QueryClient per browser tab (useState) so server-rendering
 * doesn't share state across requests.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
