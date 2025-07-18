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
import * as issueActions from "@/actions/issue";

interface IssueDueDateFieldProps {
  value: Date | null;
  disabled?: boolean;
  align?: "start" | "center" | "end";
  issueId: string;
  onChange?: (dueDate: Date | null) => Promise<void>;
}

export function IssueDueDateField({
  value,
  disabled,
  align = "start",
  issueId,
  onChange,
}: IssueDueDateFieldProps) {
  const [open, setOpen] = React.useState(false);
  const [optimisticValue, setOptimisticValue] = React.useState<Date | null>(
    value
  );

  // Update optimistic value when prop changes
  React.useEffect(() => {
    setOptimisticValue(value);
  }, [value]);

  const handleSelect = React.useCallback(
    async (date: Date | undefined) => {
      const newValue = date || null;

      // Don't update if the value hasn't changed
      if (
        (value === null && newValue === null) ||
        (value && newValue && value.getTime() === newValue.getTime())
      ) {
        setOpen(false);
        return;
      }

      setOpen(false);

      // Update optimistic local state immediately
      setOptimisticValue(newValue);

      try {
        if (onChange) {
          await onChange(newValue);
        } else {
          // Fallback to direct API call if no onChange provided
          await issueActions.updateIssue(issueId, {
            dueDate: newValue || undefined,
          });
        }
      } catch (error) {
        // Revert optimistic local state on error
        setOptimisticValue(value);
        throw error;
      }
    },
    [value, issueId, onChange]
  );

  const displayValue = optimisticValue;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={
            displayValue && new Date(displayValue) < new Date()
              ? "destructive"
              : "outline"
          }
          role="combobox"
          aria-expanded={open}
          size="sm"
          className={cn(
            "justify-start text-sm hover:bg-transparent px-0 font-normal",
            "opacity-100 hover:opacity-70 transition-opacity",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          <Calendar className="h-4 w-4 text-sm opacity-50 mr-2" />
          {displayValue ? format(displayValue, "MMM d, yy") : "Set due date"}
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
          selected={displayValue || undefined}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
