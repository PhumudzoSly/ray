"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Search,
  X,
  Filter,
  Calendar,
  User,
  Clock,
  Tag,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Grid3X3,
  Table,
  Layers,
  Database,
  Shield,
  Cpu,
  Brain,
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
    id: "status",
    name: "Status",
    description: "Filter projects by their current status",
    icon: Clock,
    colorClass: "text-blue-500",
  },
  {
    id: "platform",
    name: "Platform",
    description: "Filter by target platform",
    icon: Layers,
    colorClass: "text-purple-500",
  },
  {
    id: "auth",
    name: "Authentication",
    description: "Filter by authentication method",
    icon: Shield,
    colorClass: "text-green-500",
  },
  {
    id: "database",
    name: "Database",
    description: "Filter by database technology",
    icon: Database,
    colorClass: "text-orange-500",
  },
  {
    id: "orm",
    name: "ORM",
    description: "Filter by ORM/database layer",
    icon: Cpu,
    colorClass: "text-cyan-500",
  },
  {
    id: "ai",
    name: "AI Integration",
    description: "Filter by AI technology used",
    icon: Brain,
    colorClass: "text-pink-500",
  },
];

// Status configuration with colors and labels
const statusConfig = {
  planning: { label: "Planning", colorClass: "text-blue-500" },
  "in-progress": { label: "In Progress", colorClass: "text-yellow-500" },
  review: { label: "Review", colorClass: "text-purple-500" },
  completed: { label: "Completed", colorClass: "text-green-500" },
};

// Platform configuration
const platformConfig = {
  web: { label: "Web", colorClass: "text-blue-500" },
  mobile: { label: "Mobile", colorClass: "text-green-500" },
  both: { label: "Web & Mobile", colorClass: "text-purple-500" },
  api: { label: "API", colorClass: "text-orange-500" },
  plugin: { label: "Plugin", colorClass: "text-cyan-500" },
  desktop: { label: "Desktop", colorClass: "text-pink-500" },
  cli: { label: "CLI", colorClass: "text-gray-500" },
};

// Sort options
const SORT_OPTIONS = [
  { id: "name-asc", label: "Name (A-Z)" },
  { id: "name-desc", label: "Name (Z-A)" },
  { id: "updated-desc", label: "Last Updated" },
  { id: "updated-asc", label: "First Updated" },
];

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

interface EnhancedProjectFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: string;
  onSortChange: (option: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  filterPlatform: string;
  onFilterPlatformChange: (platform: string) => void;
  filterAuth: string;
  onFilterAuthChange: (auth: string) => void;
  filterDatabase: string;
  onFilterDatabaseChange: (database: string) => void;
  filterOrm: string;
  onFilterOrmChange: (orm: string) => void;
  filterAi: string;
  onFilterAiChange: (ai: string) => void;
  availableOptions: {
    auths: string[];
    databases: string[];
    orms: string[];
    ais: string[];
  };
  view: "kanban" | "table";
  onViewChange: (view: "kanban" | "table") => void;
}

