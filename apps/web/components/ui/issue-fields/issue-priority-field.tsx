"use client";

import { IssueFieldBase } from "./issue-field-base";
import { priorities } from "@/utils/constants/issues/priority";
import { IssuePriorityBadge } from "@/components/project/issues/issue-badge";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { Id } from "@workspace/backend";
import { toast } from "sonner";

interface IssuePriorityFieldProps {
  issueId: string;
  value: string;
  className?: string;
  disabled?: boolean;
  align?: "start" | "center" | "end";
}

export function IssuePriorityField({
  issueId,
  value,
  disabled,
  align,
}: IssuePriorityFieldProps) {
  const { token } = useSession();
  const changeIssuePriority = useMutation(
    api.issue.quickAction.changeIssuePriority
  );

  return (
    <IssueFieldBase
      value={value}
      onSave={async (newValue: string) => {
        try {
          await changeIssuePriority({
            issueId: issueId as Id<"issues">,
            token,
            priority: newValue as any,
          });
        } catch (error) {
          toast.error("Failed to update priority");
        }
      }}
      options={priorities.map((p) => ({
        id: p.id,
        name: p.name,
        icon: p.icon,
        colorClass: p.colorClass,
      }))}
      displayValue={<IssuePriorityBadge priority={value} />}
      placeholder="Set priority"
      searchPlaceholder="Search priority..."
      emptyText="No priority found."
      disabled={disabled}
      errorMessage="Failed to update priority"
      align={align}
      className="w-fit"
    />
  );
}
