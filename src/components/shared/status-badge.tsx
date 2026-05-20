import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type LeadStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Proposal"
  | "Negotiation"
  | "Won"
  | "Lost";

const statusConfig: Record<
  LeadStatus,
  { variant: "default" | "secondary" | "destructive"; className: string }
> = {
  New: {
    variant: "default",
    className:
      "bg-status-new/15 text-status-new hover:bg-status-new/25 border-status-new/20",
  },
  Contacted: {
    variant: "secondary",
    className:
      "bg-status-contacted/15 text-status-contacted hover:bg-status-contacted/25 border-status-contacted/20",
  },
  Qualified: {
    variant: "default",
    className:
      "bg-status-qualified/15 text-status-qualified hover:bg-status-qualified/25 border-status-qualified/20",
  },
  Proposal: {
    variant: "secondary",
    className:
      "bg-status-proposal/15 text-status-proposal hover:bg-status-proposal/25 border-status-proposal/20",
  },
  Negotiation: {
    variant: "default",
    className:
      "bg-status-negotiation/15 text-status-negotiation hover:bg-status-negotiation/25 border-status-negotiation/20",
  },
  Won: {
    variant: "default",
    className:
      "bg-status-won/15 text-status-won hover:bg-status-won/25 border-status-won/20",
  },
  Lost: {
    variant: "destructive",
    className:
      "bg-status-lost/15 text-status-lost hover:bg-status-lost/25 border-status-lost/20",
  },
};

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.New;

  return (
    <Badge
      variant={config.variant}
      className={cn("border font-medium capitalize", config.className, className)}
    >
      {status.toLowerCase()}
    </Badge>
  );
}
