"use client";

import React, { useState } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWithinInterval,
  isSameWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@/lib/utils";

type CalendarView = "month" | "week" | "day";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  [key: string]: any; // Allow additional properties
}

interface CalendarProps<T extends CalendarEvent> {
  events: T[];
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: T) => void;
  renderEvent?: (event: T, isDragging?: boolean) => React.ReactNode;
  onEventDrop?: (eventId: string, newDate: Date) => Promise<void>;
  weekStartDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
  defaultView?: CalendarView;
  views?: CalendarView[]; // Customize which view buttons to show
}

export function Calendar<T extends CalendarEvent>({
  events = [],
  currentDate: initialDate = new Date(),
  onDateChange,
  onEventClick,
  renderEvent,
  onEventDrop,
  weekStartDay = 1, // Monday
  defaultView = "month",
  views = ["month", "week", "day"] as CalendarView[], // Default to all views
}: CalendarProps<T>) {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [view, setView] = useState<CalendarView>(defaultView);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);

  const navigateToPreviousPeriod = () => {
    let newDate = currentDate;
    if (view === "month") {
      newDate = subMonths(currentDate, 1);
    } else if (view === "week") {
      newDate = addDays(currentDate, -7);
    } else {
      newDate = addDays(currentDate, -1);
    }
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const navigateToNextPeriod = () => {
    let newDate = currentDate;
    if (view === "month") {
      newDate = addMonths(currentDate, 1);
    } else if (view === "week") {
      newDate = addDays(currentDate, 7);
    } else {
      newDate = addDays(currentDate, 1);
    }
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const navigateToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateChange?.(today);
  };

  const handleEventDrop = async (eventId: string, targetDate: Date) => {
    if (!onEventDrop) return;

    try {
      await onEventDrop(eventId, targetDate);
    } catch (error) {
      console.error("Failed to update event date:", error);
    } finally {
      setDragOverDate(null);
    }
  };

  const renderHeader = () => {
    const monthName = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();
    const weekStart = startOfWeek(currentDate, { weekStartsOn: weekStartDay });
    const weekEnd = addDays(weekStart, 6);

    // If no views are specified, default to all views
    const availableViews =
      views.length > 0 ? views : (["month", "week", "day"] as CalendarView[]);

    // Get the view button class based on position
    const getViewButtonClass = (index: number, total: number) => {
      if (total === 1) return "rounded-md";
      if (index === 0) return "rounded-r-none";
      if (index === total - 1) return "rounded-l-none";
      return "rounded-none";
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={navigateToPreviousPeriod}
            className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center min-w-[180px] sm:min-w-[200px]">
            <h2 className="text-base sm:text-lg font-semibold truncate">
              {view === "month"
                ? `${monthName} ${year}`
                : view === "week"
                  ? `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
                  : format(currentDate, "MMMM d, yyyy")}
            </h2>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={navigateToNextPeriod}
            className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={navigateToToday}
            className="ml-2 hidden sm:inline-flex whitespace-nowrap"
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={navigateToToday}
            className="sm:hidden whitespace-nowrap"
          >
            Today
          </Button>

          <div
            className="inline-flex rounded-md shadow-sm overflow-hidden"
            role="group"
          >
            {availableViews.map((viewType, index) => (
              <Button
                key={viewType}
                variant={view === viewType ? "default" : "ghost"}
                size="sm"
                onClick={() => setView(viewType)}
                className={`text-xs sm:text-sm whitespace-nowrap ${getViewButtonClass(index, availableViews.length)}`}
              >
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayHeader = () => {
    const days = [];
    const startDate =
      view === "month"
        ? startOfWeek(currentDate, { weekStartsOn: weekStartDay })
        : startOfWeek(currentDate, { weekStartsOn: weekStartDay });

    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      days.push(
        <div
          key={i}
          className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-1"
        >
          {format(day, "EEE")}
        </div>
      );
    }

    return <div className="grid grid-cols-7 gap-1 sm:gap-2">{days}</div>;
  };

  const renderDays = () => {
    switch (view) {
      case "month":
        return renderMonthView();
      case "week":
        return renderWeekView();
      case "day":
        return renderDayView();
      default:
        return renderMonthView();
    }
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: weekStartDay });
    const endDate = startOfWeek(addDays(monthEnd, 6), {
      weekStartsOn: weekStartDay,
    });

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks: Date[][] = [];

    // Split days into weeks
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1 sm:gap-2">
            {week.map((day, dayIndex) => {
              const dayEvents = events.filter((event) =>
                isSameDay(new Date(event.date), day)
              );
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "border rounded-md p-1 sm:p-2 min-h-24 sm:min-h-32 overflow-y-auto",
                    !isCurrentMonth && "opacity-50",
                    isToday && "bg-muted/30"
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverDate(day);
                  }}
                  onDragLeave={() => setDragOverDate(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const eventId = e.dataTransfer.getData("text/plain");
                    if (eventId) {
                      handleEventDrop(eventId, day);
                    }
                    setDragOverDate(null);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span className={cn("text-sm", isToday && "font-bold")}>
                      {format(day, "d")}
                    </span>
                  </div>
                  <div className="mt-1 space-y-0.5 sm:space-y-1">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        draggable={!!onEventDrop}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", event.id);
                        }}
                        onClick={() => onEventClick?.(event)}
                        className={cn(
                          "w-full text-left p-1 rounded text-xs truncate cursor-pointer",
                          "bg-primary/10 hover:bg-primary/20 transition-colors"
                        )}
                      >
                        {renderEvent ? renderEvent(event, false) : event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: weekStartDay });
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayEvents = events.filter((event) =>
        isSameDay(new Date(event.date), day)
      );
      const isToday = isSameDay(day, new Date());

      days.push(
        <div
          key={i}
          className={cn(
            "border rounded-md p-2 min-h-32 overflow-y-auto",
            isToday && "bg-muted/30"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverDate(day);
          }}
          onDragLeave={() => setDragOverDate(null)}
          onDrop={(e) => {
            e.preventDefault();
            const eventId = e.dataTransfer.getData("text/plain");
            if (eventId) {
              handleEventDrop(eventId, day);
            }
            setDragOverDate(null);
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className={cn("text-sm font-medium", isToday && "font-bold")}>
              {format(day, "EEE, MMM d")}
            </span>
          </div>
          <div className="space-y-1">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                draggable={!!onEventDrop}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", event.id);
                }}
                onClick={() => onEventClick?.(event)}
                className={cn(
                  "w-full text-left p-2 rounded text-sm truncate cursor-pointer",
                  "bg-primary/10 hover:bg-primary/20 transition-colors"
                )}
              >
                {renderEvent ? renderEvent(event, false) : event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">{days}</div>;
  };

  const renderDayView = () => {
    const dayEvents = events.filter((event) =>
      isSameDay(new Date(event.date), currentDate)
    );
    const isToday = isSameDay(currentDate, new Date());

    // Generate time slots for the day (8 AM to 8 PM)
    const timeSlots = [];
    for (let hour = 8; hour <= 20; hour++) {
      const time = new Date(currentDate);
      time.setHours(hour, 0, 0, 0);

      const eventsAtThisHour = dayEvents.filter((event) => {
        const eventHour = new Date(event.date).getHours();
        return eventHour === hour;
      });

      timeSlots.push(
        <div key={hour} className="border-b border-gray-100 py-2">
          <div className="flex">
            <div className="w-16 text-right pr-2 text-sm text-muted-foreground">
              {format(time, "h a")}
            </div>
            <div className="flex-1 pl-2">
              {eventsAtThisHour.length > 0 ? (
                eventsAtThisHour.map((event) => (
                  <div
                    key={event.id}
                    draggable={!!onEventDrop}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", event.id);
                    }}
                    onClick={() => onEventClick?.(event)}
                    className={cn(
                      "w-full text-left p-2 rounded text-sm mb-1",
                      "bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
                    )}
                  >
                    {renderEvent ? renderEvent(event, false) : event.title}
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(event.date), "h:mm a")}
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-12 border-b border-gray-50"></div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="border rounded-md mt-2">
        <div className="p-4 border-b">
          <h3 className="font-medium">
            {format(currentDate, "EEEE, MMMM d, yyyy")}
            {isToday && (
              <span className="ml-2 text-sm text-primary">Today</span>
            )}
          </h3>
        </div>
        <div className="overflow-y-auto max-h-[600px]">{timeSlots}</div>
      </div>
    );
  };

  return (
    <div>
      {renderHeader()}
      {view !== "day" && renderDayHeader()}
      {renderDays()}
    </div>
  );
}
