"use client";

import { useId, useState } from "react";
import { Calendar, CheckIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@workspace/ui/components/button";
import { Calendar as CalendarComponent } from "@workspace/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { cn } from "@/lib/utils";

interface DateSelectorProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showIcon?: boolean;
  format?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  allowClear?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
}

export function DateSelector({
  value,
  onChange,
  variant = "secondary",
  placeholder = "Select date",
  disabled = false,
  className,
  showIcon = true,
  format: dateFormat = "MMM d, yyyy",
  align = "start",
  side = "bottom",
  sideOffset = 8,
  allowClear = false,
  disabledDates,
}: DateSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);

  const handleDateChange = (date: Date | undefined) => {
    onChange(date || null);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const displayValue = value ? format(value, dateFormat) : placeholder;

  return (
    <div className="*:not-first:mt-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            className={cn(
              "flex items-center justify-center",
              !value && "text-muted-foreground",
              className
            )}
            size={"xs"}
            variant={variant}
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
          >
            {showIcon && <Calendar className="mr-2 size-4" />}
            <span className="flex-1 text-left">{displayValue}</span>
            {allowClear && value && (
              <button
                onClick={handleClear}
                className="ml-2 rounded-full p-0.5 hover:bg-muted"
                aria-label="Clear date"
              >
                <svg
                  className="size-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align={align}
          side={side}
          sideOffset={sideOffset}
        >
          <div className="bg-card">
            <h1 className="text-center py-1 text-sm">
              {placeholder || "Select date"}
            </h1>
            <CalendarComponent
              mode="single"
              selected={value || undefined}
              onSelect={handleDateChange}
              disabled={disabledDates}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
