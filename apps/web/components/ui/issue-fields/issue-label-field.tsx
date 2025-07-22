"use client";

import { IssueFieldBase } from "./issue-field-base";
import { labels } from "@/utils/constants/issues/labels";
import { IssueLabelBadge } from "@/components/project/issues/issue-badge";
import * as issueActions from "@/actions/issue";
import { IssueLabel } from "@workspace/backend/prisma/generated/client/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface IssueLabelFieldProps {
  issueId: string;
  value: IssueLabel;
  className?: string;
  disabled?: boolean;
  align?: "start" | "center" | "end";
  onChange?: (label: IssueLabel) => Promise<void>;
}

export function IssueLabelField({
  issueId,
  value,
  disabled,
  align,
  onChange,
}: IssueLabelFieldProps) {
  const queryClient = useQueryClient();

  const handleLabelChange = async (newValue: string | IssueLabel) => {
    // Convert string to IssueLabel if needed
    const labelValue =
      typeof newValue === "string" ? (newValue as IssueLabel) : newValue;

    if (onChange) {
      await onChange(labelValue);
    } else {
      // Fallback to direct API call if no onChange provided
      try {
        const result = await issueActions.updateIssueLabel(issueId, labelValue);

        if (result.success) {
          // Comprehensive invalidation for real-time updates
          queryClient.invalidateQueries({ queryKey: ["issues"] });
          queryClient.invalidateQueries({ queryKey: ["issues-grouped"] });
          queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
          queryClient.invalidateQueries({
            queryKey: ["issueActivities", issueId],
          });
          queryClient.invalidateQueries({
            queryKey: ["issueDependencies", issueId],
          });
          queryClient.invalidateQueries({
            queryKey: ["issueHierarchy", issueId],
          });

          // Invalidate project-specific queries if we have project context
          // This will be handled by the parent components that have project context
          queryClient.invalidateQueries({
            queryKey: ["activity-feed", "ISSUE", issueId],
          });

          toast.success("Label updated successfully");
        } else {
          toast.error("Failed to update label");
        }
      } catch (error) {
        console.error("Error updating label:", error);
        toast.error("Failed to update label");
        throw error; // Re-throw to let the base component handle the error state
      }
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
