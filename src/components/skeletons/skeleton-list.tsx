import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border p-4"
        >
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-3 w-[60%]" />
          </div>
          <Skeleton className="h-8 w-[80px]" />
        </div>
      ))}
    </div>
  );
}
