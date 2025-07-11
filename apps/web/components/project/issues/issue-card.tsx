"use client";

import { FolderIcon } from "lucide-react";
import Link from "next/link";
import { IssueStatusField } from "@/components/ui/issue-fields/issue-status-field";
import { IssuePriorityField } from "@/components/ui/issue-fields/issue-priority-field";
import { IssueLabelField } from "@/components/ui/issue-fields/issue-label-field";
import { IssueDueDateField } from "@/components/ui/issue-fields/issue-due-date-field";
import { TableCell, TableRow } from "@workspace/ui/components/table";
import { useRouter } from "next/navigation";
//TODO come back this
// import { CustomIssue } from "@/types/project";
import { AssigneeSelector } from "@/components/ui/selectors/assignee-selector";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { toast } from "sonner";

export function IssueCard({
  issue,
  showProject = false,
  index,
}: {
  issue: any;
  showProject?: boolean;
  index: number;
}) {
  const router = useRouter();

  // Handler for interactive element clicks
  const handleInteractiveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const { token } = useSession();
  const changeLeader = useMutation(api.issue.quickAction.changeIssueAssignedTo);

  return (
    <>
      <TableRow
        className="w-full hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={() => router.push(`/issues/${issue._id}`)}
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
                    href={`/projects/${issue.project._id}`}
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
            issueId={issue._id}
          />
        </TableCell>
        <TableCell onClick={handleInteractiveClick}>
          <IssuePriorityField
            value={issue.priority}
            align="end"
            issueId={issue._id}
          />
        </TableCell>
        <TableCell onClick={handleInteractiveClick}>
          <IssueLabelField
            value={issue.label}
            align="end"
            issueId={issue._id}
          />
        </TableCell>
        <TableCell onClick={handleInteractiveClick}>
          <AssigneeSelector
            assignee={(issue.assignedTo as string) || ""}
            onChange={async (e) => {
              try {
                await changeLeader({
                  issueId: issue._id,
                  token,
                  userId: e as any,
                });
              } catch (error) {
                toast.error("Failed to change issue leader");
              }
            }}
          />
        </TableCell>
        <TableCell onClick={handleInteractiveClick}>
          <IssueDueDateField
            value={issue.dueDate ? new Date(issue.dueDate) : null}
            align="end"
            issueId={issue._id}
            disabled={!issue._id}
          />
        </TableCell>
      </TableRow>
    </>
  );
}
