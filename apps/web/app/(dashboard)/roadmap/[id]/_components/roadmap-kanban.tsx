"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";
import { RoadmapItemDetailsSheet } from "./roadmap-item-details-sheet";

const ROADMAP_STATUSES = [
  { id: "BACKLOG", label: "Backlog", color: "bg-gray-500", icon: AlertCircle },
  {
    id: "IN_PROGRESS",
    label: "In Progress",
    color: "bg-yellow-500",
    icon: Rocket,
  },
  { id: "REVIEW", label: "Review", color: "bg-purple-500", icon: Eye },
  { id: "DONE", label: "Done", color: "bg-green-500", icon: CheckCircle2 },
  { id: "BLOCKED", label: "Blocked", color: "bg-orange-500", icon: XCircle },
  { id: "CANCELLED", label: "Cancelled", color: "bg-red-500", icon: XCircle },
];

interface RoadmapKanbanProps {
  items: any[];
  stats: any;
  onAddItem: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

export function RoadmapKanban({
  items,
  stats,
  onAddItem,
  searchQuery,
  setSearchQuery,
}: RoadmapKanbanProps) {
  const { token } = useSession();
  const updateRoadmapItemMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) =>
      roadmapItemActions.updateRoadmapItem(id, data),
  });
  const deleteRoadmapItemMutation = useMutation({
    mutationFn: async ({ id }: any) => roadmapItemActions.deleteRoadmapItem(id),
  });

  // Local state for optimistic updates
  const [optimisticItems, setOptimisticItems] = useState<any[]>([]);
  const [optimisticDeletes, setOptimisticDeletes] = useState<Set<string>>(
    new Set()
  );

  // Sheet state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Use optimistic items if available, otherwise use props
  const displayItems = optimisticItems.length > 0 ? optimisticItems : items;

  // Filter out optimistically deleted items
  const filteredItems =
    displayItems?.filter((item) => !optimisticDeletes.has(item.id)) || [];

  // Group items by status
  const itemsByStatus = ROADMAP_STATUSES.reduce(
    (acc, status) => {
      acc[status.id] =
        filteredItems?.filter((item) => item.status === status.id) || [];
      return acc;
    },
    {} as Record<string, typeof filteredItems>
  );

  // Update status counts
  const statusesWithCounts = ROADMAP_STATUSES.map((status) => ({
    ...status,
    count: itemsByStatus[status.id]?.length || 0,
  }));

  // Handle drag and drop with optimistic updates
  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    // Optimistic update
    const currentItems = optimisticItems.length > 0 ? optimisticItems : items;
    const updatedItems = currentItems.map((item) =>
      item.id === draggableId
        ? { ...item, status: destination.droppableId }
        : item
    );
    setOptimisticItems(updatedItems);

    try {
      await updateRoadmapItemMutation.mutateAsync({
        id: draggableId as any,
        status: destination.droppableId,
        token: token,
      });
      toast.success("Item status updated");
      // Clear optimistic state on success
      setOptimisticItems([]);
    } catch (error) {
      toast.error("Failed to update item");
      // Revert optimistic update on error
      setOptimisticItems([]);
    }
  };

  // Handle toggling item visibility with optimistic updates
  const handleToggleVisibility = async (itemId: string, isPublic: boolean) => {
    // Optimistic update
    const currentItems = optimisticItems.length > 0 ? optimisticItems : items;
    const updatedItems = currentItems.map((item) =>
      item.id === itemId ? { ...item, isPublic: !isPublic } : item
    );
    setOptimisticItems(updatedItems);

    try {
      await updateRoadmapItemMutation.mutateAsync({
        id: itemId as any,
        isPublic: !isPublic,
        token: token,
      });
      toast.success(`Item is now ${!isPublic ? "public" : "private"}`);
      // Clear optimistic state on success
      setOptimisticItems([]);
    } catch (error) {
      toast.error("Failed to update visibility");
      // Revert optimistic update on error
      setOptimisticItems([]);
    }
  };

  // Handle delete item with optimistic updates
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    // Optimistic delete
    setOptimisticDeletes((prev) => new Set([...prev, itemId]));

    try {
      await deleteRoadmapItemMutation.mutateAsync({
        id: itemId as any,
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
  };

  // Handle opening item details
  const handleItemClick = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedItemId(null);
  };

  const RoadmapItem = ({ item }: { item: any }) => {
    const StatusIcon =
      ROADMAP_STATUSES.find((s) => s.id === item.status)?.icon || AlertCircle;
    const statusColor =
      ROADMAP_STATUSES.find((s) => s.id === item.status)?.color ||
      "bg-gray-500";

    return (
      <div
        className="p-3 rounded-lg bg-card border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleItemClick(item.id)}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex gap-2 items-center">
            <Badge
              className={`${statusColor} text-white flex-shrink-0`}
              variant="secondary"
            >
              <StatusIcon className="w-3 h-3" />
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

        <h3 className="font-medium mb-1 text-sm">{item.title}</h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              <span>{item.voteCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{item.feedbackCount}</span>
            </div>
          </div>

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
    <div className="flex-1 min-w-[280px]">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${status.color}`} />
          <h3 className="font-medium">{status.label}</h3>
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
            className={`min-h-[60vh] p-2 rounded-lg border-2 border-dashed transition-colors ${
              snapshot.isDraggingOver
                ? "border-primary bg-primary/5"
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
                    className={`mb-3 ${snapshot.isDragging ? "rotate-1 shadow-lg" : ""}`}
                  >
                    <RoadmapItem item={item} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-sm mb-2">
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
      <div className="flex items-center justify-between gap-4">
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

        <Button onClick={() => onAddItem("REVIEW")}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <Rocket className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium">{stats.totalItems}</p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/20">
              <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium">{stats.publicCount}</p>
              <p className="text-xs text-muted-foreground">Public</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <ThumbsUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium">{stats.totalVotes}</p>
              <p className="text-xs text-muted-foreground">Votes</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium">{stats.totalFeedback}</p>
              <p className="text-xs text-muted-foreground">Feedback</p>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
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
