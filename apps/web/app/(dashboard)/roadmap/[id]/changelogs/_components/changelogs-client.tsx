"use client";

import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { getAllRoadmapChangelogs } from "@/actions/roadmap/changelogs";
import { getRoadmap } from "@/actions/roadmap";
import { ChangelogDialog } from "./changelog-dialog";
import { RoadmapChangelogs } from "./roadmap-changelogs";

interface ChangelogsClientProps {
  roadmapId: string;
}

export function ChangelogsClient({ roadmapId }: ChangelogsClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Use the pre-fetched data from React Query
  const { data: roadmapResult } = useQuery({
    queryKey: ["roadmap", roadmapId],
    queryFn: () => getRoadmap(roadmapId),
  });

  const { data: changelogsResult } = useQuery({
    queryKey: ["roadmapChangelogs", roadmapId],
    queryFn: () => getAllRoadmapChangelogs(roadmapId),
    select: (res) => (res?.success ? res.data : []),
  });

  const roadmap = roadmapResult?.success ? roadmapResult.data : null;
  const changelogs = changelogsResult || [];

  const handleCreateChangelog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  if (!roadmap) {
    return <div>Roadmap not found</div>;
  }

  return (
    <div>
      <RoadmapChangelogs
        changelogs={changelogs}
        onCreateChangelog={handleCreateChangelog}
        roadmapId={roadmapId}
        projectId={roadmap.projectId}
      />

      <ChangelogDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        roadmapId={roadmapId}
      />
    </div>
  );
}
