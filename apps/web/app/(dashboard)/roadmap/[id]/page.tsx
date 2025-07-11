"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { Badge } from "@workspace/ui/components/badge";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { RoadmapKanban } from "./_components/roadmap-kanban";
import { AddItemDialog } from "./_components/add-item-dialog";
import { EditRoadmapDialog } from "./_components/edit-roadmap-dialog";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { useData } from "@/hooks/use-data";

export default function RoadmapDetailPage() {
  //

  const params = useParams();
  const roadmapId = params.id as Id<"publicRoadmaps">;
  const { token } = useSession();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [addItemInitialStatus, setAddItemInitialStatus] = useState("REVIEW");

  // Fetch roadmap data
  const roadmap = useQuery(api.roadmap.getRoadmap, { id: roadmapId, token });

  // Fetch roadmap items
  const { data: items, isPending } = useData(
    api.roadmap.items.getRoadmapItems,
    {
      roadmapId,
      token,
    }
  );

  // Fetch roadmap stats
  const stats = useQuery(api.roadmap.getRoadmapStats, { roadmapId });

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
