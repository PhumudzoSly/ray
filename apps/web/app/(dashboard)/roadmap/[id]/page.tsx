"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicRoadmap } from "@/actions/roadmap";
import { getAllRoadmapItems } from "@/actions/roadmap/items";
// Placeholder for getRoadmapStats, to be implemented
const getRoadmapStats = async (roadmapId: string) => { return {}; };
import { Badge } from "@workspace/ui/components/badge";
import { useParams } from "next/navigation";
import { useSession } from "@/context/session-context";
import { RoadmapKanban } from "./_components/roadmap-kanban";
import { AddItemDialog } from "./_components/add-item-dialog";
import { EditRoadmapDialog } from "./_components/edit-roadmap-dialog";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";

export default function RoadmapDetailPage() {
  const params = useParams();
  const roadmapId = params.id as string;
  const { token } = useSession();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [addItemInitialStatus, setAddItemInitialStatus] = useState("REVIEW");

  // Fetch roadmap data
  const { data: roadmap } = useQuery({
    queryKey: ["roadmap", roadmapId],
    queryFn: () => getPublicRoadmap(roadmapId),
    select: (res) => res?.success ? res.data : undefined,
  });
  // Fetch roadmap items
  const { data: items = [], isLoading: isPending } = useQuery({
    queryKey: ["roadmapItems", roadmapId],
    queryFn: () => getAllRoadmapItems(roadmapId),
    select: (res) => res?.success ? res.data : [],
  });
  // Fetch roadmap stats (placeholder)
  const { data: stats } = useQuery({
    queryKey: ["roadmapStats", roadmapId],
    queryFn: () => getRoadmapStats(roadmapId),
  });

  // Handle add item with status
  const handleAddItemWithStatus = (status: string) => {
    setAddItemInitialStatus(status);
    setShowAddItemDialog(true);
  };

  if (isPending) {
    return <LoadingSpinner />;
  }

  if (!items) return null;

  return (
    <div className="flex-1 flex flex-col">
      <RoadmapKanban
        items={items}
        stats={stats}
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
        token={token}
        initialStatus={addItemInitialStatus}
      />

      <EditRoadmapDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        roadmapId={roadmapId}
        token={token}
        roadmap={roadmap || undefined}
      />
    </div>
  );
}
