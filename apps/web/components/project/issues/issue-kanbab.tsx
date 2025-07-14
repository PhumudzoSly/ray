"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@/lib/utils";
import { IssueKanbanCard } from "./issue-kanbab-card";
import { status as issueStatuses } from "@/utils/constants/issues/status";
import { toast } from "sonner";
import { CustomIssue } from "@/types/project";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

interface IssuesKanbanProps {
  issues: CustomIssue[];
  showProject?: boolean;
}

export function IssuesKanban({ issues, showProject }: IssuesKanbanProps) {
  // Local state for optimistic updates
  const [optimisticIssues, setOptimisticIssues] = useState<CustomIssue[]>([]);
  const { token } = useSession();
  const updateStatus = useMutation(api.issue.quickAction.changeIssueStatus);

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
    {} as Record<string, CustomIssue[]>
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
      // Optimistic update
      const currentIssues =
        optimisticIssues.length > 0 ? optimisticIssues : issues;
      const updatedIssues = currentIssues.map((issue) =>
        issue._id === draggableId
          ? { ...issue, status: destinationStatus }
          : issue
      );
      setOptimisticIssues(updatedIssues);

      try {
        await updateStatus({
          issueId: draggableId,
          status: destinationStatus,
          token: token,
        });
        // Clear optimistic state on success
        setOptimisticIssues([]);
      } catch (error) {
        console.error("Failed to update issue status:", error);
        // Revert optimistic update on error
        setOptimisticIssues([]);
        toast.error("Failed to update issue status");
      }
    }
  };

  const StatusColumn = ({
    status,
    issues,
  }: {
    status: any;
    issues: CustomIssue[];
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
              <Draggable key={issue._id} draggableId={issue._id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                      "bg-card rounded-lg border",
                      snapshot.isDragging && "rotate-1 shadow-lg"
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
