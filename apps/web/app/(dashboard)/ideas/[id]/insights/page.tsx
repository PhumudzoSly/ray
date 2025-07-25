import { Suspense } from "react";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getValidationInsights } from "@/actions/idea/insights";
import { getTechnologyAssessment } from "@/actions/idea/insights";
import { getRegulatoryCompliance } from "@/actions/idea/insights";
import { getDetailedScorecard } from "@/actions/idea/insights";
import { ValidationInsights } from "@/components/idea/insights/validation-insights";
import { TechnologyAssessment } from "@/components/idea/insights/technology-assessment";
import { RegulatoryCompliance } from "@/components/idea/insights/regulatory-compliance";
import { DetailedScorecard } from "@/components/idea/insights/detailed-scorecard";

interface InsightsPageProps {
  params: Promise<{ id: string }>;
}

export default async function InsightsPage({ params }: InsightsPageProps) {
  const { id } = await params;
  const queryClient = new QueryClient();

  // Prefetch all insights data
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["validation-insights", id],
      queryFn: () => getValidationInsights(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["technology-assessment", id],
      queryFn: () => getTechnologyAssessment(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["regulatory-compliance", id],
      queryFn: () => getRegulatoryCompliance(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["detailed-scorecard", id],
      queryFn: () => getDetailedScorecard(id),
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
        <p className="text-muted-foreground">
          AI-generated insights, technology assessment, and regulatory
          compliance analysis
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <Suspense
              fallback={
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
              }
            >
              <ValidationInsights ideaId={id} />
            </Suspense>

            <Suspense
              fallback={
                <div className="h-96 bg-muted animate-pulse rounded-lg" />
              }
            >
              <TechnologyAssessment ideaId={id} />
            </Suspense>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Suspense
              fallback={
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
              }
            >
              <RegulatoryCompliance ideaId={id} />
            </Suspense>

            <Suspense
              fallback={
                <div className="h-96 bg-muted animate-pulse rounded-lg" />
              }
            >
              <DetailedScorecard ideaId={id} />
            </Suspense>
          </div>
        </div>
      </HydrationBoundary>
    </div>
  );
}
