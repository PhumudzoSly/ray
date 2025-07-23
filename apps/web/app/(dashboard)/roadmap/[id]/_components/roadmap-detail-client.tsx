"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRoadmap } from "@/actions/roadmap";
import { getAllRoadmapItems } from "@/actions/roadmap/items";
import { RoadmapKanban } from "./roadmap-kanban";
import { AddItemDialog } from "./add-item-dialog";
import { EditRoadmapDialog } from "./edit-roadmap-dialog";
import { IssueStatus } from "@workspace/backend/prisma/generated/client/client";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";

interface RoadmapDetailClientProps {
  roadmapId: string;
}

export function RoadmapDetailClient({ roadmapId }: RoadmapDetailClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [addItemInitialStatus, setAddItemInitialStatus] =
    useState<IssueStatus>("IN_REVIEW");

  // Fetch roadmap data (will use pre-hydrated data from server)
  const { data: roadmap } = useQuery({
    queryKey: ["roadmap", roadmapId],
    queryFn: () => getRoadmap(roadmapId),
    select: (res) => (res?.success ? res.data : undefined),
  });

  // Fetch roadmap items (will use pre-hydrated data from server)
  const { data: items = [], isLoading: isPending } = useQuery({
    queryKey: ["roadmapItems", roadmapId],
    queryFn: () => getAllRoadmapItems(roadmapId),
    select: (res) => (res?.success ? res.data : []),
  });

  // Handle add item with status
  const handleAddItemWithStatus = (status: IssueStatus) => {
    setAddItemInitialStatus(status);
    setShowAddItemDialog(true);
  };

  if (isPending) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <RoadmapKanban
        items={items}
        onAddItem={handleAddItemWithStatus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {/* Dialogs */}
      <AddItemDialog
        isOpen={showAddItemDialog}
        onClose={() => setShowAddItemDialog(false)}
        roadmapId={roadmapId}
        initialStatus={addItemInitialStatus}
      />

      <EditRoadmapDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        roadmapId={roadmapId}
        roadmap={{
          name: roadmap?.name || "",
          slug: roadmap?.slug || "",
          description: roadmap?.description || "",
          isPublic: roadmap?.isPublic || false,
          allowVoting: roadmap?.allowVoting || false,
          allowFeedback: roadmap?.allowFeedback || false,
          project: roadmap?.project.id || "",
        }}
      />
    </div>
  );
}
