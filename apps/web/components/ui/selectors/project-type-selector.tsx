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
import { CheckIcon } from "lucide-react";
import { useId, useState } from "react";
import {
  projectTypes,
  ProjectType,
} from "@/utils/constants/projects/projectTypes"; // Import the project types

interface ProjectTypeSelectorProps {
  selectedType: string;
  onChange: (type: string) => void;
}

export function ProjectTypeSelector({
  selectedType,
  onChange,
}: ProjectTypeSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);

  const handleTypeChange = (typeId: string) => {
    onChange(typeId);
    setOpen(false);
  };

  const selectedProjectType: ProjectType | undefined = projectTypes.find(
    (type) => type.id === selectedType
  );

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
          >
            {selectedProjectType ? (
              <div className="flex items-center gap-2">
                <selectedProjectType.icon className="text-muted-foreground size-4" />
                <span>{selectedProjectType.name}</span>
              </div>
            ) : (
              <span>Select Project Type</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search project types..." />
            <CommandList>
              <CommandEmpty>No project types found.</CommandEmpty>
              <CommandGroup>
                {projectTypes.map((type) => (
                  <CommandItem
                    key={type.id}
                    value={type.id}
                    onSelect={() => handleTypeChange(type.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {/* @ts-ignore */}
                      <type.icon className="text-muted-foreground size-4" />
                      <span>{type.name}</span>
                    </div>
                    {selectedType === type.id && (
                      <CheckIcon size={16} className="ml-auto" />
                    )}
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
