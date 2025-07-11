"use client";

import { MessageSquare, FolderIcon } from "lucide-react";
import Link from "next/link";
import { IssuePriorityField } from "@/components/ui/issue-fields/issue-priority-field";
import { IssueLabelField } from "@/components/ui/issue-fields/issue-label-field";
import { IssueDueDateField } from "@/components/ui/issue-fields/issue-due-date-field";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CustomIssue } from "@/types/project";
import { AssigneeSelector } from "@/components/ui/selectors/assignee-selector";
import { useMutation } from "convex/react";
import { useData } from "@/hooks/use-data";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";

export function IssueKanbanCard({
  issue,
  showProject = false,
}: {
  issue: CustomIssue;
  showProject?: boolean;
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
      <div
        className="p-3 space-y-2.5 block cursor-pointer"
        onClick={() => router.push(`/issues/${issue._id}`)}
      >
        {/* Title and Project */}
        <div>
          <div className="group-hover:opacity-70 transition-opacity">
            <span className="text-sm font-medium text-foreground break-all">
              {issue.title}
            </span>
          </div>

          {showProject && issue.project && (
            <div onClick={handleInteractiveClick} className="inline-block">
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

        {/* Core Fields: Priority, Label, Assignee */}
        <div
          className="flex items-center flex-wrap gap-2"
          onClick={handleInteractiveClick}
        >
          <IssuePriorityField
            value={issue.priority}
            issueId={issue._id}
            align="end"
          />

          <IssueLabelField
            issueId={issue._id}
            value={issue.label}
            align="end"
          />

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
        </div>

        {/* Metadata Footer */}
        <div
          className="flex items-center flex-wrap justify-between"
          onClick={handleInteractiveClick}
        >
          <div className="flex items-center gap-1.5">
            {/* <IssueDependenciesCount
              dependencies={issue.dependencies}
              dependants={issue.dependants}
              variant="hover-card"
            /> */}
          </div>

          <IssueDueDateField
            value={issue.dueDate ? new Date(issue.dueDate) : null}
            issueId={issue._id}
            align="end"
          />
        </div>
      </div>
    </>
  );
}
