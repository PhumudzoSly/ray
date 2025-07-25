import React, { Suspense } from "react";
import { getSingleIdea, getValidationDetails } from "@/actions/idea";
import {
  getMarketResearch,
  getValidationScorecard,
  getTargetAudiences,
  getMarketTrends,
} from "@/actions/idea/market-research";
import {
  getValidationInsights,
  getTechnologyAssessment,
  getRegulatoryCompliance,
  getDetailedScorecard,
} from "@/actions/idea/insights";
import { IdeaDetailsSkeleton } from "@/components/idea/core/idea-details-skeleton";
import { IdeaDetailsContent } from "@/components/idea/core/idea-details-content";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import getQueryClient from "@/lib/query/getQueryClient";

interface IdeaPageProps {
  params: Promise<{ id: string }>;
}

const IdeaPage = async ({ params }: IdeaPageProps) => {
  const { id } = await params;
  const queryClient = getQueryClient();

  // Prefetch the data on the server
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["idea", id],
      queryFn: () => getSingleIdea(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["validationDetails", id],
      queryFn: () => getValidationDetails({ ideaId: id }),
    }),
    queryClient.prefetchQuery({
      queryKey: ["market-research", id],
      queryFn: () => getMarketResearch(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["validation-scorecard", id],
      queryFn: () => getValidationScorecard(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["target-audiences", id],
      queryFn: () => getTargetAudiences(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["market-trends", id],
      queryFn: () => getMarketTrends(id),
    }),
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
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col h-full">
        <Suspense fallback={<IdeaDetailsSkeleton />}>
          <IdeaDetailsContent ideaId={id} />
        </Suspense>
      </div>
    </HydrationBoundary>
  );
};

export default IdeaPage;
