import { Card, CardContent } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

export default function RoadmapLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header Skeleton */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters Skeleton */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Skeleton className="h-10 flex-1" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Skeleton */}
        <div className="space-y-8">
          <div className="flex justify-center">
            <div className="flex bg-muted/50 rounded p-1">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24 ml-1" />
              <Skeleton className="h-10 w-24 ml-1" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, columnIndex) => (
              <div key={columnIndex} className="space-y-4">
                {/* Column Header */}
                <div className="flex items-center gap-2">
                  <Skeleton className="w-3 h-3" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-8" />
                </div>

                {/* Column Items */}
                <div className="space-y-3">
                  {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, itemIndex) => (
                    <Card key={itemIndex} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Status and Category */}
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-12" />
                          </div>

                          {/* Title */}
                          <Skeleton className="h-5 w-full" />

                          {/* Description */}
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-3/4" />
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-4">
                              <Skeleton className="h-3 w-8" />
                              <Skeleton className="h-3 w-8" />
                            </div>
                            <div className="flex gap-2">
                              <Skeleton className="h-6 w-12" />
                              <Skeleton className="h-6 w-16" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}