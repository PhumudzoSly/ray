"use client";

import { FolderIcon } from "lucide-react";
import Link from "next/link";
import { IssueStatusField } from "@/components/ui/issue-fields/issue-status-field";
import { IssuePriorityField } from "@/components/ui/issue-fields/issue-priority-field";
import { IssueLabelField } from "@/components/ui/issue-fields/issue-label-field";
import { IssueDueDateField } from "@/components/ui/issue-fields/issue-due-date-field";
import { TableCell, TableRow } from "@workspace/ui/components/table";
import { useRouter } from "next/navigation";
import { CustomIssue } from "@/types/project";
import { AssigneeSelector } from "@/components/ui/selectors/assignee-selector";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as issueActions from "@/actions/issue";
import { toast } from "sonner";

export function IssueCard({
  issue,
  showProject = false,
  index,
}: {
  issue: CustomIssue;
  showProject?: boolean;
  index: number;
}) {
  const router = useRouter();

  // Handler for interactive element clicks
  const handleInteractiveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const queryClient = useQueryClient();
  // Optimistic update mutation for assignee
  const updateAssigneeMutation = useMutation({
    mutationFn: async ({ issueId, assignedTo }: { issueId: string; assignedTo: string }) => {
      return await issueActions.updateIssue(issueId, { assignedToId: assignedTo });
    },
    onMutate: async ({ issueId, assignedTo }) => {
      await queryClient.cancelQueries({ queryKey: ["issues"] });
      const previousIssues = queryClient.getQueryData<CustomIssue[]>(["issues"]);
      queryClient.setQueryData<CustomIssue[]>(["issues"], (old) => {
        if (!old) return old;
        return old.map((i) =>
          i.id === issueId ? { ...i, assignedTo } : i
        );
      });
      return { previousIssues };
    },
    onError: (err, variables, context) => {
      if (context?.previousIssues) {
        queryClient.setQueryData(["issues"], context.previousIssues);
      }
      toast.error("Failed to change issue leader");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });

  return (
    <>
      <TableRow
        className="w-full hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={() => router.push(`/issues/${issue.id}`)}
      >
        <TableCell>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <h6 className="text-sm font-medium text-foreground whitespace-nowrap break-all pr-4 group-hover:underline underline-offset-4">
                  {issue.title}
                </h6>
              </div>
              {showProject && issue.project && (
                <div onClick={handleInteractiveClick}>
                  <Link
                    href={`/project/${issue.project.id}`}
                    className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <FolderIcon className="h-3 w-3" />
                    <span>{issue.project.name}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell onClick={handleInteractiveClick}>
          <IssueStatusField
            value={issue.status}
            align="end"
            issueId={issue.id}
          />
        </TableCell>
        <TableCell onClick={handleInteractiveClick}>
          <IssuePriorityField
            value={issue.priority}
            align="end"
            issueId={issue.id}
          />
        </TableCell>
        <TableCell onClick={handleInteractiveClick}>
          <IssueLabelField
            value={issue.label}
            align="end"
            issueId={issue.id}
          />
        </TableCell>
        <TableCell onClick={handleInteractiveClick}>
          <AssigneeSelector
            assignee={(issue.assignedTo as string) || ""}
            onChange={async (e) => {
              updateAssigneeMutation.mutate({
                issueId: issue.id,
                assignedTo: e as string,
              });
            }}
          />
        </TableCell>
        <TableCell onClick={handleInteractiveClick}>
          <IssueDueDateField
            value={issue.dueDate ? new Date(issue.dueDate) : null}
            align="end"
            issueId={issue.id}
            disabled={!issue.id}
          />
        </TableCell>
      </TableRow>
    </>
  );
}
