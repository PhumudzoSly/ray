import { Suspense } from "react";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import {
  getCompetitiveLandscape,
  getCompetitors,
  getCompetitiveMoves,
} from "@/actions/idea/competitive-analysis";
import { CompetitiveLandscape } from "@/components/idea/competitors/competitive-landscape";
import { CompetitorProfiles } from "@/components/idea/competitors/competitor-profiles";
import { PricingComparison } from "@/components/idea/competitors/pricing-comparison";
import { CompetitiveMoves } from "@/components/idea/competitors/competitive-moves";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

interface CompetitorsPageProps {
  params: Promise<{ id: string }>;
}

function CompetitorsPageSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function CompetitorsPage({
  params,
}: CompetitorsPageProps) {
  const { id } = await params;

  const queryClient = new QueryClient();

  // Prefetch competitive intelligence data
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["competitive-landscape", id],
      queryFn: () => getCompetitiveLandscape(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["competitors", id],
      queryFn: () => getCompetitors(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["competitive-moves", id],
      queryFn: () => getCompetitiveMoves(id),
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Competitive Intelligence
        </h1>
        <p className="text-muted-foreground">
          Analyze competitive landscape, competitor profiles, pricing
          strategies, and strategic moves
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="space-y-6">
          {/* Competitive Landscape Overview */}
          <Suspense fallback={<CompetitorsPageSkeleton />}>
            <CompetitiveLandscape ideaId={id} />
          </Suspense>

          {/* Competitor Profiles */}
          <Suspense fallback={<CompetitorsPageSkeleton />}>
            <CompetitorProfiles ideaId={id} />
          </Suspense>

          {/* Pricing Comparison */}
          <Suspense fallback={<CompetitorsPageSkeleton />}>
            <PricingComparison ideaId={id} />
          </Suspense>

          {/* Competitive Moves */}
          <Suspense fallback={<CompetitorsPageSkeleton />}>
            <CompetitiveMoves ideaId={id} />
          </Suspense>
        </div>
      </HydrationBoundary>
    </div>
  );
}
