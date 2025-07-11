"use client";

import { IssueFieldBase } from "./issue-field-base";
import { labels } from "@/utils/constants/issues/labels";
import { IssueLabelBadge } from "@/components/project/issues/issue-badge";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { Id } from "@workspace/backend";

interface IssueLabelFieldProps {
  issueId: string;
  value: string;
  className?: string;
  disabled?: boolean;
  align?: "start" | "center" | "end";
}

export function IssueLabelField({
  issueId,
  value,
  disabled,
  align,
}: IssueLabelFieldProps) {
  const { token } = useSession();
  const changeIssueLabel = useMutation(api.issue.quickAction.changeIssueLabel);

  return (
    <IssueFieldBase
      value={value}
      onSave={async (newValue: string) => {
        await changeIssueLabel({
          issueId: issueId as Id<"issues">,
          token,
          label: newValue as any,
        });
      }}
      options={labels.map((l) => ({
        id: l.id,
        name: l.name,
        icon: l.icon,
        colorClass: l.colorClass,
      }))}
      displayValue={<IssueLabelBadge label={value} />}
      placeholder="Set label"
      searchPlaceholder="Search label..."
      emptyText="No label found."
      disabled={disabled}
      errorMessage="Failed to update label"
      align={align}
      className="w-fit"
    />
  );
}
