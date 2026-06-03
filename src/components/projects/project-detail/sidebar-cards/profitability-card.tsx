"use client";

import { TrendingUp, DollarSign, TrendingDown } from "lucide-react";

interface ProfitabilityCardProps {
  budget: number | null;
}

export default function ProfitabilityCard({ budget }: ProfitabilityCardProps) {
  const income = budget || 0;
  const expenses = 0; // TODO: calculate from time entries
  const profit = income - expenses;
  const margin = income > 0 ? Math.round((profit / income) * 100) : 0;

  return (
    <div
      style={{ borderRadius: "8px" }}
      className="flex flex-col p-5 w-full bg-card border border-border hover:border-foreground/20 transition-colors"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Profitability</h3>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-3 w-3 text-green-600" />
            <span className="text-xs text-muted-foreground">Income</span>
          </div>
          <span className="text-xs font-medium text-foreground">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(income)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingDown className="h-3 w-3 text-red-600" />
            <span className="text-xs text-muted-foreground">Expenses</span>
          </div>
          <span className="text-xs font-medium text-foreground">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(expenses)}
          </span>
        </div>

        <div className="border-t border-border pt-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Profit</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(profit)}
              </span>
              {income > 0 && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${margin >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {margin}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
