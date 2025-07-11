"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DaySwitcherProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

const DaySwitcher: React.FC<DaySwitcherProps> = ({
  selectedDate = new Date(),
  onDateSelect,
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [weekStart, setWeekStart] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Generate 7 days starting from weekStart
  const generateWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Initialize week to show current date
  useEffect(() => {
    const today = new Date(currentDate);
    // Find the start of the week (Sunday)
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    setWeekStart(startOfWeek);
  }, [currentDate]);

  const weekDays = generateWeekDays(weekStart);

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    onDateSelect?.(date);
  };

  const handlePrevWeek = () => {
    const newWeekStart = new Date(weekStart);
    newWeekStart.setDate(weekStart.getDate() - 7);
    setWeekStart(newWeekStart);
  };

  const handleNextWeek = () => {
    const newWeekStart = new Date(weekStart);
    newWeekStart.setDate(weekStart.getDate() + 7);
    setWeekStart(newWeekStart);
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      handleDateSelect(date);
      // Update week to show the selected date
      const dayOfWeek = date.getDay();
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - dayOfWeek);
      setWeekStart(startOfWeek);
      setIsCalendarOpen(false);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === currentDate.toDateString();
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const formatDayNumber = (date: Date) => {
    return date.getDate();
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full">
      {/* Header with month/year and navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-foreground">
            {formatSelectedDate(currentDate)}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              {isToday(currentDate) ? "Today" : ""}
            </span>
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevWeek}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextWeek}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={handleCalendarSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Calendar Week View */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7">
          {weekDays.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDateSelect(day)}
              className={cn(
                "flex flex-col items-center justify-center p-4 border-r border-b transition-all duration-200 hover:bg-accent/50",
                "min-h-[80px] text-center relative",
                index === 6 && "border-r-0", // Remove right border on last column
                isSelected(day) &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                isToday(day) &&
                  !isSelected(day) &&
                  "bg-blue-50 dark:bg-blue-950/20",
                !isSelected(day) && !isToday(day) && "hover:bg-accent/30"
              )}
            >
              <span className="text-xs font-medium text-muted-foreground mb-1 uppercase">
                {formatDayName(day)}
              </span>
              <span
                className={cn(
                  "text-2xl font-semibold",
                  isSelected(day) && "text-primary-foreground",
                  isToday(day) &&
                    !isSelected(day) &&
                    "text-blue-600 dark:text-blue-400",
                  !isSelected(day) && !isToday(day) && "text-foreground"
                )}
              >
                {formatDayNumber(day)}
              </span>

              {/* Today indicator */}
              {isToday(day) && !isSelected(day) && (
                <div className="absolute bottom-2 w-1 h-1 bg-blue-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DaySwitcher;
