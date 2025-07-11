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
import { api } from "@workspace/backend";
import { useData } from "@/hooks/use-data";
import {
  Box,
  CheckIcon,
  FolderIcon,
  ListCollapse,
  Loader2,
} from "lucide-react";
import { useEffect, useId, useState } from "react";

interface IdeaSelectorProps {
  idea: string | undefined;
  onChange: (idea: string) => void;
}

export function IdeaSelector({ idea, onChange }: IdeaSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string | undefined>(idea);

  const { token } = useSession();
  const { data: ideas, isPending } = useData(api.idea.getIdeas, {
    token,
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
      const newIdea = ideas?.find((p) => p._id === ideaId);
      if (newIdea) {
        onChange(newIdea._id);
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
                    const selectedIdea = ideas?.find((p) => p._id === value);
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
                    ? ideas?.find((p) => p._id === value)?.name
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
                    key={idea._id}
                    value={idea._id}
                    onSelect={() => handleIdeaChange(idea._id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">{idea.name}</div>
                    {value === idea._id && (
                      <CheckIcon size={16} className="ml-auto" />
                    )}
                    <span className="text-muted-foreground text-xs">
                      {/* {filterByIdea(idea._id).length} */}
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
