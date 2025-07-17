"use client";
import { useSession } from "@/context/session-context";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { getAllRoadmapChangelogs } from "@/actions/roadmap/changelogs";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { ChangelogDialog } from "./_components/changelog-dialog";
import { RoadmapChangelogs } from "./_components/roadmap-changelogs";

const ChangelogsPage = () => {
  const { id } = useParams();
  const { token } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch changelogs
  const { data: changelogs = [], isLoading } = useQuery({
    queryKey: ["roadmapChangelogs", id],
    queryFn: () => getAllRoadmapChangelogs(id as string),
    select: (res) => res?.success ? res.data : [],
  });

  const handleCreateChangelog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <RoadmapChangelogs
        changelogs={changelogs}
        onCreateChangelog={handleCreateChangelog}
      />

      <ChangelogDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        roadmapId={id as string}
        token={token}
      />
    </div>
  );
};

export default ChangelogsPage;
