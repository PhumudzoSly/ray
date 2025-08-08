"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Plus, Calendar, Diamond, List, CalendarDays } from "lucide-react";
import { CreateMilestoneDialog } from "./create-milestone-dialog";
import { MilestoneDetailsSheet } from "./milestone-details-sheet";
import { GlobalMilestoneTimeline } from "./global-milestone-timeline";
import {
  GroupedList,
  GroupedListGroup,
  GroupedListItem,
} from "@workspace/ui/components/grouped-list";
import { formatDate } from "@/lib/format";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMilestone, getAllMilestones } from "@/actions/project/milestone";
import { MilestoneStatus } from "@workspace/backend/prisma/generated/client/client";
import { MilestoneFilters } from "./milestone-filters";

import { ProjectSelector } from "@/components/ui/selectors/project-selector";

// Colors and text for headers
const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "#10b981"; // green-500
    case "at-risk":
      return "#f59e0b"; // orange-500
    case "delayed":
      return "#ef4444"; // red-500
    case "in-progress":
      return "#3b82f6"; // blue-500
    default:
      return "#6b7280"; // gray-500
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "at-risk":
      return "At Risk";
    case "delayed":
      return "Delayed";
    case "in-progress":
      return "In Progress";
    case "not-started":
      return "Not Started";
    default:
      return "Unknown";
  }
};

