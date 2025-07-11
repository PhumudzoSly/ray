"use client";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { Id } from "@workspace/backend";
import { useData } from "@/hooks/use-data";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { ChangelogDialog } from "./_components/changelog-dialog";
import { RoadmapChangelogs } from "./_components/roadmap-changelogs";

const ChangelogsPage = () => {
  const { id } = useParams();
  const { token } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch changelogs
  const { data: changelogs, isPending } = useData(
    api.roadmap.changelog.getChangelogs,
    {
      roadmapId: id as Id<"publicRoadmaps">,
    }
  );

  const handleCreateChangelog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  if (isPending) return <LoadingSpinner />;

  return (
    <div>
      <RoadmapChangelogs
        changelogs={changelogs || []}
        onCreateChangelog={handleCreateChangelog}
      />

      <ChangelogDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        roadmapId={id as Id<"publicRoadmaps">}
        token={token}
      />
    </div>
  );
};

export default ChangelogsPage;
