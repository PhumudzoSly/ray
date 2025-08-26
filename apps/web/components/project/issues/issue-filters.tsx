"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Search,
  X,
  Filter,
  CalendarRange,
  User,
  Clock,
  Tag,
  ChevronRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@workspace/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@/lib/utils";
import { Input } from "@workspace/ui/components/input";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@workspace/ui/components/hover-card";
import { useDebounce } from "@/hooks/use-debounce";
import { Calendar } from "@workspace/ui/components/calendar";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { labels, LabelIcon } from "@/utils/constants/projects/labels";
// import { issueLabel } from "@workspace/backend";

// Filter category definitions
const filterCategories = [
  {
    id: "status",
    name: "Status",
    description: "Filter issues by their current status",
    icon: Clock,
    colorClass: "text-blue-500",
  },
  {
    id: "priority",
    name: "Priority",
    description: "Filter by issue priority level",
    icon: CalendarRange,
    colorClass: "text-orange-500",
  },
  {
    id: "label",
    name: "Label",
    description: "Filter by issue label",
    icon: Tag,
    colorClass: "text-purple-500",
  },
  {
    id: "dueDate",
    name: "Due Date",
    description: "Filter by issue deadline",
    icon: CalendarRange,
    colorClass: "text-green-500",
  },
  {
    id: "assignee",
    name: "Assigned To",
    description: "Filter by assigned team member",
    icon: User,
    colorClass: "text-cyan-500",
  },
];

const dateRanges = [
  { id: "overdue", name: "Overdue" },
  { id: "thisWeek", name: "Due This Week" },
  { id: "nextWeek", name: "Due Next Week" },
  { id: "thisMonth", name: "Due This Month" },
  { id: "noDate", name: "No Due Date" },
  { id: "custom", name: "Custom Range" },
];

// Status configuration with colors and labels
const statusConfig = {
  BACKLOG: { label: "Backlog", colorClass: "text-pink-500" },
  IN_PROGRESS: { label: "In Progress", colorClass: "text-yellow-400" },
  REVIEW: { label: "Review", colorClass: "text-blue-500" },
  DONE: { label: "Done", colorClass: "text-green-500" },
  BLOCKED: { label: "Blocked", colorClass: "text-red-500" },
  CANCELLED: { label: "Cancelled", colorClass: "text-gray-500" },
};

// Priority configuration
const priorityConfig = {
  LOW: { label: "Low", colorClass: "text-green-500" },
  MEDIUM: { label: "Medium", colorClass: "text-blue-500" },
  HIGH: { label: "High", colorClass: "text-orange-500" },
  CRITICAL: { label: "Critical", colorClass: "text-red-500" },
};

// Reusable components
interface FilterCommandItemProps {
  icon: React.ComponentType<any>;
  name: string;
  description?: string;
  colorClass?: string;
  isSelected?: boolean;
  onSelect: () => void;
  showChevron?: boolean;
  children?: React.ReactNode;
}

