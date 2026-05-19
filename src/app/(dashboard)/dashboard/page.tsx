"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/client";
import { getLeadStats } from "@/lib/firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, Target } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface KPI {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPI[]>([
    { label: "Total Leads", value: "—", icon: Users, color: "text-blue-500" },
    { label: "Active Deals", value: "—", icon: Target, color: "text-orange-500" },
    { label: "Pipeline Value", value: "—", icon: DollarSign, color: "text-green-500" },
    { label: "Conversion Rate", value: "—", icon: TrendingUp, color: "text-purple-500" },
  ]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) return;
      // MVP: use a default workspace; will be dynamic in Phase 2
      getLeadStats("default").then((stats) => {
        const activeDeals =
          (stats.byStatus["new"] || 0) +
          (stats.byStatus["contacted"] || 0) +
          (stats.byStatus["qualified"] || 0) +
          (stats.byStatus["proposal"] || 0) +
          (stats.byStatus["negotiation"] || 0);
        const won = stats.byStatus["won"] || 0;
        const conversionRate =
          stats.total > 0 ? Math.round((won / stats.total) * 100) : 0;

        setKpis([
          { label: "Total Leads", value: stats.total.toString(), icon: Users, color: "text-blue-500" },
          { label: "Active Deals", value: activeDeals.toString(), icon: Target, color: "text-orange-500" },
          { label: "Pipeline Value", value: formatCurrency(stats.totalValue), icon: DollarSign, color: "text-green-500" },
          { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp, color: "text-purple-500" },
        ]);
      });
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your CRM.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border-2 border-dashed p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No leads yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Start by adding your first lead to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
