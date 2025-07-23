"use client";

import { useState, useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as roadmapItemActions from "@/actions/roadmap/items";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ThumbsUp,
  MessageSquare,
  Settings,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Hourglass,
  Rocket,
  Calendar,
  TrendingUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@workspace/ui/components/dropdown-menu";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";
import { RoadmapItemDetailsSheet } from "./roadmap-item-details-sheet";
import { IssueStatus } from "@workspace/backend/prisma/generated/client/client";
import { formatDistanceToNow } from "date-fns";

const ROADMAP_STATUSES = [
  { id: "BACKLOG", label: "Backlog", color: "bg-gray-500", icon: AlertCircle },
  {
    id: "IN_PROGRESS",
    label: "In Progress",
    color: "bg-yellow-500",
    icon: Rocket,
  },
  { id: "IN_REVIEW", label: "In Review", color: "bg-purple-500", icon: Eye },
  { id: "DONE", label: "Done", color: "bg-green-500", icon: CheckCircle2 },
  { id: "BLOCKED", label: "Blocked", color: "bg-orange-500", icon: XCircle },
  { id: "CANCELLED", label: "Cancelled", color: "bg-red-500", icon: XCircle },
];

const PRIORITY_COLORS = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-blue-500",
};

const PRIORITY_LABELS = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

