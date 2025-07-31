import React, { Suspense } from "react";
import { getSingleIdea } from "@/actions/idea";
import { IdeaDetailsSkeleton } from "@/components/idea/core/idea-details-skeleton";
import { ResearchTable } from "@/components/idea/core/research-table";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import getQueryClient from "@/lib/query/getQueryClient";
import { getValidations } from "@/actions/idea/validate";

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
      queryKey: ["idea-research", id],
      queryFn: () => getValidations({ id }),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col h-full">
        <Suspense fallback={<IdeaDetailsSkeleton />}>
          <ResearchTable ideaId={id} />
        </Suspense>
      </div>
    </HydrationBoundary>
  );
};

export default IdeaPage;
