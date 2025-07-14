"use client";

import { useId, useState } from "react";
import { CheckIcon, Layers } from "lucide-react";
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
import { useData } from "@/hooks/use-data";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { Id } from "@workspace/backend";

interface FeatureSelectorProps {
  projectId?: string;
  selectedFeatureId?: string;
  value?: string;
  onChange: (featureId: string | null) => void;
  excludeFeatureIds?: string[];
  placeholder?: string;
}

export function FeatureSelector({
  projectId,
  selectedFeatureId,
  value,
  onChange,
  excludeFeatureIds = [],
  placeholder = "Select feature...",
}: FeatureSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const { token } = useSession();

  const { data: projectFeatures, isPending: projectPending } = useData(
    api.issue.feature.getFeaturesByProject,
    projectId
      ? {
          token,
          projectId: projectId as Id<"projects">,
        }
      : "skip"
  );

  const features = projectFeatures;

  const isPending = projectPending;

  const currentValue = value || selectedFeatureId;
  const filteredFeatures =
    features?.filter((f) => !excludeFeatureIds.includes(f._id)) || [];

  const selectedFeature = filteredFeatures.find(
    (feature) => feature._id === currentValue
  );

  const handleFeatureChange = (featureId: string) => {
    onChange(featureId === "" ? null : featureId);
    setOpen(false);
  };

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
            ) : selectedFeature ? (
              <div className="flex items-center gap-2">
                <Layers className="text-muted-foreground size-4" />
                <span className="truncate">{selectedFeature.name}</span>
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
            <CommandInput placeholder="Search features..." />
            <CommandList>
              <CommandEmpty>
                {isPending ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="ml-2">Loading features...</span>
                  </div>
                ) : (
                  "No features found."
                )}
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value=""
                  onSelect={() => handleFeatureChange("")}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      No feature linked
                    </span>
                  </div>
                  {!currentValue && <CheckIcon size={16} className="ml-auto" />}
                </CommandItem>
                {filteredFeatures.map((feature) => (
                  <CommandItem
                    key={feature._id}
                    value={feature._id}
                    onSelect={() => handleFeatureChange(feature._id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="text-muted-foreground size-4" />
                      <span>{feature.name}</span>
                    </div>
                    {currentValue === feature._id && (
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
