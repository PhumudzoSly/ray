"use client";

import React, { useState, useEffect, useMemo, ReactNode } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import { Button } from "@workspace/ui/components/button";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

// Types for the search component
export interface SearchItem {
  id: string;
  value: string;
  keywords?: string[];
  data?: any;
}

export interface SearchGroup {
  id: string;
  heading: string;
  items: SearchItem[];
}

export interface SearchConfig<T = any> {
  placeholder?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  groups?: SearchGroup[];
  items?: SearchItem[];
  onSearch?: (query: string) => Promise<SearchItem[]> | SearchItem[];
  renderItem: (item: SearchItem) => ReactNode;
  onSelect: (item: SearchItem) => void;
  maxResults?: number;
  searchKeys?: string[];
  showRecentSearches?: boolean;
  recentSearchesKey?: string;
}

export interface CommandSearchProps<T = any> {
  config: SearchConfig<T>;
  trigger?: ReactNode;
  triggerClassName?: string;
  dialogClassName?: string;
  commandClassName?: string;
  shortcut?: string[];
  disabled?: boolean;
}

// Hook for managing recent searches
const useRecentSearches = (key: string) => {
  const [recentSearches, setRecentSearches] = useState<SearchItem[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`recent-searches-${key}`);
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch (e) {
          console.warn("Failed to parse recent searches:", e);
        }
      }
    }
  }, [key]);

  const addRecentSearch = (item: SearchItem) => {
    const newRecent = [
      item,
      ...recentSearches.filter((r) => r.id !== item.id),
    ].slice(0, 5);
    setRecentSearches(newRecent);
    if (typeof window !== "undefined") {
      localStorage.setItem(`recent-searches-${key}`, JSON.stringify(newRecent));
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(`recent-searches-${key}`);
    }
  };

  return { recentSearches, addRecentSearch, clearRecentSearches };
};

// Main search component
export function CommandSearch<T = any>({
  config,
  trigger,
  triggerClassName,
  dialogClassName,
  commandClassName,
  shortcut = ["cmd", "k"],
  disabled = false,
}: CommandSearchProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);

  const { recentSearches, addRecentSearch, clearRecentSearches } =
    useRecentSearches(config.recentSearchesKey || "default");

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      const isCmd = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (shortcut.includes("cmd") && isCmd && shortcut.includes(key)) {
        e.preventDefault();
        setOpen(true);
      }

      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcut, disabled, open]);

  // Search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      if (config.onSearch) {
        const results = await config.onSearch(searchQuery);
        setSearchResults(Array.isArray(results) ? results : []);
      } else {
        // Default search through provided items/groups
        const allItems = [
          ...(config.items || []),
          ...(config.groups?.flatMap((group) => group.items) || []),
        ];

        const filtered = allItems.filter((item) => {
          const searchText = [
            item.value,
            ...(item.keywords || []),
            ...(config.searchKeys?.map((key) => item.data?.[key]) || []),
          ]
            .join(" ")
            .toLowerCase();

          return searchText.includes(searchQuery.toLowerCase());
        });

        setSearchResults(filtered.slice(0, config.maxResults || 50));
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle item selection
  const handleSelect = (item: SearchItem) => {
    config.onSelect(item);
    if (config.showRecentSearches) {
      addRecentSearch(item);
    }
    setOpen(false);
    setQuery("");
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setSearchResults([]);
      setLoading(false);
    }
  }, [open]);

  // Organize results into groups
  const organizedResults = useMemo(() => {
    if (config.groups && !query) {
      return config.groups;
    }

    if (query && searchResults.length > 0) {
      return [
        {
          id: "search-results",
          heading: "Search Results",
          items: searchResults,
        },
      ];
    }

    if (!query && config.showRecentSearches && recentSearches.length > 0) {
      return [
        {
          id: "recent-searches",
          heading: "Recent Searches",
          items: recentSearches,
        },
      ];
    }

    return config.groups || [];
  }, [
    config.groups,
    query,
    searchResults,
    recentSearches,
    config.showRecentSearches,
  ]);

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "relative h-8 w-8 p-0 xl:h-9 xl:w-60 xl:justify-start xl:px-3 xl:py-2",
        triggerClassName
      )}
      onClick={() => setOpen(true)}
      disabled={disabled}
    >
      <Search className="h-4 w-4 xl:mr-2" />
      <span className="hidden xl:inline-flex">Search...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );

  return (
    <>
      {trigger || defaultTrigger}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={config.placeholder || "Search..."}
          value={query}
          onValueChange={setQuery}
        />

        <CommandList className="max-h-[400px] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">
                {config.loadingMessage || "Searching..."}
              </span>
            </div>
          )}

          {!loading && organizedResults.length === 0 && (
            <CommandEmpty>
              {config.emptyMessage || "No results found."}
            </CommandEmpty>
          )}

          {!loading &&
            organizedResults.map((group) => (
              <CommandGroup key={group.id} heading={group.heading}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.value}
                    onSelect={() => handleSelect(item)}
                    className="cursor-pointer"
                  >
                    {config.renderItem(item)}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}

          {config.showRecentSearches && recentSearches.length > 0 && query && (
            <CommandGroup heading="Actions">
              <CommandItem
                onSelect={clearRecentSearches}
                className="cursor-pointer text-muted-foreground"
              >
                Clear recent searches
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

// Convenience hook for creating search configs
export function useSearchConfig<T = any>(
  config: SearchConfig<T>
): SearchConfig<T> {
  return useMemo(() => config, [config]);
}
