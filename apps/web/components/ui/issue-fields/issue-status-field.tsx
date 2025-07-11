"use client";

import { IssueFieldBase } from "./issue-field-base";
import { status } from "@/utils/constants/issues/status";
import { IssueStatusBadge } from "@/components/project/issues/issue-badge";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { Id } from "@workspace/backend";

interface IssueStatusFieldProps {
  issueId: string;
  value: string;
  className?: string;
  disabled?: boolean;
  align?: "start" | "center" | "end";
}

export function IssueStatusField({
  issueId,
  value,
  disabled,
  align,
}: IssueStatusFieldProps) {
  const { token } = useSession();
  const changeIssueStatus = useMutation(
    api.issue.quickAction.changeIssueStatus
  );

  return (
    <IssueFieldBase
      value={value}
      onSave={async (newValue: string) => {
        await changeIssueStatus({
          issueId: issueId as Id<"issues">,
          token,
          status: newValue as any,
        });
      }}
      options={status.map((s) => ({
        id: s.id,
        name: s.name,
        icon: s.icon,
        colorClass: s.colorClass,
      }))}
      displayValue={<IssueStatusBadge status={value} />}
      placeholder="Set status"
      searchPlaceholder="Search status..."
      emptyText="No status found."
      disabled={disabled}
      errorMessage="Failed to update status"
      align={align}
      className="w-fit"
    />
  );
}
