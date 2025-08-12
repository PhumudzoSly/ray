import React from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";

export default function ValidationLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <Skeleton className="h-8 w-1/3" />
      
      {/* Dashboard skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border p-6">
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>

      {/* Section skeleton */}
      <div>
        <Skeleton className="h-6 w-1/4 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border p-6">
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          ))}
        </div>
      </div>

      {/* Chart skeleton */}
      <div>
        <Skeleton className="h-6 w-1/4 mb-4" />
        <div className="rounded-lg border p-6 h-80">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}