"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as roadmapItemActions from "@/actions/roadmap/items";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ThumbsUp,
  MessageSquare,
  Settings,
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
import { useRouter } from "next/navigation";
import { PrioritySelector } from "@/components/ui/selectors/priority-selector";
import { Status, status } from "@/utils/constants/issues/status";
import { Separator } from "@workspace/ui/components/separator";
import { DateSelector } from "@/components/ui/selectors";
import { IssueLabelField } from "@/components/ui/issue-fields/issue-label-field";
import { LabelSelector } from "@/components/ui/selectors/label-selector";
import { useConfirm } from "@workspace/ui/components/confirm-dialog";

interface RoadmapKanbanProps {
  roadmapId: string;
  onAddItem: (status: IssueStatus) => void;
}

export function RoadmapKanban({ roadmapId, onAddItem }: RoadmapKanbanProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  // Fetch roadmap items with rich data
  const { data: items = [], isLoading: isPending } = useQuery({
    queryKey: ["roadmapItems", roadmapId],
    queryFn: () => roadmapItemActions.getAllRoadmapItems(roadmapId),
    select: (res) => (res?.success ? res.data : []),
  });

  // Local state for optimistic updates
  const [optimisticItems, setOptimisticItems] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const updateRoadmapItemMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) =>
      roadmapItemActions.updateRoadmapItem(id, data),
    onMutate: async ({ id, ...data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["roadmapItems", roadmapId],
      });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData([
        "roadmapItems",
        roadmapId,
      ]);

      // Only update optimistic state if not already updated (e.g., by drag and drop)
      if (optimisticItems.length === 0) {
        // Optimistically update to the new value
        const updatedItems = items.map((item) =>
          item.id === id ? { ...item, ...data } : item
        );
        setOptimisticItems(updatedItems);
      }
      setIsUpdating(id);

      // Return a context object with the snapshotted value
      return { previousItems };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousItems) {
        setOptimisticItems([]);
      }
      setIsUpdating(null);

      console.error("Failed to update roadmap item:", err);
      toast.error("Failed to update roadmap item");
    },
    onSuccess: (data, variables) => {
      // Clear optimistic state
      setOptimisticItems([]);
      setIsUpdating(null);

      // Show success message
      toast.success("Roadmap item updated successfully");

      // Refresh the route to get the latest data
      router.refresh();

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["roadmapItems", roadmapId] });
      queryClient.invalidateQueries({ queryKey: ["roadmapStats", roadmapId] });
    },
    onSettled: () => {
      // Always clear loading state
      setIsUpdating(null);
    },
  });

  const deleteRoadmapItemMutation = useMutation({
    mutationFn: async ({ id }: any) => roadmapItemActions.deleteRoadmapItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmapItems", roadmapId] });
      queryClient.invalidateQueries({ queryKey: ["roadmapStats", roadmapId] });
      toast.success("Item deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete roadmap item:", error);
      toast.error("Failed to delete item");
    },
  });

  // Sheet state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Use optimistic items if available, otherwise use server data
  const displayItems = optimisticItems.length > 0 ? optimisticItems : items;

  // Group items by status with proper ordering
  const itemsByStatus = useMemo(() => {
    return status.reduce(
      (acc, status) => {
        const statusItems =
          displayItems?.filter((item) => item.status === status.id) || [];
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
      {} as Record<string, typeof displayItems>
    );
  }, [displayItems]);

  // Update status counts
  const statusesWithCounts = status.map((status) => ({
    ...status,
    count: itemsByStatus[status.id]?.length || 0,
  }));

  // Handle drag end with optimistic updates
  const handleDragEnd = useCallback(
    async (result: any) => {
      const { destination, source, draggableId } = result;

      if (!destination) return;
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      )
        return;

      const sourceStatus = source.droppableId;
      const destinationStatus = destination.droppableId;

      // Only update status if column changed
      if (sourceStatus !== destinationStatus) {
        // Perform optimistic update immediately
        const currentItems =
          optimisticItems.length > 0 ? optimisticItems : items;
        const draggedItem = currentItems.find(
          (item) => item.id === draggableId
        );

        if (draggedItem) {
          const updatedItems = currentItems.map((item) =>
            item.id === draggableId
              ? { ...item, status: destinationStatus }
              : item
          );
          setOptimisticItems(updatedItems);
          setIsUpdating(draggableId);
        }

        try {
          await updateRoadmapItemMutation.mutateAsync({
            id: draggableId,
            status: destinationStatus,
          });
        } catch (error) {
          // Error handling is done in the mutation's onError callback
          console.error("Drag and drop failed:", error);
        }
      }
    },
    [updateRoadmapItemMutation, optimisticItems, items]
  );

  // Handle toggling item visibility with optimistic updates
  const handleToggleVisibility = useCallback(
    async (itemId: string, isPublic: boolean) => {
      try {
        await updateRoadmapItemMutation.mutateAsync({
          id: itemId,
          isPublic: !isPublic,
        });
      } catch (error) {
        // Error handling is done in the mutation's onError callback
        console.error("Visibility toggle failed:", error);
      }
    },
    [updateRoadmapItemMutation]
  );

  // Handle delete item
  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      const result = await confirm({
        title: "Delete Item",
        description: "Are you sure you want to delete this item?",
        confirmText: "Delete",
        cancelText: "Cancel",
      });

      if (!result) return;

      try {
        await deleteRoadmapItemMutation.mutateAsync({ id: itemId });
      } catch (error) {
        // Error handling is done in the mutation's onError callback
        console.error("Delete failed:", error);
      }
    },
    [deleteRoadmapItemMutation]
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
      status.find((s) => s.id === item.status)?.icon || AlertCircle;
    const statusColor =
      status.find((s) => s.id === item.status)?.color || "bg-gray-500";

    const isOverdue =
      item.targetDate &&
      new Date(item.targetDate) < new Date() &&
      item.status !== "DONE";

    return (
      <div
        className={`p-4 rounded-lg bg-card border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
          isUpdating === item.id ? "opacity-50 pointer-events-none" : ""
        }`}
        onClick={() => handleItemClick(item.id)}
      >
        <div className="space-y-2 mb-1">
          <div className="flex items-center gap-2">
            <PrioritySelector priority={item.priority} iconOnly />

            <LabelSelector selectedLabel={item.category} />
            <Badge variant={item.isPublic ? "info" : "warning"}>
              {item.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
          <h3 className="font-medium text-sm leading-tight line-clamp-1">
            {item.title}
          </h3>
        </div>

        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
          {item.description}
        </p>
        <DateSelector value={item.targetDate} onChange={() => {}} />

        {/* Metrics row */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 border p-1.5 rounded-sm bg-muted">
              <ThumbsUp className="w-3 h-3" />
              <span>{item.voteCount}</span>
            </div>
            <div className="flex items-center gap-1 border p-1.5 rounded-sm bg-muted">
              <MessageSquare className="w-3 h-3" />
              <span>{item.feedbackCount}</span>
            </div>
            {item.positiveFeedbackCount > 0 && (
              <div className="flex items-center gap-1 text-green-600 bg-muted">
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

  const StatusColumn = ({
    status,
    items,
  }: {
    status: Status;
    items: any[];
  }) => (
    <div className="flex-1 min-w-[320px]">
      <div className="mb-4 py-3 px-4 border border-border rounded-lg bg-muted/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {status.icon && <status.icon className={status.colorClass} />}
            <h3 className="font-medium">{status.name}</h3>
            {/* <Badge variant="secondary" className="text-xs">
              {status.count}
            </Badge> */}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onAddItem(status.id as IssueStatus)}
            className="h-7 px-2"
          >
            <Plus className="h-3 w-3" />
          </Button>
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
                <div className="text-sm mb-3">No items</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddItem(status.id as IssueStatus)}
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
      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
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
