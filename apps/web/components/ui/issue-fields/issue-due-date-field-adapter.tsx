"use client";

import React from "react";
import { toast } from "sonner";
import { IssueDueDateField as BaseDueDateField } from "./issue-due-date-field";
import { useMutation } from "@tanstack/react-query";
import * as issueActions from "@/actions/issue";

import { useSession } from "@/context/session-context";

interface IssueDueDateFieldProps {
  issueId: string;
  value: string | null; // String format from the database
}

export function IssueDueDateField({ issueId, value }: IssueDueDateFieldProps) {
  const { token } = useSession();
  const changeIssueDueDateMutation = useMutation({
    mutationFn: async ({ issueId, dueDate }: { issueId: string; dueDate: string }) =>
      issueActions.changeIssueDueDate({ issueId, dueDate, token }),
  });

  const dateValue = value ? new Date(value) : null;

  const handleSave = async (newDate: Date | null): Promise<void> => {
    toast.promise(
      changeIssueDueDateMutation.mutateAsync({
        issueId,
        dueDate: newDate ? newDate.toISOString() : "",
      }),
      {
        success: "Due date changed",
        error: "Failed to update due date",
      }
    );
  };

  return <BaseDueDateField value={dateValue} issueId={issueId} />;
}
