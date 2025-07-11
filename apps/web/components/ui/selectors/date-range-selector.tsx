"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface DateRangeSelectorProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange?: (date: Date | undefined) => void;
  onEndDateChange?: (date: Date | undefined) => void;
  onRangeChange?: (
    startDate: Date | undefined,
    endDate: Date | undefined
  ) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateRangeSelector({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onRangeChange,
  placeholder = "Select date range",
  className,
  disabled = false,
}: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeInput, setActiveInput] = useState<"start" | "end">("start");

  const handleDateSelect = (date: Date | undefined) => {
    if (activeInput === "start") {
      onStartDateChange?.(date);
      onRangeChange?.(date, endDate);
      // Auto-switch to end date after selecting start
      if (date && !endDate) {
        setActiveInput("end");
      }
    } else {
      onEndDateChange?.(date);
      onRangeChange?.(startDate, date);
      // Close popover after selecting end date
      if (date) {
        setIsOpen(false);
      }
    }
  };

  const formatDateRange = () => {
    if (!startDate && !endDate) return placeholder;
    if (startDate && !endDate) return `${format(startDate, "MMM d, yyyy")} →`;
    if (!startDate && endDate) return `→ ${format(endDate, "MMM d, yyyy")}`;
    if (startDate && endDate) {
      return `${format(startDate, "MMM d")} → ${format(endDate, "MMM d, yyyy")}`;
    }
    return placeholder;
  };

  const clearDates = () => {
    onStartDateChange?.(undefined);
    onEndDateChange?.(undefined);
    onRangeChange?.(undefined, undefined);
    setActiveInput("start");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal h-9 px-3",
            !startDate && !endDate && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">{formatDateRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2 mb-3">
            <Button
              variant={activeInput === "start" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveInput("start")}
              className="h-7 px-2 text-xs"
            >
              Start Date
            </Button>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <Button
              variant={activeInput === "end" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveInput("end")}
              className="h-7 px-2 text-xs"
            >
              End Date
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            {activeInput === "start" ? "Select start date" : "Select end date"}
          </div>
        </div>
        <Calendar
          mode="single"
          selected={activeInput === "start" ? startDate : endDate}
          onSelect={handleDateSelect}
          disabled={(date) => {
            if (activeInput === "end" && startDate) {
              return date < startDate;
            }
            return false;
          }}
          initialFocus
        />
        {(startDate || endDate) && (
          <div className="p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDates}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear dates
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
