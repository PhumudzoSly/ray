"use client";

import { useId, useState } from "react";
import { Bug, CheckIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { projectTypes } from "@/utils/constants/projects/projectTypes";
import { TbListDetails } from "react-icons/tb";
import { useSession } from "@/context/session-context";
import { useQuery } from "@tanstack/react-query";
import { getIssuesByProject, listAllIssues } from "@/actions/issue";

interface IssueSelectorProps {
  projectId?: string;
  value: string;
  onValueChange: (value: string) => void;
  excludeIssueId?: string | string[];
  placeholder?: string;
  // Legacy props for backward compatibility
  currentIssue?: string | null;
  onChange?: (issue: string | null) => void;
}

interface Issue {
  _id: string;
  title: string;
}

export function IssueSelector({
  projectId,
  value,
  onValueChange,
  excludeIssueId,
  placeholder = "Select issue...",
  // Legacy props
  currentIssue,
  onChange,
}: IssueSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);

  const { token } = useSession();

  // Use new props if available, otherwise fall back to legacy props
  const selectedValue = value !== undefined ? value : currentIssue || "";
  const handleChange = onValueChange || onChange;

  const handleIssueChange = (issueId: string) => {
    handleChange?.(issueId);
    setOpen(false);
  };

  const { data: issues, isPending } = useQuery<Issue[]>({
    queryKey: ["issues", projectId, token],
    queryFn: async () => {
      if (!token) return [];
      if (projectId) {
        const raw = await getIssuesByProject(projectId as string);
        return (raw ?? []).map((i: any) => ({ _id: i.id, title: i.title }));
      } else {
        const raw = await listAllIssues();
        return (raw ?? []).map((i: any) => ({ _id: i.id, title: i.title }));
      }
    },
    enabled: !!token,
  });

  // Filter out excluded issues - support both single ID and array of IDs
  const excludedIds = Array.isArray(excludeIssueId)
    ? excludeIssueId
    : excludeIssueId
      ? [excludeIssueId]
      : [];
  const filteredIssues = (issues ?? []).filter((issue: Issue) => !excludedIds.includes(issue._id));

  const selectedIssue = filteredIssues.find((issue: Issue) => issue._id === selectedValue);

  return (
    <div className="*:not-first:mt-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            className="flex items-center justify-center"
            size="sm"
            variant="secondary"
            role="combobox"
            aria-expanded={open}
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Loading...</span>
              </div>
            ) : selectedIssue ? (
              <div className="flex items-center gap-2">
                <Bug className="text-muted-foreground size-4" />
                <span>{selectedIssue.title}</span>
              </div>
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search issues..." />
            <CommandList>
              <CommandEmpty>
                {isPending ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="ml-2">Loading issues...</span>
                  </div>
                ) : (
                  "No issues found."
                )}
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value=""
                  onSelect={() => handleIssueChange("")}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      No issue selected
                    </span>
                  </div>
                  {!selectedValue && (
                    <CheckIcon size={16} className="ml-auto" />
                  )}
                </CommandItem>
                {filteredIssues.map((issue: Issue) => {
                  const issueType = projectTypes.find(
                    (type) => type.id === issue.title
                  );
                  return (
                    <CommandItem
                      key={issue._id}
                      value={issue._id}
                      onSelect={() => handleIssueChange(issue._id)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {issueType ? (
                          <issueType.icon
                            className={issueType.colorClass + " size-4"}
                          />
                        ) : (
                          <TbListDetails className="text-muted-foreground size-4" />
                        )}
                        <span>{issue.title}</span>
                      </div>
                      {selectedValue === issue._id && (
                        <CheckIcon size={16} className="ml-auto" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
