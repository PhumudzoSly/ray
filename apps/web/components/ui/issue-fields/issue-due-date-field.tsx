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
import { useMutation } from "convex/react";

import { useSession } from "@/context/session-context";
import { toast } from "sonner";
import { api } from "@workspace/backend";

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
  const { token } = useSession();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const changeDueDate = useMutation(api.issue.quickAction.changeIssueDueDate);

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

      try {
        await changeDueDate({
          dueDate: newValue?.toISOString() || "",
          issueId: issueId as any,
          token,
        });
        toast.success("Due date updated");
      } catch (error) {
        toast.error("Failed to change due date");
        setOpen(true);
      } finally {
        setIsLoading(false);
      }
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
          {value ? format(value, "MMM d yyyy") : "Set due date"}
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
