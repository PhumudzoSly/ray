"use client";

import { FolderIcon } from "lucide-react";
import Link from "next/link";
import { IssuePriorityField } from "@workspace/ui/components/issue-fields/issue-priority-field";
import { IssueLabelField } from "@workspace/ui/components/issue-fields/issue-label-field";
import { IssueDueDateField } from "@workspace/ui/components/issue-fields/issue-due-date-field";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CustomIssue } from "@/types/project";
import { AssigneeSelector } from "@/components/ui/selectors/assignee-selector";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";

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
  const { token } = useSession();
  const changeLeader = useMutation(api.issue.quickAction.changeIssueAssignedTo);

  // Handler for interactive element clicks
  const handleInteractiveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCardClick = () => {
    if (!isDragging) {
      router.push(`/issues/${issue._id}`);
    }
  };

  return (
    <div
      className="p-3 space-y-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={handleCardClick}
    >
      {/* Title and Project */}
      <div className="space-y-1">
        <div className="group-hover:opacity-70 transition-opacity">
          <span className="text-sm font-medium text-foreground break-words line-clamp-2">
            {issue.title}
          </span>
        </div>

        {showProject && issue.project && (
          <div onClick={handleInteractiveClick} className="inline-block">
            <Link
              href={`/project/${issue.project._id}`}
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
        <IssuePriorityField
          value={issue.priority}
          issueId={issue._id}
          align="end"
        />

        <IssueLabelField issueId={issue._id} value={issue.label} align="end" />

        <AssigneeSelector
          assignee={(issue.assignedTo as string) || ""}
          onChange={async (userId) => {
            try {
              await changeLeader({
                issueId: issue._id,
                token,
                userId: userId as any,
              });
            } catch (error) {
              toast.error("Failed to change issue assignee");
            }
          }}
        />
      </div>

      {/* Footer with Due Date */}
      <div
        className="flex items-center justify-between"
        onClick={handleInteractiveClick}
      >
        <div className="flex items-center gap-1.5">
          {/* Future: Add dependencies count or other metadata */}
        </div>

        <IssueDueDateField
          value={issue.dueDate ? new Date(issue.dueDate) : null}
          issueId={issue._id}
          align="end"
        />
      </div>
    </div>
  );
}
