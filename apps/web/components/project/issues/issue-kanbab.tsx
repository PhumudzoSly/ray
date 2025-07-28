"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@/lib/utils";
import { IssueKanbanCard } from "./issue-kanbab-card";
import { status as issueStatuses } from "@/utils/constants/issues/status";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as issueActions from "@/actions/issue";
import { useRouter } from "next/navigation";
import { IssueStatus } from "@workspace/backend/prisma/generated/client/client";

interface IssuesKanbanProps {
  issues: any[];
  showProject?: boolean;
}

export function IssuesKanban({ issues, showProject }: IssuesKanbanProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Local state for optimistic updates
  const [optimisticIssues, setOptimisticIssues] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      issueId,
      status,
    }: {
      issueId: string;
      status: IssueStatus;
    }) => {
      const issue = displayIssues.find((i) => i.id === issueId);
      if (!issue) throw new Error("Issue not found");
      return issueActions.updateIssue(issueId, { ...issue, status });
    },
    onMutate: async ({ issueId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["issues"] });

      // Snapshot the previous value
      const previousIssues = queryClient.getQueryData(["issues"]);

      // Optimistically update to the new value
      const currentIssues =
        optimisticIssues.length > 0 ? optimisticIssues : issues;
      const updatedIssues = currentIssues.map((issue) =>
        issue.id === issueId ? { ...issue, status } : issue
      );
      setOptimisticIssues(updatedIssues);
      setIsUpdating(issueId);

      // Return a context object with the snapshotted value
      return { previousIssues };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousIssues) {
        setOptimisticIssues([]);
      }
      setIsUpdating(null);

      console.error("Failed to update issue status:", err);
      if (
        err instanceof Error &&
        err.message?.includes("Cannot mark issue as DONE")
      ) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update issue status");
      }
    },
    onSuccess: (data, variables) => {
      // Clear optimistic state
      setOptimisticIssues([]);
      setIsUpdating(null);

      // Show success message
      toast.success("Issue status updated successfully");

      // Refresh the route to get the latest data
      router.refresh();

      // Invalidate and refetch issues
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
    onSettled: () => {
      // Always clear loading state
      setIsUpdating(null);
    },
  });

  // Use optimistic issues if available, otherwise use props
  const displayIssues = optimisticIssues.length > 0 ? optimisticIssues : issues;

  // Group issues by status
  const issuesByStatus = issueStatuses.reduce(
    (acc, status) => {
      acc[status.id] = displayIssues.filter(
        (issue) => issue.status === status.id
      );
      return acc;
    },
    {} as Record<string, any[]>
  );

  // Update status counts
  const statusesWithCounts = issueStatuses.map((status) => ({
    ...status,
    count: issuesByStatus[status.id]?.length || 0,
  }));

  // Handle drag end with optimistic updates
  const handleDragEnd = async (result: any) => {
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
      try {
        await updateStatusMutation.mutateAsync({
          issueId: draggableId,
          status: destinationStatus,
        });
      } catch (error) {
        // Error handling is done in the mutation's onError callback
        console.error("Drag and drop failed:", error);
      }
    }
  };

  const StatusColumn = ({
    status,
    issues,
  }: {
    status: any;
    issues: any[];
  }) => (
    <div className="flex-1 min-w-[350px]">
      <div className="bg-card p-3 rounded-lg mb-3 border">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <status.icon className={cn("h-4 w-4", status.colorClass)} />
            <h3 className="font-medium">{status.name}</h3>
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
            className={cn(
              "min-h-[200px] p-2 rounded-lg border-2 border-dashed transition-colors space-y-3",
              snapshot.isDraggingOver
                ? "border-primary bg-primary/5"
                : "border-muted bg-muted/20"
            )}
          >
            {issues.map((issue, index) => (
              <Draggable key={issue.id} draggableId={issue.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                      "bg-card rounded-lg border transition-all",
                      snapshot.isDragging && "rotate-1 shadow-lg",
                      isUpdating === issue.id &&
                        "opacity-50 pointer-events-none"
                    )}
                  >
                    <IssueKanbanCard
                      issue={issue}
                      showProject={showProject}
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {issues.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-sm">
                  No issues in {status.name.toLowerCase()}
                </div>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full p-2 overflow-x-auto pb-4">
        {statusesWithCounts.map((status) => (
          <StatusColumn
            key={status.id}
            status={status}
            issues={issuesByStatus[status.id] || []}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
