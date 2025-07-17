"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Calendar as CalendarComponent } from "@workspace/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as issueActions from "@/actions/issue";

import { useSession } from "@/context/session-context";
import { toast } from "sonner";

interface IssueDueDateFieldProps {
  value: Date | null;
  disabled?: boolean;
  align?: "start" | "center" | "end";
  issueId: string;
}

export function IssueDueDateField({
  value,
  disabled,
  align = "start",
  issueId,
}: IssueDueDateFieldProps) {
  const queryClient = useQueryClient();
  // TanStack mutation for updating due date
  const updateDueDateMutation = useMutation({
    mutationFn: async ({ issueId, dueDate }: { issueId: string; dueDate: string | null }) => {
      return await issueActions.updateIssue(issueId, { dueDate });
    },
    onMutate: async ({ issueId, dueDate }) => {
      await queryClient.cancelQueries({ queryKey: ["issues"] });
      const previousIssues = queryClient.getQueryData<any[]>(["issues"]);
      queryClient.setQueryData<any[]>(["issues"], (old) => {
        if (!old) return old;
        return old.map((i) =>
          i.id === issueId ? { ...i, dueDate } : i
        );
      });
      return { previousIssues };
    },
    onError: (err, variables, context) => {
      if (context?.previousIssues) {
        queryClient.setQueryData(["issues"], context.previousIssues);
      }
      toast.error("Failed to change due date");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSelect = React.useCallback(
    async (date: Date | undefined) => {
      const newValue = date || null;

      if (
        (value === null && newValue === null) ||
        (value && newValue && value.getTime() === newValue.getTime())
      ) {
        setOpen(false);
        return;
      }

      setIsLoading(true);
      setOpen(false);

      updateDueDateMutation.mutate({
        issueId,
        dueDate: newValue ? newValue.toISOString() : null,
      }, {
        onSuccess: () => {
          toast.success("Due date updated");
        },
        onError: () => {
          setOpen(true);
        },
        onSettled: () => {
          setIsLoading(false);
        },
      });
    },
    [value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={
            value && new Date(value) < new Date() ? "destructive" : "outline"
          }
          role="combobox"
          aria-expanded={open}
          size="sm"
          className={cn(
            "justify-start text-sm hover:bg-transparent px-0 font-normal",
            "opacity-100 hover:opacity-70 transition-opacity",
            isLoading && "opacity-50 cursor-progress",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={isLoading || disabled}
        >
          <Calendar className="h-4 w-4 text-sm opacity-50 mr-2" />
          {value ? format(value, "MMM d, yy") : "Set due date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align={align}
        side="bottom"
        sideOffset={8}
      >
        <CalendarComponent
          mode="single"
          selected={value || undefined}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
