"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const subNavItems = [
  { href: "/analytics/spreadsheet", label: "Sheet Analytics" },
  { href: "/analytics", label: "Analytics" },
];

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-1 border-b">
        {subNavItems.map((item) => {
          const isActive =
            item.href === "/analytics"
              ? pathname === "/analytics"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
