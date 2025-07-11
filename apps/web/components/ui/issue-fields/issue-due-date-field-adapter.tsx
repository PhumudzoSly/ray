"use client";

import React from "react";
import { toast } from "sonner";
import { IssueDueDateField as BaseDueDateField } from "./issue-due-date-field";
import { useMutation } from "convex/react";

import { useSession } from "@/context/session-context";
import { Id } from "@workspace/backend";
import { api } from "@workspace/backend";

interface IssueDueDateFieldProps {
  issueId: string;
  value: string | null; // String format from the database
}

export function IssueDueDateField({ issueId, value }: IssueDueDateFieldProps) {
  const { token } = useSession();
  const changeIssueDueDate = useMutation(
    api.issue.quickAction.changeIssueDueDate
  );

  const dateValue = value ? new Date(value) : null;

  const handleSave = async (newDate: Date | null): Promise<void> => {
    toast.promise(
      changeIssueDueDate({
        dueDate: newDate ? newDate.toISOString() : "",
        issueId: issueId as Id<"issues">,
        token,
      }),
      {
        success: "Due date changed",
        error: "Failed to update due date",
      }
    );
  };

  return <BaseDueDateField value={dateValue} issueId={issueId} />;
}