export function AllMilestones() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [optimisticMilestones, setOptimisticMilestones] = useState<any[]>([]);

  type ViewMode = "list" | "timeline";
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: milestones } = useQuery({
    queryKey: ["milestones"],
    queryFn: async () => {
      const raw = await getAllMilestones();
      return raw ?? [];

    },
  });

  const searchParams = useSearchParams();
  // client-side filtering similar to AllIssues: status, owner, dueDate, text search
  const filteredMilestones = useMemo(() => {
    let data = [...(milestones || [])] as any[];

    const status = searchParams.get("status");
    const owner = searchParams.get("owner");
    const dueDate = searchParams.get("dueDate");
    const search = searchParams.get("search");

    if (search) {
      const q = search.toLowerCase();
      data = data.filter((m) =>
        (m.name?.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q) ||
          m.owner?.name?.toLowerCase().includes(q) ||
          m.status?.toLowerCase().includes(q))
      );
    }

    if (status && status !== "All") {
      data = data.filter((m) => m.status === status);
    }

    if (owner && owner !== "All") {
      data = owner === "unassigned" ? data.filter((m) => !m.owner) : data.filter((m) => m.owner?.id === owner);
    }

    if (dueDate) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

      data = data.filter((m) => {
        if (!m.endDate) return dueDate === "noDate";
        const end = new Date(m.endDate);
        switch (dueDate) {
          case "overdue":
            return end < today;
          case "thisWeek":
            return end >= today && end < nextWeek;
          case "nextWeek":
            return end >= nextWeek && end < new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
          case "thisMonth":
            return end >= today && end < nextMonth;
          case "noDate":
            return false;
          default:
            return true;
        }
      });
    }

    return data;
  }, [milestones, searchParams]);

    },
  });

  const mutation = useMutation({
    mutationFn: async (data: { milestoneId: string; status: string }) =>
      updateMilestone(data.milestoneId, { status: data.status as any }),
    onSuccess: (_data, variables) => {
      toast.success(`Milestone status changed to ${getStatusText(variables.status)}.`);
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
      setOptimisticMilestones([]);
    },
    onError: (error) => {
      toast.error("Failed to update milestone status. Please try again.");
      setOptimisticMilestones([]);
      console.error("Milestone update error:", error);
    },
  });

  const handleItemMove = async (
    itemId: string,
    fromGroupId: string,
    toGroupId: string,
    newIndex: number
  ) => {
    if (fromGroupId === toGroupId) return;

    const currentMilestones =
      optimisticMilestones.length > 0 ? optimisticMilestones : milestones || [];
    const updatedMilestones = currentMilestones.map((milestone: any) =>
      milestone.id === itemId ? { ...milestone, status: toGroupId } : milestone
    );

    setOptimisticMilestones(updatedMilestones);

    mutation.mutate({ milestoneId: itemId, status: toGroupId });
  };

  const handleItemClick = (item: GroupedListItem) => {
    setSelectedMilestone(item.id);
  };

  // Use optimistic data if available, otherwise use the query data
  const displayMilestones =
    optimisticMilestones.length > 0 ? optimisticMilestones : filteredMilestones || [];

  if (milestones === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  // Group milestones by status
  const groupedMilestones: GroupedListGroup[] = [
    {
      id: MilestoneStatus.NOT_STARTED,
      title: "Not Started",
      color: getStatusColor("not-started"),
      items: [],
    },
    {
      id: MilestoneStatus.IN_PROGRESS,
      title: "In Progress",
      color: getStatusColor("in-progress"),
      items: [],
    },
    {
      id: MilestoneStatus.AT_RISK,
      title: "At Risk",
      color: getStatusColor("at-risk"),
      items: [],
    },
    {
      id: MilestoneStatus.DELAYED,
      title: "Delayed",
      color: getStatusColor("delayed"),
      items: [],
    },
    {
      id: MilestoneStatus.COMPLETED,
      title: "Completed",
      color: getStatusColor("completed"),
      items: [],
    },
  ];

  // Populate groups with milestones
  displayMilestones.forEach((milestone: any) => {
    const group = groupedMilestones.find((g) => g.id === milestone.status);
    if (group) {
      const milestoneItem: GroupedListItem = {
        id: milestone.id,
        title: milestone.name,
        subtitle: milestone.description,
        avatar: milestone.owner ? (
          <Avatar className="h-6 w-6">
            <AvatarImage src={milestone.owner.image} alt={milestone.owner.name} />
            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {milestone.owner.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-muted">?</AvatarFallback>
          </Avatar>
        ),
        status: milestone.owner?.name,
        metadata: milestone.endDate ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(new Date(milestone.endDate))}</span>
          </div>
        ) : undefined,
      };
      group.items.push(milestoneItem);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Diamond className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-2xl font-semibold tracking-tight">Milestones</h2>
          <Badge variant="secondary" className="text-xs font-medium">
            {displayMilestones.length}
          </Badge>
          <div className="flex items-center border rounded-lg p-1 w-fit">
            <Button
              size="xs"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
            >
              <List />
            </Button>
            <Button
              size="xs"
              variant={viewMode === "timeline" ? "default" : "ghost"}
              onClick={() => setViewMode("timeline")}
            >
              <CalendarDays />
            </Button>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <ProjectSelector
            currentProject={selectedProject}
            onChange={(pid) => setSelectedProject(pid)}
          />
          <Button onClick={() => setShowCreateDialog(true)} size="sm" disabled={!selectedProject}>
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>
        </div>

      {/* Filters indicator and controls */}
      <div className="px-4 py-2 bg-muted/50 border-b -mx-4">
        <div className="flex items-center justify-between gap-4">
          <MilestoneFilters />
        </div>
      </div>

      <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border">
        <p className="font-medium mb-1">💡 Pro tip:</p>
        <p>Drag and drop milestones between status columns to update their status.</p>
      </div>

      {viewMode === "timeline" ? (
        <GlobalMilestoneTimeline milestones={displayMilestones} />
      ) : (
        <GroupedList
          groups={groupedMilestones}
          onItemMove={handleItemMove}
          onItemClick={handleItemClick}
          enableDragAndDrop={true}
        />
      )}

      {/* Create Milestone */}
      <CreateMilestoneDialog
        projectId={selectedProject || ""}
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) {
            // ensure global list refreshes after create dialog closes
            queryClient.invalidateQueries({ queryKey: ["milestones"] });
          }
        }}
      />

      {/* Details */}
      {selectedMilestone && (
        <MilestoneDetailsSheet
          milestoneId={selectedMilestone}
          open={!!selectedMilestone}
          onOpenChange={(open) => !open && setSelectedMilestone(null)}
        />
      )}
    </div>
  );
}

export default AllMilestones;

