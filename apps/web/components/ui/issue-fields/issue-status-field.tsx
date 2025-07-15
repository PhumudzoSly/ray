"use client";

import { IssueFieldBase } from "./issue-field-base";
import { status } from "@/utils/constants/issues/status";
import { IssueStatusBadge } from "@/components/project/issues/issue-badge";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { Id } from "@workspace/backend";
import { useData } from "@/hooks/use-data";

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

  // Fetch dependency validation to check if issue can be marked as DONE
  const { data: validationResult } = useData(
    api.issue.dependency.validateIssueCompletion,
    { token, issueId: issueId as Id<"issues"> }
  );

  // Filter out "DONE" option when issue is blocked by dependencies
  const isBlockedByDependencies =
    validationResult && !validationResult.canComplete;
  const availableOptions = isBlockedByDependencies
    ? status.filter((s) => s.id !== "DONE")
    : status;

  return (
    <IssueFieldBase
      value={value}
      onSave={async (newValue: string) => {
        try {
          await changeIssueStatus({
            issueId: issueId as Id<"issues">,
            token,
            status: newValue as any,
          });
        } catch (error: any) {
          if (error.message?.includes("Cannot mark issue as DONE")) {
            throw new Error(error.message);
          } else {
            throw new Error("Failed to update status");
          }
        }
      }}
      options={availableOptions.map((s) => ({
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
