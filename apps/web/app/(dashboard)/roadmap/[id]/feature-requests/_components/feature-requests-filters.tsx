"use client";
import { useEffect, useState, useRef } from "react";
import {
  Search,
  X,
  Filter,
  Tag,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Clock,
  CalendarRange,
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
import { featureRequestStatuses } from "@/utils/constants/feature-requests/status";
import { featureRequestPriorities } from "@/utils/constants/feature-requests/priority";
import { featureRequestCategories } from "@/utils/constants/feature-requests/categories";

// Filter category definitions
const filterCategories = [
  {
    id: "status",
    name: "Status",
    description: "Filter requests by their current status",
    icon: Clock,
    colorClass: "text-blue-500",
  },
  {
    id: "category",
    name: "Category",
    description: "Filter by request category",
    icon: Tag,
    colorClass: "text-purple-500",
  },
  {
    id: "priority",
    name: "Priority",
    description: "Filter by request priority level",
    icon: CalendarRange,
    colorClass: "text-orange-500",
  },
];

// Create status config from constants
const statusConfig = featureRequestStatuses.reduce(
  (acc, status) => {
    acc[status.id] = { label: status.name, colorClass: status.colorClass };
    return acc;
  },
  {} as Record<string, { label: string; colorClass: string }>
);

// Create priority config from constants
const priorityConfig = featureRequestPriorities.reduce(
  (acc, priority) => {
    acc[priority.id] = {
      label: priority.name,
      colorClass: priority.colorClass,
    };
    return acc;
  },
  {} as Record<string, { label: string; colorClass: string }>
);

// Create category config from constants
const categoryConfig = featureRequestCategories.reduce(
  (acc, category) => {
    acc[category.id] = {
      label: category.name,
      colorClass: category.colorClass,
    };
    return acc;
  },
  {} as Record<string, { label: string; colorClass: string }>
);

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

interface FeatureRequestsFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    status: string;
    priority: string;
    category: string;
  }) => void;
}

export function FeatureRequestsFilters({
  onFiltersChange,
}: FeatureRequestsFiltersProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Internal filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  // Add effect to focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange({
      search: searchQuery,
      status: filterStatus,
      priority: filterPriority,
      category: filterCategory,
    });
  }, [
    searchQuery,
    filterStatus,
    filterPriority,
    filterCategory,
    onFiltersChange,
  ]);

  // Simulate search loading state
  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const handleFilterChange = (category: string, value: string) => {
    switch (category) {
      case "status":
        setFilterStatus(value === "All" ? "" : value);
        break;
      case "category":
        setFilterCategory(value === "All" ? "" : value);
        break;
      case "priority":
        setFilterPriority(value === "All" ? "" : value);
        break;
    }

    // Close the popover after selection
    setOpen(false);
  };

  const handleResetFilters = () => {
    setFilterStatus("");
    setFilterCategory("");
    setFilterPriority("");
    setSearchQuery("");
    setSelectedCategory(null);
    setIsSearchOpen(false);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
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
            {featureRequestStatuses.map((status) => (
              <FilterCommandItem
                key={status.id}
                icon={status.icon}
                name={status.name}
                colorClass={status.colorClass}
                isSelected={filterStatus === status.id}
                onSelect={() => {
                  handleFilterChange("status", status.id);
                  setSelectedCategory(null);
                }}
              />
            ))}
          </FilterGroup>
        );

      case "category":
        return (
          <FilterGroup
            heading="Category"
            onBack={() => setSelectedCategory(null)}
          >
            <FilterCommandItem
              icon={Tag}
              name="All Categories"
              onSelect={() => {
                handleFilterChange("category", "All");
                setSelectedCategory(null);
              }}
            />
            {featureRequestCategories.map((category) => (
              <FilterCommandItem
                key={category.id}
                icon={category.icon}
                name={category.name}
                colorClass={category.colorClass}
                isSelected={filterCategory === category.id}
                onSelect={() => {
                  handleFilterChange("category", category.id);
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
            {featureRequestPriorities.map((priority) => (
              <FilterCommandItem
                key={priority.id}
                icon={priority.icon}
                name={priority.name}
                colorClass={priority.colorClass}
                isSelected={filterPriority === priority.id}
                onSelect={() => {
                  handleFilterChange("priority", priority.id);
                  setSelectedCategory(null);
                }}
              />
            ))}
          </FilterGroup>
        );
    }
  };

  const getActiveFilters = () => {
    const filters = [];

    if (filterStatus) {
      const statusOption =
        statusConfig[filterStatus as keyof typeof statusConfig];
      filters.push({
        name: "Status",
        value: statusOption?.label || filterStatus,
        icon: Clock,
        colorClass: statusOption?.colorClass || "text-blue-500",
      });
    }

    if (filterCategory) {
      const categoryOption = categoryConfig[filterCategory];
      filters.push({
        name: "Category",
        value: categoryOption?.label || filterCategory,
        icon: Tag,
        colorClass: categoryOption?.colorClass || "text-purple-500",
      });
    }

    if (filterPriority) {
      const priorityOption =
        priorityConfig[filterPriority as keyof typeof priorityConfig];
      filters.push({
        name: "Priority",
        value: priorityOption?.label || filterPriority,
        icon: CalendarRange,
        colorClass: priorityOption?.colorClass || "text-orange-500",
      });
    }

    return filters;
  };

  const hasFilters = filterStatus || filterCategory || filterPriority;

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
                placeholder="Search requests..."
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
          onClick={handleResetFilters}
          className="h-9 px-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="mr-2 h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  );
}
