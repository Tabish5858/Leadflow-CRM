"use client";

/** Loading skeleton that matches the Cal.com booking page layout */
export function BookingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-275 mx-auto px-4 py-12 flex min-h-screen flex-col justify-center">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left Panel Skeleton */}
            <div className="md:w-70 md:min-w-70 md:border-r md:border-border p-6 md:p-8 bg-muted/30">
              <div className="space-y-4">
                {/* Logo */}
                <div className="w-10 h-10 rounded-lg skeleton" />
                {/* Workspace name */}
                <div className="h-4 w-28 skeleton rounded" />
                {/* Title */}
                <div className="h-7 w-40 skeleton rounded" />
                {/* Description */}
                <div className="space-y-2">
                  <div className="h-3 w-full skeleton rounded" />
                  <div className="h-3 w-3/4 skeleton rounded" />
                </div>
                {/* Duration */}
                <div className="h-4 w-16 skeleton rounded" />
                {/* Video */}
                <div className="h-4 w-24 skeleton rounded" />
                {/* Timezone */}
                <div className="pt-4 border-t border-border">
                  <div className="h-4 w-32 skeleton rounded" />
                </div>
              </div>
            </div>

            {/* Right Panel Skeleton */}
            <div className="flex-1 p-6 md:p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Calendar Skeleton */}
                <div className="flex-1 space-y-4">
                  {/* Month nav */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <div className="h-8 w-8 skeleton rounded-lg" />
                      <div className="h-8 w-8 skeleton rounded-lg" />
                      <div className="h-8 w-8 skeleton rounded-lg" />
                    </div>
                    <div className="h-5 w-32 skeleton rounded" />
                  </div>
                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="h-4 skeleton rounded mx-auto w-8" />
                    ))}
                  </div>
                  {/* Calendar grid */}
                  {Array.from({ length: 5 }).map((_, week) => (
                    <div key={week} className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 7 }).map((_, day) => (
                        <div key={day} className="h-12 skeleton rounded-lg" />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Time Slots Skeleton */}
                <div className="lg:w-[220px] lg:min-w-[220px] lg:border-l lg:border-border lg:pl-6 space-y-3">
                  <div className="h-5 w-16 skeleton rounded" />
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-11 skeleton rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
