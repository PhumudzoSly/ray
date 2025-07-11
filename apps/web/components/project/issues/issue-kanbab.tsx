"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { IssueKanbanCard } from "./issue-kanbab-card";
import { status as issueStatuses } from "@/utils/constants/issues/status";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { CustomIssue } from "@/types/project";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";

type IssuesKanbanProps = {
  issues: CustomIssue[];
  showProject?: boolean;
};

export function IssuesKanban({ issues, showProject }: IssuesKanbanProps) {
  const searchParams = useSearchParams();

  // Function to group issues by status
  const groupIssuesByStatus = React.useCallback((issues: any[]) => {
    return issueStatuses.reduce(
      (acc: Record<string, any[]>, status) => {
        acc[status.id] = issues.filter((issue) => issue.status === status.id);
        return acc;
      },
      {} as Record<string, any[]>
    );
  }, []);

  const [groupedIssues, setGroupedIssues] = React.useState(() =>
    groupIssuesByStatus(issues)
  );

  // Update grouped issues when issues prop changes
  React.useEffect(() => {
    setGroupedIssues(groupIssuesByStatus(issues));
  }, [issues, groupIssuesByStatus]);

  const updateStatus = useMutation(api.issue.quickAction.changeIssueStatus);

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    const sourceStatus = source.droppableId;
    const destinationStatus = destination.droppableId;

    // If dropped in the same column and same position
    if (
      sourceStatus === destinationStatus &&
      source.index === destination.index
    ) {
      return;
    }

    const issue = issues.find((i) => i._id === draggableId);

    if (!issue) return;

    // Store original state for rollback
    const originalGroupedIssues = { ...groupedIssues };
    const { token } = useSession();

    // Optimistically update the state
    setGroupedIssues((prev) => {
      const newGroups = { ...prev };
      const sourceIssues = [...newGroups[sourceStatus]];
      const [removed] = sourceIssues.splice(source.index, 1);

      if (sourceStatus === destinationStatus) {
        sourceIssues.splice(destination.index, 0, removed);
        newGroups[sourceStatus] = sourceIssues;
      } else {
        const destinationIssues = [...newGroups[destinationStatus]];
        destinationIssues.splice(destination.index, 0, {
          ...removed,
          status: destinationStatus,
        });
        newGroups[sourceStatus] = sourceIssues;
        newGroups[destinationStatus] = destinationIssues;
      }

      return newGroups;
    });

    // Update issue status if column changed
    if (sourceStatus !== destinationStatus) {
      try {
        // TODO Update status
        const result = await updateStatus({
          issueId: draggableId,
          status: destinationStatus,
          token: token,
        });
      } catch (error) {
        console.error("Failed to update issue status:", error);
        // Revert to original state on error
        setGroupedIssues(originalGroupedIssues);
        toast.error("Failed to update issue status");
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex">
          <ScrollArea className="flex-1 w-1">
            <div className="flex gap-4 pb-8">
              {issueStatuses.map((status) => (
                <div
                  key={status.id}
                  className="w-[350px] flex-shrink-0 flex flex-col gap-3 bg-muted/30 p-3 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <status.icon
                        className={cn("h-4 w-4", status.colorClass)}
                      />
                      <h3 className="font-medium">{status.name}</h3>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {groupedIssues[status.id]?.length || 0}
                    </span>
                  </div>

                  <Droppable droppableId={status.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "flex-1 space-y-3 min-h-[200px] overflow-y-auto",
                          snapshot.isDraggingOver &&
                            "bg-muted/50 rounded-lg p-2"
                        )}
                        style={{ maxHeight: "calc(100vh - 350px)" }}
                      >
                        {groupedIssues[status.id]?.map((issue, index) => (
                          <Draggable
                            key={issue._id}
                            draggableId={issue._id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "bg-card rounded-lg border",
                                  snapshot.isDragging && "shadow-lg"
                                )}
                              >
                                <IssueKanbanCard
                                  issue={issue}
                                  showProject={showProject}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-3" />
          </ScrollArea>
        </div>
      </DragDropContext>
    </div>
  );
}
