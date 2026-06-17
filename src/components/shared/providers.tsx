"use client";

import { ClientPreviewProvider } from "@/lib/hooks/use-client-preview";
import { DemoProvider } from "@/lib/demo/demo-context";
import { QueryProvider } from "@/components/shared/query-provider";
import type { ReactNode } from "react";

/**
 * Client-side providers that need to be above both dashboard and client route groups.
 * Wraps children with ClientPreviewProvider so preview mode works across all routes.
 * Also wraps with DemoProvider so demo mode works on the login page and dashboard.
 * QueryProvider handles TanStack React Query caching across the entire app.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <DemoProvider>
        <ClientPreviewProvider>{children}</ClientPreviewProvider>
      </DemoProvider>
    </QueryProvider>
  );
}
