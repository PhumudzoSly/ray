"use client";

import { IssueFieldBase } from "./issue-field-base";
import { status } from "@/utils/constants/issues/status";
import { IssueStatusBadge } from "@/components/project/issues/issue-badge";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import * as issueActions from "@/actions/issue";

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
  const queryClient = useQueryClient();
  // TanStack mutation for updating status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ issueId, status }: { issueId: string; status: string }) => {
      return await issueActions.updateIssue(issueId, { status });
    },
    onMutate: async ({ issueId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["issues"] });
      const previousIssues = queryClient.getQueryData<any[]>(["issues"]);
      queryClient.setQueryData<any[]>(["issues"], (old) => {
        if (!old) return old;
        return old.map((i) =>
          i.id === issueId ? { ...i, status } : i
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

  // Fetch dependency validation to check if issue can be marked as DONE
  const { data: validationResult } = useQuery({
    queryKey: ["issue-completion-validation", issueId],
    queryFn: async () => {
      const response = await issueActions.validateIssueCompletion(issueId);
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
        try {
          await updateStatusMutation.mutateAsync({
            issueId,
            status: newValue,
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
