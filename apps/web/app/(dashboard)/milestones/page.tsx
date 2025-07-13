"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { Id } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { Button } from "@workspace/ui/components/button";
import { Plus } from "lucide-react";
import { GanttChart } from "@/components/project/milestones/gantt-chart";
import { MilestoneDetailsSheet } from "@/components/project/milestones/milestone-details-sheet";
import { CreateMilestoneDialog } from "@/components/project/milestones/create-milestone-dialog";
import LoadingSpinner from "@workspace/ui/components/LoadingSpinner";
import Header from "@/components/shared/header";

export default function MilestonesPage() {
  const { token } = useSession();
  const [selectedMilestone, setSelectedMilestone] =
    useState<Id<"milestones"> | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProjectForCreate, setSelectedProjectForCreate] =
    useState<Id<"projects"> | null>(null);

  const milestones = useQuery(api.milestones.getOrganizationMilestones, {
    token,
  });

  const projects = useQuery(api.projects.getAllProjects, { token });

  if (milestones === undefined || projects === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const handleCreateMilestone = (projectId?: Id<"projects">) => {
    setSelectedProjectForCreate(projectId || null);
    setShowCreateDialog(true);
  };

  return (
    <>
      <Header crumb={[{ title: "Milestones", url: "/milestones" }]}>
        <Button onClick={() => handleCreateMilestone()} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Milestone
        </Button>
      </Header>
      <div>
        {/* <GanttChart
          milestones={filteredMilestones}
          onMilestoneClick={(milestone) => setSelectedMilestone(milestone._id)}
        /> */}

        {/* Milestone Details Sheet */}
        {selectedMilestone && (
          <MilestoneDetailsSheet
            milestoneId={selectedMilestone}
            open={!!selectedMilestone}
            onOpenChange={(open) => !open && setSelectedMilestone(null)}
          />
        )}

        {/* Create Milestone Dialog */}
        <CreateMilestoneDialog
          projectId={
            selectedProjectForCreate || (projects[0]?._id as Id<"projects">)
          }
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </>
  );
}
