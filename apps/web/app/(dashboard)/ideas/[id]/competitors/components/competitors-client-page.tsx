"use client";

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CompetitorsTable } from "./competitors-table";
import { NewCompetitorSheet } from "./new-competitor";
import { ideaKeys } from "@/lib/queries/idea";
import AIDiscovery from "./ai-discover";

export default function CompetitorsClientPage({ ideaId }: { ideaId: string }) {
  const queryClient = useQueryClient();

  const handleCompetitorAdded = () => {
    // Invalidate the query for the competitors list to trigger a refetch
    queryClient.invalidateQueries({
      queryKey: ideaKeys.competitors(ideaId),
    });
    // Also invalidate the competitors table query
    queryClient.invalidateQueries({
      queryKey: ["idea-competitors", ideaId],
    });
  };

  const handleCompetitorDeleted = () => {
    // Invalidate queries when a competitor is deleted
    queryClient.invalidateQueries({
      queryKey: ideaKeys.competitors(ideaId),
    });
    queryClient.invalidateQueries({
      queryKey: ["idea-competitors", ideaId],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap gap-4 items-center">
        <div>
          <h1 className="text-xl font-bold">Competitor Analysis</h1>
          <p className="text-muted-foreground">
            Analyze your competitors and discover new ones with AI.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <NewCompetitorSheet
            ideaId={ideaId}
            onCompetitorAdded={handleCompetitorAdded}
          />
          <AIDiscovery ideaId={ideaId} />
        </div>
      </div>
      <CompetitorsTable ideaId={ideaId} />
    </div>
  );
}
