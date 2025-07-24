import { Suspense } from "react";
import { dehydrate } from "@tanstack/react-query";
import { getAllFeatureRequests } from "@/actions/roadmap/feature-requests";
import { getRoadmap } from "@/actions/roadmap";
import getQueryClient from "@/lib/query/getQueryClient";
import Hydrate from "@/lib/query/hydrate.client";
import { FeatureRequestsClient } from "./_components/feature-requests-client";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";

interface FeatureRequestsPageProps {
  params: Promise<{ id: string }>;
}

export default async function FeatureRequestsPage({
  params,
}: FeatureRequestsPageProps) {
  const { id } = await params;
  const queryClient = getQueryClient();

  // Pre-fetch roadmap and feature requests data in parallel
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["roadmap", id],
      queryFn: () => getRoadmap(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["featureRequests", id],
      queryFn: () => getAllFeatureRequests(id),
    }),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <Hydrate state={dehydratedState}>
      <Suspense fallback={<LoadingSpinner />}>
        <FeatureRequestsClient roadmapId={id} />
      </Suspense>
    </Hydrate>
  );
}
