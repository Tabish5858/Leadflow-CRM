"use client";

import { useRouter } from "next/navigation";
import { PenTool, ArrowUpRight } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/contexts/workspace-context";
import { useDashboardContracts } from "@/lib/queries/dashboard-queries";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  signed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  terminated: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function ContractsCard() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();
  const { data: contracts = [], isLoading, error } = useDashboardContracts(activeWorkspace?.id);

  return (
    <DashboardCard
      id="contracts"
      title="Contracts"
      description="Recent contracts & proposals"
      loading={isLoading}
      headerAction={
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => router.push("/contracts")}
        >
          View All
        </Button>
      }
    >
      {error ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-destructive">{error?.message}</p>
        </div>
      ) : contracts.length === 0 && !isLoading ? (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <PenTool className="h-6 w-6 text-muted-foreground" />
            </div>
          <div className="text-center">
            <p className="text-sm font-medium">No contracts yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first contract or proposal.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => router.push("/contracts")}>
            Create Contract
          </Button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {contracts.map((c) => (
            <div
              key={c.id}
              className="group/item flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
              onClick={() => router.push(`/contracts/${c.id}`)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <PenTool className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{c.contractTitle}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 px-1.5 py-0 text-[10px] font-medium capitalize",
                      STATUS_COLORS[c.status] ?? ""
                    )}
                  >
                    {c.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                  {c.type}
                  {c.updatedAt?.toDate && (
                    <>
                      {" · "}Updated {formatDistanceToNow(c.updatedAt.toDate(), { addSuffix: true })}
                    </>
                  )}
                </p>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/item:opacity-60" />
            </div>
          ))}
          {contracts.length >= 6 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => router.push("/contracts")}
            >
              View all contracts
            </Button>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