function FilterCommandItem({
  icon: Icon,
  name,
  description,
  colorClass,
  isSelected,
  onSelect,
  showChevron = false,
  children,
}: FilterCommandItemProps) {
  return (
    <CommandItem
      onSelect={onSelect}
      className="cursor-pointer py-2 px-3 border-b transition-colors hover:bg-accent"
    >
      <div className="flex items-center w-full">
        <div className="flex items-center gap-3 flex-1">
          <Icon className={cn("h-4 w-4", colorClass)} />
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-sm">{name}</span>
            {description && (
              <span className="text-xs text-muted-foreground">
                {description}
              </span>
            )}
          </div>
          {children}
        </div>
        {showChevron && (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        {isSelected && (
          <span className="ml-auto flex h-4 w-4 items-center justify-center text-primary">
            ✓
          </span>
        )}
      </div>
    </CommandItem>
  );
}

interface FilterGroupProps {
  heading: string;
  children: React.ReactNode;
  onBack?: () => void;
}

function FilterGroup({ heading, children, onBack }: FilterGroupProps) {
  return (
    <CommandGroup heading={heading}>
      {onBack && (
        <CommandItem
          onSelect={onBack}
          className="cursor-pointer bg-secondary py-2 px-4 text-sm"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Categories</span>
          </div>
        </CommandItem>
      )}
      <CommandSeparator />
      {children}
    </CommandGroup>
  );
}

interface FilterBadgeProps {
  name: string;
  value: string;
  icon: React.ComponentType<any>;
  colorClass: string;
}

function FilterBadge({
  name,
  value,
  icon: Icon,
  colorClass,
}: FilterBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-1.5 rounded-md transition-colors",
        "bg-muted/50 hover:bg-muted/80"
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", colorClass)} />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-muted-foreground">
          {name}
        </span>
        <span className="text-sm">{value}</span>
      </div>
    </div>
  );
}

export function IssuesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [priority, setPriority] = useState(searchParams.get("priority") || "");
  const [label, setLabel] = useState(searchParams.get("label") || "");
  const [dueDate, setDueDate] = useState(searchParams.get("dueDate") || "");
  const [assignee, setAssignee] = useState(searchParams.get("assignee") || "");
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(
    {
      from: new Date(),
      to: undefined,
    }
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Add effect to focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Simulate search loading state
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      setIsSearching(true);
    } else {
      const timer = setTimeout(() => setIsSearching(false), 300);
      return () => clearTimeout(timer);
    }
  }, [debouncedSearchQuery, searchQuery]);

  const handleFilterChange = (category: string, value: string) => {
    // Create a new URLSearchParams instance from the current URL
    const params = new URLSearchParams(window.location.search);

    // Update the parameter
    if (value && value !== "All") {
      params.set(category, value);
    } else {
      params.delete(category);
    }

    // Reset to first page when filtering
    params.set("page", "1");

    // Update the URL with the new params
    router.push(`?${params.toString()}`, { scroll: false });

    // Update local state
    switch (category) {
      case "status":
        setStatus(value === "All" ? "" : value);
        break;
      case "priority":
        setPriority(value === "All" ? "" : value);
        break;
      case "label":
        setLabel(value === "All" ? "" : value);
        break;
      case "dueDate":
        setDueDate(value === "All" ? "" : value);
        break;
      case "assignee":
        setAssignee(value === "All" ? "" : value);
        break;
    }

    // Close the popover after selection
    setOpen(false);
  };

  const handleResetFilters = () => {
    // Reset local state
    setStatus("");
    setPriority("");
    setLabel("");
    setDueDate("");
    setAssignee("");
    setSelectedCategory(null);

    // Get current URL path without query parameters
    const currentPath = window.location.pathname;

    // Push to the same path but without query parameters
    router.push(currentPath as any, { scroll: false });
  };

  // Enhanced search handler
  const handleSearch = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    setSearchQuery(value);

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const renderFilterContent = () => {
    if (!selectedCategory) {
      return (
        <CommandGroup>
          {filterCategories.map((category) => (
            <FilterCommandItem
              key={category.id}
              icon={category.icon}
              name={category.name}
              description={category.description}
              colorClass={category.colorClass}
              onSelect={() => setSelectedCategory(category.id)}
              showChevron
            />
          ))}
        </CommandGroup>
      );
    }

    switch (selectedCategory) {
      case "status":
        return (
          <FilterGroup
            heading="Status"
            onBack={() => setSelectedCategory(null)}
          >
            <FilterCommandItem
              icon={Clock}
              name="All Statuses"
              onSelect={() => {
                handleFilterChange("status", "All");
                setSelectedCategory(null);
              }}
            />
            {Object.entries(statusConfig).map(([key, config]) => (
              <FilterCommandItem
                key={key}
                icon={Clock}
                name={config.label}
                colorClass={config.colorClass}
                isSelected={status === key}
                onSelect={() => {
                  handleFilterChange("status", key);
                  setSelectedCategory(null);
                }}
              />
            ))}
          </FilterGroup>
        );

      case "priority":
        return (
          <FilterGroup
            heading="Priority"
            onBack={() => setSelectedCategory(null)}
          >
            <FilterCommandItem
              icon={CalendarRange}
              name="All Priorities"
              onSelect={() => {
                handleFilterChange("priority", "All");
                setSelectedCategory(null);
              }}
            />
            {Object.entries(priorityConfig).map(([key, config]) => (
              <FilterCommandItem
                key={key}
                icon={CalendarRange}
                name={config.label}
                colorClass={config.colorClass}
                isSelected={priority === key}
                onSelect={() => {
                  handleFilterChange("priority", key);
                  setSelectedCategory(null);
                }}
              />
            ))}
          </FilterGroup>
        );

      case "label":
        return (
          <FilterGroup heading="Label" onBack={() => setSelectedCategory(null)}>
            <FilterCommandItem
              icon={Tag}
              name="All Labels"
              onSelect={() => {
                handleFilterChange("label", "All");
                setSelectedCategory(null);
              }}
            />
            {labels.map((labelData) => {
              const Icon = labelData.icon;

              return (
                <FilterCommandItem
                  key={labelData.id}
                  icon={Icon}
                  name={labelData.name}
                  colorClass={labelData.colorClass}
                  isSelected={label === labelData.id}
                  onSelect={() => {
                    handleFilterChange("label", labelData.id);
                    setSelectedCategory(null);
                  }}
                />
              );
            })}
          </FilterGroup>
        );

      case "dueDate":
        return (
          <FilterGroup
            heading="Due Date"
            onBack={() => setSelectedCategory(null)}
          >
            <FilterCommandItem
              icon={CalendarRange}
              name="All Due Dates"
              onSelect={() => {
                handleFilterChange("dueDate", "All");
                setSelectedCategory(null);
              }}
            />
            {dateRanges.map((range) => (
              <FilterCommandItem
                key={range.id}
                icon={CalendarRange}
                name={range.name}
                isSelected={dueDate === range.id}
                onSelect={() => {
                  if (range.id === "custom") {
                    // Handle custom date range selection
                    return;
                  }
                  handleFilterChange("dueDate", range.id);
                  setSelectedCategory(null);
                }}
              />
            ))}
            {dateRanges.find((r) => r.id === "custom")?.id === "custom" && (
              <div className="p-4">
                <Calendar
                  mode="range"
                  selected={customDateRange}
                  onSelect={(range) => {
                    setCustomDateRange(
                      range || { from: new Date(), to: undefined }
                    );
                    if (range?.from && range?.to) {
                      handleFilterChange(
                        "dueDate",
                        `${format(range.from, "yyyy-MM-dd")}..${format(
                          range.to,
                          "yyyy-MM-dd"
                        )}`
                      );
                      setSelectedCategory(null);
                    }
                  }}
                />
              </div>
            )}
          </FilterGroup>
        );

      case "assignee":
        return (
          <FilterGroup
            heading="Assigned To"
            onBack={() => setSelectedCategory(null)}
          >
            <FilterCommandItem
              icon={User}
              name="All Assignees"
              onSelect={() => {
                handleFilterChange("assignee", "All");
                setSelectedCategory(null);
              }}
            />
            <FilterCommandItem
              icon={User}
              name="Unassigned"
              onSelect={() => {
                handleFilterChange("assignee", "unassigned");
                setSelectedCategory(null);
              }}
            />
          </FilterGroup>
        );
    }
  };

  const getActiveFilters = () => {
    const filters = [];

    if (status) {
      const statusOption = statusConfig[status as keyof typeof statusConfig];
      filters.push({
        name: "Status",
        value: statusOption?.label || status,
        icon: Clock,
        colorClass: statusOption?.colorClass || "text-blue-500",
      });
    }

    if (priority) {
      const priorityOption =
        priorityConfig[priority as keyof typeof priorityConfig];
      filters.push({
        name: "Priority",
        value: priorityOption?.label || priority,
        icon: CalendarRange,
        colorClass: priorityOption?.colorClass || "text-orange-500",
      });
    }

    if (label) {
      const labelOption = labels.find((l) => l.id === label);
      filters.push({
        name: "Label",
        value: labelOption?.name || label,
        icon: labelOption?.icon || Tag,
        colorClass: labelOption?.colorClass || "text-purple-500",
      });
    }

    if (dueDate) {
      filters.push({
        name: "Due Date",
        value: dueDate.includes("..")
          ? "Custom Range"
          : dateRanges.find((d) => d.id === dueDate)?.name || dueDate,
        icon: CalendarRange,
        colorClass: "text-green-500",
      });
    }

    if (assignee) {
      filters.push({
        name: "Assigned To",
        value: assignee === "unassigned" ? "Unassigned" : assignee,
        icon: User,
        colorClass: "text-cyan-500",
      });
    }

    return filters;
  };

  const hasFilters = status || priority || label || dueDate || assignee;

  return (
    <div className="flex items-center flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center gap-2 transition-all duration-300 ease-in-out",
            isSearchOpen ? "w-[180px] md:w-[300px]" : "w-9"
          )}
        >
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 w-9 p-0 transition-colors",
              isSearchOpen && searchQuery && "border-primary text-primary"
            )}
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (!isSearchOpen) {
                setTimeout(() => {
                  searchInputRef.current?.focus();
                }, 100);
              }
            }}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>

          {isSearchOpen && (
            <div className="relative flex-1">
              <Input
                ref={searchInputRef}
                placeholder="Search issues..."
                className={cn(
                  "h-9 pr-8 transition-all duration-300",
                  searchQuery && "border-primary"
                )}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsSearchOpen(false);
                    handleSearch("");
                  }
                }}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                  onClick={() => {
                    handleSearch("");
                    searchInputRef.current?.focus();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        <HoverCard openDelay={200} closeDelay={150}>
          <HoverCardTrigger asChild>
            <div>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 border-dashed gap-2 transition-colors",
                      hasFilters && "border-primary bg-primary/5 text-primary"
                    )}
                  >
                    <Filter
                      className={cn("h-4 w-4", hasFilters && "text-primary")}
                    />
                    <span className="font-medium">Filters</span>
                    {hasFilters && (
                      <Badge
                        variant="secondary"
                        className="ml-1 rounded-sm px-1 font-normal bg-primary/10 text-primary"
                      >
                        {getActiveFilters().length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-3" align="start">
                  <Command className="rounded-lg border shadow-sm">
                    <CommandInput
                      placeholder={
                        selectedCategory
                          ? `Search ${filterCategories
                              .find((c) => c.id === selectedCategory)
                              ?.name.toLowerCase()}...`
                          : "Search all filters..."
                      }
                      className="h-11"
                    />
                    <CommandList className="max-h-[300px] overflow-y-auto">
                      <CommandEmpty>No results found.</CommandEmpty>
                      {renderFilterContent()}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </HoverCardTrigger>
          {hasFilters && (
            <HoverCardContent
              align="start"
              className="w-80 p-3 shadow-lg backdrop-blur-sm bg-white/95 dark:bg-gray-950/95"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Active Filters</span>
                </div>
                <div className="grid gap-2">
                  {getActiveFilters().map((filter, index) => (
                    <FilterBadge
                      key={`${filter.name}-${index}`}
                      name={filter.name}
                      value={filter.value}
                      icon={filter.icon}
                      colorClass={filter.colorClass}
                    />
                  ))}
                </div>
              </div>
            </HoverCardContent>
          )}
        </HoverCard>
      </div>

      {(hasFilters || searchQuery) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            handleResetFilters();
            setSearchQuery("");
            setIsSearchOpen(false);
          }}
          className="h-9 px-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="mr-2 h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  );
}
