"use client";

import { IssueFieldBase } from "./issue-field-base";
import { priorities } from "@/utils/constants/issues/priority";
import { IssuePriorityBadge } from "@/components/project/issues/issue-badge";
import * as issueActions from "@/actions/issue";

interface IssuePriorityFieldProps {
  issueId: string;
  value: string;
  className?: string;
  disabled?: boolean;
  align?: "start" | "center" | "end";
  onChange?: (priority: string) => Promise<void>;
}

export function IssuePriorityField({
  issueId,
  value,
  disabled,
  align,
  onChange,
}: IssuePriorityFieldProps) {
  return (
    <IssueFieldBase
      value={value}
      onSave={async (newValue: string) => {
        if (onChange) {
          await onChange(newValue);
        } else {
          // Fallback to direct API call if no onChange provided
          await issueActions.updateIssue(issueId, { priority: newValue } as any);
        }
      }}
      options={priorities.map((p) => ({
        id: p.id,
        name: p.name,
        icon: p.icon,
        // colorClass: p.colorClass,
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
