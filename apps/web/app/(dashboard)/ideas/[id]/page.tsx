import React, { Suspense } from "react";
import { getSingleIdea, getValidationDetails } from "@/actions/idea";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
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
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col h-full">
        <Suspense fallback={<IdeaDetailsSkeleton />}>
          {/* <IdeaDetailsHeader ideaId={id} /> */}
          <IdeaDetailsContent ideaId={id} />
        </Suspense>
      </div>
    </HydrationBoundary>
  );
};

export default IdeaPage;
