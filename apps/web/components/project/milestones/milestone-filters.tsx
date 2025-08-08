"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@workspace/ui/components/command";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@/lib/utils";
import { CalendarRange, Clock, Diamond, Filter, Loader2, Search, User } from "lucide-react";

// Define simple filters for milestones: status, owner, endDate (like issues)
const statusOptions = [
  { id: "NOT_STARTED", name: "Not Started", colorClass: "text-muted-foreground" },
  { id: "IN_PROGRESS", name: "In Progress", colorClass: "text-blue-500" },
  { id: "AT_RISK", name: "At Risk", colorClass: "text-orange-500" },
  { id: "DELAYED", name: "Delayed", colorClass: "text-red-500" },
  { id: "COMPLETED", name: "Completed", colorClass: "text-green-500" },
];

const dateRanges = [
  { id: "overdue", name: "Overdue" },
  { id: "thisWeek", name: "Due this week" },
  { id: "nextWeek", name: "Due next week" },
  { id: "thisMonth", name: "Due this month" },
  { id: "noDate", name: "No date" },
];

export function MilestoneFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [owner, setOwner] = useState(searchParams.get("owner") || "");
  const [dueDate, setDueDate] = useState(searchParams.get("dueDate") || "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const update = (key: string, value: string) => {
      if (!value || value === "All") params.delete(key);
      else params.set(key, value);
    };
    update("status", status);
    update("owner", owner);
    update("dueDate", dueDate);
    if (searchQuery) params.set("search", searchQuery);
    else params.delete("search");
    router.push(`?${params.toString()}`);
  }, [status, owner, dueDate, searchQuery]);

  const handleStatus = (val: string) => setStatus(val);
  const handleOwner = (val: string) => setOwner(val);
  const handleDueDate = (val: string) => setDueDate(val);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" /> Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-80" align="start">
          <Command>
            {!selectedCategory ? (
              <>
                <CommandInput placeholder="Search filters..." />
                <CommandList>
                  <CommandEmpty>No filters found.</CommandEmpty>
                  <CommandGroup heading="Categories">
                    <CommandItem onSelect={() => setSelectedCategory("status")}>
                      <Clock className="h-4 w-4 mr-2 text-blue-500" /> Status
                    </CommandItem>
                    <CommandItem onSelect={() => setSelectedCategory("owner")}>
                      <User className="h-4 w-4 mr-2 text-cyan-500" /> Owner
                    </CommandItem>
                    <CommandItem onSelect={() => setSelectedCategory("dueDate")}>
                      <CalendarRange className="h-4 w-4 mr-2 text-green-500" /> Due Date
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </>
            ) : (
              <>
                <CommandList>
                  <CommandGroup>
                    {selectedCategory === "status" && (
                      <>
                        <CommandItem onSelect={() => { handleStatus("All"); setSelectedCategory(null); }}>All Statuses</CommandItem>
                        {statusOptions.map((s) => (
                          <CommandItem key={s.id} onSelect={() => { handleStatus(s.id); setSelectedCategory(null); }}>
                            <Clock className={`h-4 w-4 mr-2 ${s.colorClass}`} /> {s.name}
                          </CommandItem>
                        ))}
                      </>
                    )}
                    {selectedCategory === "owner" && (
                      <>
                        <CommandItem onSelect={() => { handleOwner("All"); setSelectedCategory(null); }}>Anyone</CommandItem>
                        <CommandItem onSelect={() => { handleOwner("unassigned"); setSelectedCategory(null); }}>Unassigned</CommandItem>
                        {/* For now, simple input. Could integrate real assignee selector if needed */}
                      </>
                    )}
                    {selectedCategory === "dueDate" && (
                      <>
                        <CommandItem onSelect={() => { handleDueDate("All"); setSelectedCategory(null); }}>Any time</CommandItem>
                        {dateRanges.map((d) => (
                          <CommandItem key={d.id} onSelect={() => { handleDueDate(d.id); setSelectedCategory(null); }}>
                            <CalendarRange className="h-4 w-4 mr-2 text-green-500" /> {d.name}
                          </CommandItem>
                        ))}
                      </>
                    )}
                  </CommandGroup>
                </CommandList>
              </>
            )}
          </Command>
        </PopoverContent>

      {/* Active filter badges */}
      <div className="flex items-center gap-2">
        {status && status !== "All" && (
          <Badge variant="outline" className="text-xs">Status: {statusOptions.find(s => s.id === status)?.name || status}</Badge>
        )}
        {owner && owner !== "All" && (
          <Badge variant="outline" className="text-xs">{owner === "unassigned" ? "Unassigned" : `Owner: ${owner}`}</Badge>
        )}
        {dueDate && dueDate !== "All" && (
          <Badge variant="outline" className="text-xs">Due: {dateRanges.find(d => d.id === dueDate)?.name || dueDate}</Badge>
        )}
        {searchQuery && (
          <Badge variant="secondary" className="text-xs">Search: “{searchQuery}”</Badge>
        )}
        {(status || owner || dueDate || searchQuery) && (
          <Button variant="ghost" size="sm" onClick={() => { setStatus(""); setOwner(""); setDueDate(""); setSearchQuery(""); }}>Clear all</Button>
        )}
      </div>

      </Popover>

      <div className={cn("flex items-center gap-2 transition-all", "w-[180px] md:w-[300px]")}>
        <Input
          ref={searchInputRef}
          placeholder="Search milestones..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9"
        />
        <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>Clear</Button>
      </div>
    </div>
  );
}

export default MilestoneFilters;