export function EnhancedProjectFilters({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  filterStatus,
  onFilterStatusChange,
  filterPlatform,
  onFilterPlatformChange,
  filterAuth,
  onFilterAuthChange,
  filterDatabase,
  onFilterDatabaseChange,
  filterOrm,
  onFilterOrmChange,
  filterAi,
  onFilterAiChange,
  availableOptions,
  view,
  onViewChange,
}: EnhancedProjectFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
    // Update local state based on category
    switch (category) {
      case "status":
        onFilterStatusChange(value === "All" ? "" : value);
        break;
      case "platform":
        onFilterPlatformChange(value === "All" ? "" : value);
        break;
      case "auth":
        onFilterAuthChange(value === "All" ? "" : value);
        break;
      case "database":
        onFilterDatabaseChange(value === "All" ? "" : value);
        break;
      case "orm":
        onFilterOrmChange(value === "All" ? "" : value);
        break;
      case "ai":
        onFilterAiChange(value === "All" ? "" : value);
        break;
    }

    // Close the popover after selection
    setOpen(false);
  };

  const handleResetFilters = () => {
    // Reset all filters
    onFilterStatusChange("");
    onFilterPlatformChange("");
    onFilterAuthChange("");
    onFilterDatabaseChange("");
    onFilterOrmChange("");
    onFilterAiChange("");
    onSearchChange("");
    setSelectedCategory(null);
    setIsSearchOpen(false);
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
                isSelected={filterStatus === key}
                onSelect={() => {
                  handleFilterChange("status", key);
                  setSelectedCategory(null);
                }}
              />
            ))}
          </FilterGroup>
        );

      case "platform":
        return (
          <FilterGroup
            heading="Platform"
            onBack={() => setSelectedCategory(null)}
          >
            <FilterCommandItem
              icon={Layers}
              name="All Platforms"
              onSelect={() => {
                handleFilterChange("platform", "All");
                setSelectedCategory(null);
              }}
            />
            {Object.entries(platformConfig).map(([key, config]) => (
              <FilterCommandItem
                key={key}
                icon={Layers}
                name={config.label}
                colorClass={config.colorClass}
                isSelected={filterPlatform === key}
                onSelect={() => {
                  handleFilterChange("platform", key);
                  setSelectedCategory(null);
                }}
              />
            ))}
          </FilterGroup>
        );

      case "auth":
        return (
          <FilterGroup
            heading="Authentication"
            onBack={() => setSelectedCategory(null)}
          >
            <FilterCommandItem
              icon={Shield}
              name="All Authentication"
              onSelect={() => {
                handleFilterChange("auth", "All");
                setSelectedCategory(null);
              }}
            />
            {availableOptions.auths.map((auth) => (
              <FilterCommandItem
                key={auth}
                icon={Shield}
                name={auth}
                colorClass="text-green-500"
                isSelected={filterAuth === auth}
                onSelect={() => {
                  handleFilterChange("auth", auth);
                  setSelectedCategory(null);
                }}
              />
            ))}
          </FilterGroup>
        );

      case "database":
        return (
          <FilterGroup
            heading="Database"
            onBack={() => setSelectedCategory(null)}
          >
            <FilterCommandItem
              icon={Database}
              name="All Databases"
              onSelect={() => {
                handleFilterChange("database", "All");
                setSelectedCategory(null);
              }}
            />
            {availableOptions.databases.map((database) => (
              <FilterCommandItem
                key={database}
                icon={Database}
                name={database}
                colorClass="text-orange-500"
                isSelected={filterDatabase === database}
                onSelect={() => {
                  handleFilterChange("database", database);
                  setSelectedCategory(null);
                }}
              />
            ))}
          </FilterGroup>
        );

      case "orm":
        return (
          <FilterGroup heading="ORM" onBack={() => setSelectedCategory(null)}>
            <FilterCommandItem
              icon={Cpu}
              name="All ORMs"
              onSelect={() => {
                handleFilterChange("orm", "All");
                setSelectedCategory(null);
              }}
            />
            {availableOptions.orms.map((orm) => (
              <FilterCommandItem
                key={orm}
                icon={Cpu}
                name={orm}
                colorClass="text-cyan-500"
                isSelected={filterOrm === orm}
                onSelect={() => {
                  handleFilterChange("orm", orm);
                  setSelectedCategory(null);
                }}
              />
            ))}
          </FilterGroup>
        );

      case "ai":
        return (
          <FilterGroup
            heading="AI Integration"
            onBack={() => setSelectedCategory(null)}
          >
            <FilterCommandItem
              icon={Brain}
              name="All AI Technologies"
              onSelect={() => {
                handleFilterChange("ai", "All");
                setSelectedCategory(null);
              }}
            />
            {availableOptions.ais.map((ai) => (
              <FilterCommandItem
                key={ai}
                icon={Brain}
                name={ai}
                colorClass="text-pink-500"
                isSelected={filterAi === ai}
                onSelect={() => {
                  handleFilterChange("ai", ai);
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

    if (filterPlatform) {
      const platformOption =
        platformConfig[filterPlatform as keyof typeof platformConfig];
      filters.push({
        name: "Platform",
        value: platformOption?.label || filterPlatform,
        icon: Layers,
        colorClass: platformOption?.colorClass || "text-purple-500",
      });
    }

    if (filterAuth) {
      filters.push({
        name: "Authentication",
        value: filterAuth,
        icon: Shield,
        colorClass: "text-green-500",
      });
    }

    if (filterDatabase) {
      filters.push({
        name: "Database",
        value: filterDatabase,
        icon: Database,
        colorClass: "text-orange-500",
      });
    }

    if (filterOrm) {
      filters.push({
        name: "ORM",
        value: filterOrm,
        icon: Cpu,
        colorClass: "text-cyan-500",
      });
    }

    if (filterAi) {
      filters.push({
        name: "AI",
        value: filterAi,
        icon: Brain,
        colorClass: "text-pink-500",
      });
    }

    return filters;
  };

  const hasFilters =
    filterStatus ||
    filterPlatform ||
    filterAuth ||
    filterDatabase ||
    filterOrm ||
    filterAi;

  return (
    <div className="flex items-center flex-wrap gap-2 w-full">
      <div className="flex items-center gap-2 justify-between w-full flex-wrap">
        <div className="flex item-center gap-2 flex-wrap">
          <div
            className={cn(
              "flex items-center flex-wrap gap-2 transition-all duration-300 ease-in-out",
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
                  placeholder="Search projects..."
                  className={cn(
                    "h-9 pr-8 transition-all duration-300",
                    searchQuery && "border-primary"
                  )}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsSearchOpen(false);
                      onSearchChange("");
                    }
                  }}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                    onClick={() => {
                      onSearchChange("");
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

          {/* Sort Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Sort</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1" align="start">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {SORT_OPTIONS.map((option) => (
                      <CommandItem
                        key={option.id}
                        onSelect={() => onSortChange(option.id)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          {sortOption === option.id && (
                            <span className="text-primary">✓</span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

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

        {/* View Switcher */}
        <div className="flex items-center border rounded-lg p-1">
          <Button
            variant={view === "kanban" ? "default" : "ghost"}
            size="icon"
            onClick={() => onViewChange("kanban")}
            className="h-7 px-3"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={view === "table" ? "default" : "ghost"}
            size="icon"
            onClick={() => onViewChange("table")}
            className="h-7 px-3"
          >
            <Table className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
