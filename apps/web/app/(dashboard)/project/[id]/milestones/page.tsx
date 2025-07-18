"use client";

import { useParams } from "next/navigation";
import { MilestoneList } from "@/components/project/milestones/milestone-list";

export default function ProjectMilestonesPage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <div className="container mx-auto px-4 py-6">
      <MilestoneList projectId={projectId} />
    </div>
  );
}
