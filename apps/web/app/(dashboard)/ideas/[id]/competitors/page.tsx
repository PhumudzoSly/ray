import React from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import getQueryClient from "@/lib/query/client";
import { getCompetitorValidation } from "@/actions/idea/validation-competitors";
import CompetitorsClientPage from "./components/competitors-client-page";

interface CompetitorsValidationPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompetitorsValidationPage({
  params,
}: CompetitorsValidationPageProps) {
  const { id } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["ideas", "detail", id, "competitors"],
    queryFn: () => getCompetitorValidation({ ideaId: id }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-4">
        <CompetitorsClientPage ideaId={id} />
      </div>
    </HydrationBoundary>
  );
}