interface RoadmapKanbanProps {
  roadmapId: string;
  onAddItem: (status: IssueStatus) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

export function RoadmapKanban({
  roadmapId,
  onAddItem,
  searchQuery,
  setSearchQuery,
}: RoadmapKanbanProps) {
  const { token } = useSession();
  const queryClient = useQueryClient();

  // Fetch roadmap items with rich data
  const { data: items = [], isLoading: isPending } = useQuery({
    queryKey: ["roadmapItems", roadmapId],
    queryFn: () => roadmapItemActions.getAllRoadmapItems(roadmapId),
    select: (res) => (res?.success ? res.data : []),
  });

  const updateRoadmapItemMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) =>
      roadmapItemActions.updateRoadmapItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmapItems", roadmapId] });
      queryClient.invalidateQueries({ queryKey: ["roadmapStats", roadmapId] });
    },
  });

  const deleteRoadmapItemMutation = useMutation({
    mutationFn: async ({ id }: any) => roadmapItemActions.deleteRoadmapItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmapItems", roadmapId] });
      queryClient.invalidateQueries({ queryKey: ["roadmapStats", roadmapId] });
    },
  });

  // Optimistic state management
  const [optimisticItems, setOptimisticItems] = useState<any[]>([]);
  const [optimisticDeletes, setOptimisticDeletes] = useState<Set<string>>(
    new Set()
  );
  const [isDragging, setIsDragging] = useState(false);

  // Sheet state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Use optimistic items if available, otherwise use server data
  const displayItems = optimisticItems.length > 0 ? optimisticItems : items;

  // Filter out optimistically deleted items
  const filteredItems =
    displayItems?.filter((item) => !optimisticDeletes.has(item.id)) || [];

  // Group items by status with proper ordering
  const itemsByStatus = useMemo(() => {
    return ROADMAP_STATUSES.reduce(
      (acc, status) => {
        const statusItems =
          filteredItems?.filter((item) => item.status === status.id) || [];
        // Sort by priority, then by vote count, then by creation date
        acc[status.id] = statusItems.sort((a, b) => {
          const priorityOrder: Record<string, number> = {
            CRITICAL: 4,
            HIGH: 3,
            MEDIUM: 2,
            LOW: 1,
          };
          const aPriority =
            priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          const bPriority =
            priorityOrder[b.priority as keyof typeof priorityOrder] || 0;

          if (aPriority !== bPriority) return bPriority - aPriority;
          if (a.voteCount !== b.voteCount) return b.voteCount - a.voteCount;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
        return acc;
      },
      {} as Record<string, typeof filteredItems>
    );
  }, [filteredItems]);

  // Update status counts
  const statusesWithCounts = ROADMAP_STATUSES.map((status) => ({
    ...status,
    count: itemsByStatus[status.id]?.length || 0,
  }));

  // Handle drag start - immediate optimistic update
  const onDragStart = useCallback(
    (result: any) => {
      setIsDragging(true);
      const { draggableId, source } = result;

      // Immediately update the UI optimistically
      const currentItems = optimisticItems.length > 0 ? optimisticItems : items;
      const updatedItems = currentItems.map((item) =>
        item.id === draggableId ? { ...item, status: source.droppableId } : item
      );
      setOptimisticItems(updatedItems);
    },
    [optimisticItems, items]
  );

  // Handle drag end with smooth optimistic updates
  const onDragEnd = useCallback(
    async (result: any) => {
      setIsDragging(false);
      const { destination, source, draggableId } = result;

      if (
        !destination ||
        (destination.droppableId === source.droppableId &&
          destination.index === source.index)
      ) {
        // Reset optimistic state if no change
        setOptimisticItems([]);
        return;
      }

      try {
        // The optimistic update is already applied, just persist it
        await updateRoadmapItemMutation.mutateAsync({
          id: draggableId,
          status: destination.droppableId,
          token: token,
        });

        // Clear optimistic state on success
        setOptimisticItems([]);
        toast.success("Item moved successfully");
      } catch (error) {
        // Revert optimistic update on error
        setOptimisticItems([]);
        toast.error("Failed to move item");
      }
    },
    [updateRoadmapItemMutation, token]
  );

  // Handle toggling item visibility with optimistic updates
  const handleToggleVisibility = useCallback(
    async (itemId: string, isPublic: boolean) => {
      // Optimistic update
      const currentItems = optimisticItems.length > 0 ? optimisticItems : items;
      const updatedItems = currentItems.map((item) =>
        item.id === itemId ? { ...item, isPublic: !isPublic } : item
      );
      setOptimisticItems(updatedItems);

      try {
        await updateRoadmapItemMutation.mutateAsync({
          id: itemId,
          isPublic: !isPublic,
          token: token,
        });
        setOptimisticItems([]);
        toast.success(`Item is now ${!isPublic ? "public" : "private"}`);
      } catch (error) {
        setOptimisticItems([]);
        toast.error("Failed to update visibility");
      }
    },
    [optimisticItems, items, updateRoadmapItemMutation, token]
  );

  // Handle delete item with optimistic updates
  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      if (!confirm("Are you sure you want to delete this item?")) return;

      // Optimistic delete
      setOptimisticDeletes((prev) => new Set([...prev, itemId]));

      try {
        await deleteRoadmapItemMutation.mutateAsync({
          id: itemId,
          token: token,
        });
        toast.success("Item deleted");
        // Keep the optimistic delete until next data refresh
      } catch (error) {
        toast.error("Failed to delete item");
        // Revert optimistic delete on error
        setOptimisticDeletes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    },
    [deleteRoadmapItemMutation, token]
  );

  // Handle opening item details
  const handleItemClick = useCallback((itemId: string) => {
    setSelectedItemId(itemId);
    setIsSheetOpen(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
    setSelectedItemId(null);
  }, []);

  const RoadmapItem = ({ item }: { item: any }) => {
    const StatusIcon =
      ROADMAP_STATUSES.find((s) => s.id === item.status)?.icon || AlertCircle;
    const statusColor =
      ROADMAP_STATUSES.find((s) => s.id === item.status)?.color ||
      "bg-gray-500";
    const priorityColor =
      PRIORITY_COLORS[item.priority as keyof typeof PRIORITY_COLORS] ||
      "bg-gray-500";
    const isOverdue =
      item.targetDate &&
      new Date(item.targetDate) < new Date() &&
      item.status !== "DONE";

    return (
      <div
        className={`p-4 rounded-lg bg-card border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
          isDragging ? "transform rotate-1 scale-105" : ""
        }`}
        onClick={() => handleItemClick(item.id)}
      >
        {/* Header with status and priority */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex gap-2 items-center flex-wrap">
            <Badge
              className={`${statusColor} text-white flex-shrink-0`}
              variant="secondary"
            >
              <StatusIcon className="w-3 h-3" />
            </Badge>
            <Badge
              className={`${priorityColor} text-white flex-shrink-0`}
              variant="secondary"
            >
              {PRIORITY_LABELS[item.priority as keyof typeof PRIORITY_LABELS]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {item.category}
            </Badge>
          </div>
          <Badge
            variant={item.isPublic ? "default" : "secondary"}
            className="text-xs"
          >
            {item.isPublic ? "Public" : "Private"}
          </Badge>
        </div>

        {/* Title and description */}
        <h3 className="font-medium mb-2 text-sm leading-tight">{item.title}</h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Target date indicator */}
        {item.targetDate && (
          <div
            className={`flex items-center gap-1 mb-3 text-xs ${
              isOverdue ? "text-red-500" : "text-muted-foreground"
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>
              {isOverdue ? "Overdue" : "Due"}{" "}
              {formatDistanceToNow(new Date(item.targetDate), {
                addSuffix: true,
              })}
            </span>
          </div>
        )}

        {/* Metrics row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              <span>{item.voteCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{item.feedbackCount}</span>
            </div>
            {item.positiveFeedbackCount > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>{item.positiveFeedbackCount}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleVisibility(item.id, item.isPublic);
              }}
            >
              {item.isPublic ? (
                <EyeOff className="w-3 h-3" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Settings className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  };

  const StatusColumn = ({ status, items }: { status: any; items: any[] }) => (
    <div className="flex-1 min-w-[320px]">
      <div className="mb-4 py-3 px-4 border border-border rounded-lg bg-muted/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${status.color}`} />
            <h3 className="font-medium">{status.label}</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {status.count}
          </Badge>
        </div>
      </div>

      <Droppable droppableId={status.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[70vh] p-3 rounded-lg border-2 border-dashed transition-all duration-200 ${
              snapshot.isDraggingOver
                ? "border-primary bg-primary/5 scale-105"
                : "border-muted bg-muted/20"
            }`}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-3 transition-all duration-200 ${
                      snapshot.isDragging
                        ? "rotate-2 shadow-xl scale-105 z-50"
                        : ""
                    }`}
                  >
                    <RoadmapItem item={item} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {items.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-sm mb-3">
                  No {status.label.toLowerCase()} items
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddItem(status.id)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add item
                </Button>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[280px]"
            />
          </div>
        </div>

        <Button onClick={() => onAddItem("IN_REVIEW")}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-full overflow-x-auto pb-4">
          {statusesWithCounts.map((status) => (
            <StatusColumn
              key={status.id}
              status={status}
              items={itemsByStatus[status.id] || []}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Roadmap Item Details Sheet */}
      <RoadmapItemDetailsSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        itemId={selectedItemId as any}
      />
    </div>
  );
}
