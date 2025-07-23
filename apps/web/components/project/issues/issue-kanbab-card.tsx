"use client";

import { FolderIcon } from "lucide-react";
import Link from "next/link";
import { IssueLabelField } from "@/components/ui/issue-fields/issue-label-field";
import { IssueDueDateField } from "@/components/ui/issue-fields/issue-due-date-field";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CustomIssue } from "@/types/project";
import { AssigneeSelector } from "@/components/ui/selectors/assignee-selector";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as issueActions from "@/actions/issue";
import { PrioritySelector } from "@/components/ui/selectors/priority-selector";

interface IssueKanbanCardProps {
  issue: CustomIssue;
  showProject?: boolean;
  isDragging?: boolean;
}

export function IssueKanbanCard({
  issue,
  showProject = false,
  isDragging = false,
}: IssueKanbanCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const changeLeaderMutation = useMutation({
    mutationFn: async ({
      issueId,
      userId,
    }: {
      issueId: string;
      userId: string;
    }) => issueActions.updateIssue(issueId, { assignedToId: userId } as any),
    onMutate: async ({ issueId, userId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["issues"] });
      await queryClient.cancelQueries({ queryKey: ["issues-grouped"] });

      // Snapshot the previous values
      const previousIssues = queryClient.getQueryData(["issues"]);
      const previousGroupedIssues = queryClient.getQueryData([
        "issues-grouped",
      ]);

      // Optimistically update the grouped issues structure
      queryClient.setQueryData(["issues-grouped"], (old: any[] | undefined) => {
        if (!old) return old;
        return old.map((group) => ({
          ...group,
          items: group.items.map((issue: any) =>
            issue.id === issueId
              ? {
                  ...issue,
                  assignedToId: userId,
                  assignedTo: { id: userId, name: "Loading..." },
                }
              : issue
          ),
        }));
      });

      // Also update the flat issues array if it exists
      queryClient.setQueryData(["issues"], (old: any[] | undefined) => {
        if (!old) return old;
        return old.map((issue: any) =>
          issue.id === issueId
            ? {
                ...issue,
                assignedToId: userId,
                assignedTo: { id: userId, name: "Loading..." },
              }
            : issue
        );
      });

      return { previousIssues, previousGroupedIssues };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousIssues) {
        queryClient.setQueryData(["issues"], context.previousIssues);
      }
      if (context?.previousGroupedIssues) {
        queryClient.setQueryData(
          ["issues-grouped"],
          context.previousGroupedIssues
        );
      }

      console.error("Failed to change issue assignee:", err);
      toast.error("Failed to change issue assignee");
    },
    onSuccess: (data, variables) => {
      // Show success message
      toast.success("Assignee updated successfully");

      // Refresh the route to get the latest data
      router.refresh();

      // Invalidate and refetch issues
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["issues-grouped"] });
    },
  });

  // Handler for interactive element clicks
  const handleInteractiveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCardClick = () => {
    if (!isDragging) {
      router.push(`/issues/${issue.id}`);
    }
  };

  return (
    <div
      className="p-3 space-y-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={handleCardClick}
    >
      {/* Title and Project */}
      <div className="space-y-1">
        <div className="group-hover:opacity-70 flex gap-2 items-center transition-opacity">
          <PrioritySelector priority={issue.priority} iconOnly />
          <div className="text-sm font-medium text-foreground break-words line-clamp-1">
            {issue.title}
          </div>
        </div>

        {showProject && issue.project && (
          <div onClick={handleInteractiveClick} className="inline-block">
            <Link
              href={`/project/${issue.project.id}`}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <FolderIcon className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{issue.project.name}</span>
            </Link>
          </div>
        )}
      </div>

      {/* Core Fields: Priority, Label, Assignee */}
      <div
        className="flex items-center flex-wrap gap-2"
        onClick={handleInteractiveClick}
      >
        <AssigneeSelector
          assignee={(issue.assignedTo as string) || ""}
          iconOnly
          onChange={async (userId) => {
            try {
              await changeLeaderMutation.mutateAsync({
                issueId: issue.id,
                userId: userId as string,
              });
            } catch (error) {
              // Error handling is done in the mutation's onError callback
              console.error("Assignee update failed:", error);
            }
          }}
        />
        <IssueLabelField issueId={issue.id} value={issue.label} align="end" />

        <IssueDueDateField
          value={issue.dueDate ? new Date(issue.dueDate) : null}
          issueId={issue.id}
          align="end"
        />
      </div>
    </div>
  );
}
