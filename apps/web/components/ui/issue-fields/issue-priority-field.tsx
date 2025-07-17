"use client";

import { IssueFieldBase } from "./issue-field-base";
import { priorities } from "@/utils/constants/issues/priority";
import { IssuePriorityBadge } from "@/components/project/issues/issue-badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as issueActions from "@/actions/issue";
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
  const queryClient = useQueryClient();
  // TanStack mutation for updating priority
  const updatePriorityMutation = useMutation({
    mutationFn: async ({ issueId, priority }: { issueId: string; priority: string }) => {
      return await issueActions.updateIssue(issueId, { priority });
    },
    onMutate: async ({ issueId, priority }) => {
      await queryClient.cancelQueries({ queryKey: ["issues"] });
      const previousIssues = queryClient.getQueryData<any[]>(["issues"]);
      queryClient.setQueryData<any[]>(["issues"], (old) => {
        if (!old) return old;
        return old.map((i) =>
          i.id === issueId ? { ...i, priority } : i
        );
      });
      return { previousIssues };
    },
    onError: (err, variables, context) => {
      if (context?.previousIssues) {
        queryClient.setQueryData(["issues"], context.previousIssues);
      }
      toast.error("Failed to update priority");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });

  return (
    <IssueFieldBase
      value={value}
      onSave={async (newValue: string) => {
        await updatePriorityMutation.mutateAsync({
          issueId,
          priority: newValue,
        });
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
