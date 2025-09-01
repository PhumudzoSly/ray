"use client";

import { useId, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
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
import { Badge } from "@workspace/ui/components/badge";
import { CheckCircle2, CircleDot, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ideaActions from "@/actions/idea";
import { toast } from "sonner";
import { role } from "better-auth/plugins";

export type IdeaStatus =
  | "INVALIDATED"
  | "VALIDATED"
  | "FAILED"
  | "IN_PROGRESS"
  | "LAUNCHED";

const statusOptions = [
  {
    id: "INVALIDATED",
    name: "Invalidated",
    icon: CircleDot,
    description: "Idea has not been validated with potential customers",
    colorClass: "text-yellow-500",
  },
  {
    id: "VALIDATED",
    name: "Validated",
    icon: CheckCircle2,
    description: "Idea has been validated with potential customers",
    colorClass: "text-green-500",
  },
  {
    id: "FAILED",
    name: "Failed",
    icon: XCircle,
    description: "Idea validation failed or was abandoned",
    colorClass: "text-red-500",
  },
  {
    id: "IN_PROGRESS",
    name: "In Progress",
    icon: Loader2,
    description: "Idea is currently being developed",
    colorClass: "text-blue-500",
  },
  {
    id: "LAUNCHED",
    name: "Launched",
    icon: CheckCircle2,
    description: "Idea has been launched to market",
    colorClass: "text-emerald-500",
  },
];

interface StatusSelectorProps {
  status: IdeaStatus;
  id: string;
  refetch?: () => void;
  disabled?: boolean;
  iconOnly?: boolean;
}

export function StatusSelector({
  status,
  id,
  refetch,
  disabled = false,
  iconOnly = false,
}: StatusSelectorProps) {
  const componentId = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<IdeaStatus>(status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();
  const changeStatusMutation = useMutation({
    mutationFn: async (data: { id: string; status: string }) =>
      ideaActions.changeStatus(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const handleStatusChange = async (statusId: IdeaStatus) => {
    if (statusId === value || isSubmitting) return;

    setValue(statusId);
    setOpen(false);
    setIsSubmitting(true);

    try {
      await toast.promise(
        changeStatusMutation.mutateAsync({
          id,
          status: statusId,
        }),
        {
          error: "Failed to update idea status",
          loading: "Updating idea status",
          success: "Idea status updated",
        }
      );
      refetch?.();
    } catch (error) {
      console.error("Error updating status:", error);
      setValue(status); // Revert on error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={componentId}
          className="flex items-center justify-start gap-2"
          size="sm"
          variant="secondary"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isSubmitting}
        >
          {(() => {
            const selectedItem = statusOptions.find(
              (item) => item.id === value
            );
            if (selectedItem) {
              const Icon = selectedItem.icon;
              return (
                <>
                  <Icon className={cn("size-4", selectedItem.colorClass)} />
                  {!iconOnly && <span>{selectedItem.name}</span>}
                </>
              );
            }
            return null;
          })()}
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Set status..." />
          <CommandList>
            <CommandEmpty>No status found.</CommandEmpty>
            <CommandGroup>
              {statusOptions.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => handleStatusChange(item.id as IdeaStatus)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className={cn("size-4", item.colorClass)} />
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </div>
                  </div>
                  {value === item.id && (
                    <CheckIcon size={16} className="ml-auto" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function getStatusBadge(status: IdeaStatus) {
  const statusData = statusOptions.find((s) => s.id === status);
  if (!statusData) return null;

  const colorClasses = {
    "text-yellow-500":
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    "text-green-500":
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "text-red-500": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    "text-blue-500":
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "text-emerald-500":
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  };

  return (
    <Badge
      variant="secondary"
      className={`${colorClasses[statusData.colorClass as keyof typeof colorClasses]} text-xs`}
    >
      {statusData.name}
    </Badge>
  );
}

// Legacy export for backward compatibility
export default StatusSelector;
