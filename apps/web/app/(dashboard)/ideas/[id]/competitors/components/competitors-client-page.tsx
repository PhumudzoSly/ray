"use client";

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CompetitorsTable } from "@/components/idea/validation/competitors-table";
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
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Competitor Analysis</h1>
          <p className="text-muted-foreground">Analyze your competitors.</p>
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
