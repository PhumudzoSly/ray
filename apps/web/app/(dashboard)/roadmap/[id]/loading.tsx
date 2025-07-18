import { Skeleton } from "@workspace/ui/components/skeleton";

export default function RoadmapLoading() {
  return (
    <div className="space-y-4 container">
      <div className="flex items-center gap-4 flex-wrap justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
