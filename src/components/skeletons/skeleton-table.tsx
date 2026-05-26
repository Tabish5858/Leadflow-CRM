import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonTableProps {
  columns?: number;
  rows?: number;
  columnWidths?: string[];
}

export function SkeletonTable({
  columns = 6,
  rows = 8,
  columnWidths,
}: SkeletonTableProps) {
  return (
    <div className="w-full space-y-0 h-full">
      {/* Header */}
      <div className="flex items-center gap-4 border-b px-6 py-3">
        <Skeleton className="h-4 w-4 shrink-0" />
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4 shrink-0"
            style={{
              width: columnWidths?.[i] ?? `${Math.max(80, 120 - i * 10)}px`,
            }}
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 border-b px-6 py-3 last:border-b-0"
        >
          <Skeleton className="h-4 w-4 shrink-0" />
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className="h-4 shrink-0"
              style={{
                width: columnWidths?.[colIndex] ?? `${Math.max(80, 120 - colIndex * 10)}px`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
