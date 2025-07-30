import React, { Suspense } from "react";
import { getSingleIdea } from "@/actions/idea";
import { IdeaDetailsSkeleton } from "@/components/idea/core/idea-details-skeleton";
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
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col h-full">
        <Suspense fallback={<IdeaDetailsSkeleton />}>
          <></>
        </Suspense>
      </div>
    </HydrationBoundary>
  );
};

export default IdeaPage;
