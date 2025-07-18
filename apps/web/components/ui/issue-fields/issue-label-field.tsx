"use client";

import { IssueFieldBase } from "./issue-field-base";
import { labels } from "@/utils/constants/issues/labels";
import { IssueLabelBadge } from "@/components/project/issues/issue-badge";
import * as issueActions from "@/actions/issue";

interface IssueLabelFieldProps {
  issueId: string;
  value: string;
  className?: string;
  disabled?: boolean;
  align?: "start" | "center" | "end";
  onChange?: (label: string) => Promise<void>;
}

export function IssueLabelField({
  issueId,
  value,
  disabled,
  align,
  onChange,
}: IssueLabelFieldProps) {
  const handleLabelChange = async (newValue: string) => {
    if (onChange) {
      await onChange(newValue);
    } else {
      // Fallback to direct API call if no onChange provided
      await issueActions.updateIssue(issueId, { label: newValue });
    }
  };

  return (
    <IssueFieldBase
      value={value}
      onSave={handleLabelChange}
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
