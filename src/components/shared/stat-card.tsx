import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  accentColor?: "default" | "success" | "warning" | "info" | "primary";
  className?: string;
}

const accentMap = {
  default: "from-primary/10 to-transparent",
  success: "from-success/10 to-transparent",
  warning: "from-warning/10 to-transparent",
  info: "from-info/10 to-transparent",
  primary: "from-primary/15 to-transparent",
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  accentColor = "default",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Subtle gradient accent */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-60",
          accentMap[accentColor]
        )}
      />

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.value >= 0
                      ? "text-success"
                      : "text-destructive"
                  )}
                >
                  {trend.value >= 0 ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
