"use client";

import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { getAllFeatureRequests } from "@/actions/roadmap/feature-requests";
import { getRoadmap } from "@/actions/roadmap";
import { FeatureRequestsTable } from "./feature-requests-table";
import { FeatureRequestSheet } from "./feature-request-sheet";
import { NoData } from "@/components/shared";

interface FeatureRequestsClientProps {
  roadmapId: string;
}

export function FeatureRequestsClient({
  roadmapId,
}: FeatureRequestsClientProps) {
  //

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Use the pre-fetched data from React Query
  const { data: roadmapResult } = useQuery({
    queryKey: ["roadmap", roadmapId],
    queryFn: () => getRoadmap(roadmapId),
  });

  const { data: featureRequestsResult } = useQuery({
    queryKey: ["featureRequests", roadmapId],
    queryFn: () => getAllFeatureRequests(roadmapId),
    select: (res) => (res?.success ? res.data : []),
  });

  const roadmap = roadmapResult?.success ? roadmapResult.data : null;
  const featureRequests = featureRequestsResult || [];

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedRequest(null);
  };

  if (!roadmap) {
    return <NoData />;
  }

  return (
    <div>
      <FeatureRequestsTable
        featureRequests={featureRequests}
        onViewRequest={handleViewRequest}
        roadmapId={roadmapId}
      />

      <FeatureRequestSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        featureRequest={selectedRequest}
        roadmapId={roadmapId}
        projectId={roadmap.projectId}
      />
    </div>
  );
}
