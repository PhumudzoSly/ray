"use client";

import { IssueFieldBase } from "./issue-field-base";
import { labels } from "@/utils/constants/issues/labels";
import { IssueLabelBadge } from "@/components/project/issues/issue-badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as issueActions from "@/actions/issue";

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
  const queryClient = useQueryClient();
  // TanStack mutation for updating label
  const updateLabelMutation = useMutation({
    mutationFn: async ({ issueId, label }: { issueId: string; label: string }) => {
      return await issueActions.updateIssue(issueId, { label });
    },
    onMutate: async ({ issueId, label }) => {
      await queryClient.cancelQueries({ queryKey: ["issues"] });
      const previousIssues = queryClient.getQueryData<any[]>(["issues"]);
      queryClient.setQueryData<any[]>(["issues"], (old) => {
        if (!old) return old;
        return old.map((i) =>
          i._id === issueId ? { ...i, label } : i
        );
      });
      return { previousIssues };
    },
    onError: (err, variables, context) => {
      if (context?.previousIssues) {
        queryClient.setQueryData(["issues"], context.previousIssues);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });

  return (
    <IssueFieldBase
      value={value}
      onSave={async (newValue: string) => {
        await updateLabelMutation.mutateAsync({
          issueId,
          label: newValue,
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
