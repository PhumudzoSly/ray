import { Suspense } from "react";
import { dehydrate } from "@tanstack/react-query";
import { getRoadmap } from "@/actions/roadmap";
import { getAllRoadmapItems } from "@/actions/roadmap/items";
import getQueryClient from "@/lib/query/getQueryClient";
import Hydrate from "@/lib/query/hydrate.client";
import { RoadmapDetailClient } from "./_components/roadmap-detail-client";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";

interface RoadmapDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoadmapDetailPage({
  params,
}: RoadmapDetailPageProps) {
  const { id: roadmapId } = await params;
  const queryClient = getQueryClient();

  // Prefetch roadmap data on the server
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["roadmap", roadmapId],
      queryFn: () => getRoadmap(roadmapId),
    }),
    queryClient.prefetchQuery({
      queryKey: ["roadmapItems", roadmapId],
      queryFn: () => getAllRoadmapItems(roadmapId),
    }),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <Hydrate state={dehydratedState}>
      <Suspense fallback={<LoadingSpinner />}>
        <RoadmapDetailClient roadmapId={roadmapId} />
      </Suspense>
    </Hydrate>
  );
}
