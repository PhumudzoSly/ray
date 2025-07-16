"use client";

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
import { useSession } from "@/context/session-context";
import {
  Box,
  CheckIcon,
  FolderIcon,
  ListCollapse,
  Loader2,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllIdeas } from "@/actions/idea";

interface IdeaSelectorProps {
  idea: string | undefined;
  onChange: (idea: string) => void;
}

export function IdeaSelector({ idea, onChange }: IdeaSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string | undefined>(idea);

  const { data: ideas, isPending } = useQuery({
    queryKey: ['all-ideas'],
    queryFn: async () => {
      return await getAllIdeas()
    }
  });

  useEffect(() => {
    setValue(idea);
  }, [idea]);

  const handleIdeaChange = (ideaId: string) => {
    if (ideaId === "no-idea") {
      setValue(undefined);
      onChange("");
    } else {
      setValue(ideaId);
      const newIdea = ideas?.find((p) => p.id === ideaId);
      if (newIdea) {
        onChange(newIdea.id);
      }
    }
    setOpen(false);
  };

  return (
    <div className="*:not-first:mt-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            className="flex items-center justify-center"
            size="xs"
            variant="secondary"
            role="combobox"
            aria-expanded={open}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 mr-1 animate-spin" />
                <span>Loading ideas...</span>
              </>
            ) : (
              <>
                {value ? (
                  (() => {
                    const selectedIdea = ideas?.find((p) => p.id === value);
                    if (selectedIdea) {
                      return <ListCollapse className="size-4" />;
                    }
                    return <Box className="size-4" />;
                  })()
                ) : (
                  <Box className="size-4" />
                )}
                <span>
                  {value
                    ? ideas?.find((p) => p.id === value)?.name
                    : "No idea selected"}
                </span>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Set idea..." />
            <CommandList>
              <CommandEmpty>No ideas found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="no-idea"
                  onSelect={() => handleIdeaChange("no-idea")}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FolderIcon className="size-4" />
                    No Idea
                  </div>
                  {value === undefined && (
                    <CheckIcon size={16} className="ml-auto" />
                  )}
                </CommandItem>
                {ideas?.map((idea) => (
                  <CommandItem
                    key={idea.id}
                    value={idea.id}
                    onSelect={() => handleIdeaChange(idea.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">{idea.name}</div>
                    {value === idea.id && (
                      <CheckIcon size={16} className="ml-auto" />
                    )}
                    <span className="text-muted-foreground text-xs">
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
