"use client";

import { IssueFieldBase } from "./issue-field-base";
import { status } from "@/utils/constants/issues/status";
import { IssueStatusBadge } from "@/components/project/issues/issue-badge";
import { useQuery } from "@tanstack/react-query";
import * as issueActions from "@/actions/issue";

interface IssueStatusFieldProps {
  issueId: string;
  value: string;
  className?: string;
  disabled?: boolean;
  align?: "start" | "center" | "end";
  onChange?: (status: string) => Promise<void>;
}

export function IssueStatusField({
  issueId,
  value,
  disabled,
  align,
  onChange,
}: IssueStatusFieldProps) {
  // Fetch dependency validation to check if issue can be marked as DONE
  const { data: validationResult } = useQuery({
    queryKey: ["issue-completion-validation", issueId],
    queryFn: async () => {
      const response = await issueActions.validateIssueCompletion({ issueId });
      return response;
    },
  });

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
        if (onChange) {
          await onChange(newValue);
        } else {
          // Fallback to direct API call if no onChange provided
          try {
            await issueActions.updateIssue(issueId, { status: newValue });
          } catch (error: any) {
            if (error.message?.includes("Cannot mark issue as DONE")) {
              throw new Error(error.message);
            } else {
              throw new Error("Failed to update status");
            }
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
