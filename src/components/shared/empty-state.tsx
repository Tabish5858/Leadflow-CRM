import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardHeader className="text-center">
        {icon && (
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {icon}
          </div>
        )}
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <CardDescription className="mt-1 max-w-md mx-auto">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      {actionLabel && onAction && (
        <CardContent className="flex justify-center pt-0">
          <Button onClick={onAction}>{actionLabel}</Button>
        </CardContent>
      )}
    </Card>
  );
}
