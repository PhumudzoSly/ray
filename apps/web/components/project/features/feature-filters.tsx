"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Search,
  X,
  Filter,
  Clock,
  User,
  Tag,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Settings,
  Target,
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

// Filter category definitions
const filterCategories = [
  {
    id: "priority",
    name: "Priority",
    description: "Filter by feature priority level",
    icon: Target,
    colorClass: "text-orange-500",
  },
  {
    id: "phase",
    name: "Phase",
    description: "Filter by development phase",
    icon: Settings,
    colorClass: "text-purple-500",
  },
  {
    id: "assignee",
    name: "Assigned To",
    description: "Filter by assigned team member",
    icon: User,
    colorClass: "text-cyan-500",
  },
];

// Priority configuration
const priorityConfig = {
  LOW: { label: "Low", colorClass: "text-green-500" },
  MEDIUM: { label: "Medium", colorClass: "text-blue-500" },
  HIGH: { label: "High", colorClass: "text-orange-500" },
  CRITICAL: { label: "Critical", colorClass: "text-red-500" },
};

// Phase configuration
const phaseConfig = {
  DISCOVERY: { label: "Discovery", colorClass: "text-purple-500" },
  PLANNING: { label: "Planning", colorClass: "text-blue-500" },
  DEVELOPMENT: { label: "Development", colorClass: "text-yellow-500" },
  TESTING: { label: "Testing", colorClass: "text-orange-500" },
  RELEASE: { label: "Release", colorClass: "text-green-500" },
  LIVE: { label: "Live", colorClass: "text-emerald-500" },
  DEPRECATED: { label: "Deprecated", colorClass: "text-gray-500" },
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
      className="cursor-pointer py-2 px-3 border-b hover:bg-accent"
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
        "flex items-center gap-2 p-1.5 rounded-md",
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

export interface FeatureFilters {
  search: string;
  priority: string;
  phase: string;
  assignee: string;
}

interface FeatureFiltersProps {
  filters: FeatureFilters;
  onFiltersChange: (filters: FeatureFilters) => void;
  assignees?: Array<{ _id: string; name: string }>;
}

export function FeatureFilters({
  filters,
  onFiltersChange,
  assignees = [],
}: FeatureFiltersProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search || "");
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
    const newFilters = {
      ...filters,
      [category]: value === "All" ? "all" : value,
    };
    onFiltersChange(newFilters);
    setOpen(false);
  };

  const handleResetFilters = () => {
    onFiltersChange({
      search: "",
      priority: "all",
      phase: "all",
      assignee: "all",
    });
    setSelectedCategory(null);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onFiltersChange({ ...filters, search: value });
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
      case "priority":
        return (
          <FilterGroup
            heading="Priority"
            onBack={() => setSelectedCategory(null)}
          >
            <FilterCommandItem
              icon={Target}
              name="All Priorities"
              onSelect={() => {
                handleFilterChange("priority", "All");
                setSelectedCategory(null);
              }}
            />
            {Object.entries(priorityConfig).map(([key, config]) => (
              <FilterCommandItem
                key={key}
                icon={Target}
                name={config.label}
                colorClass={config.colorClass}
                isSelected={filters.priority === key}
                onSelect={() => {
                  handleFilterChange("priority", key);
                  setSelectedCategory(null);
                }}
              />
            ))}
          </FilterGroup>
        );

      case "phase":
        return (
          <FilterGroup heading="Phase" onBack={() => setSelectedCategory(null)}>
            <FilterCommandItem
              icon={Settings}
              name="All Phases"
              onSelect={() => {
                handleFilterChange("phase", "All");
                setSelectedCategory(null);
              }}
            />
            {Object.entries(phaseConfig).map(([key, config]) => (
              <FilterCommandItem
                key={key}
                icon={Settings}
                name={config.label}
                colorClass={config.colorClass}
                isSelected={filters.phase === key}
                onSelect={() => {
                  handleFilterChange("phase", key);
                  setSelectedCategory(null);
                }}
              />
            ))}
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
              isSelected={filters.assignee === "unassigned"}
              onSelect={() => {
                handleFilterChange("assignee", "unassigned");
                setSelectedCategory(null);
              }}
            />
            {assignees.map((assignee) => (
              <FilterCommandItem
                key={assignee._id}
                icon={User}
                name={assignee.name}
                isSelected={filters.assignee === assignee._id}
                onSelect={() => {
                  handleFilterChange("assignee", assignee._id);
                  setSelectedCategory(null);
                }}
              />
            ))}
          </FilterGroup>
        );
    }
  };

  const getActiveFilters = () => {
    const activeFilters = [];

    if (filters.priority && filters.priority !== "all") {
      const priorityOption =
        priorityConfig[filters.priority as keyof typeof priorityConfig];
      activeFilters.push({
        name: "Priority",
        value: priorityOption?.label || filters.priority,
        icon: Target,
        colorClass: priorityOption?.colorClass || "text-orange-500",
      });
    }

    if (filters.phase && filters.phase !== "all") {
      const phaseOption =
        phaseConfig[filters.phase as keyof typeof phaseConfig];
      activeFilters.push({
        name: "Phase",
        value: phaseOption?.label || filters.phase,
        icon: Settings,
        colorClass: phaseOption?.colorClass || "text-purple-500",
      });
    }

    if (filters.assignee && filters.assignee !== "all") {
      const assigneeName =
        filters.assignee === "unassigned"
          ? "Unassigned"
          : assignees.find((a) => a._id === filters.assignee)?.name ||
            filters.assignee;
      activeFilters.push({
        name: "Assigned To",
        value: assigneeName,
        icon: User,
        colorClass: "text-cyan-500",
      });
    }

    return activeFilters;
  };

  const hasFilters =
    filters.priority !== "all" ||
    filters.phase !== "all" ||
    filters.assignee !== "all";

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
              "h-9 w-9 p-0",
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
                placeholder="Search features..."
                className={cn("h-9 pr-8", searchQuery && "border-primary")}
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
                      "h-9 border-dashed gap-2",
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
          className="h-9 px-3 text-muted-foreground hover:text-foreground"
        >
          <X className="mr-2 h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  );
}
