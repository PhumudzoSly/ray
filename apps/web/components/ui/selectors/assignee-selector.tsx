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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { CheckIcon, UserCircle } from "lucide-react";
import { useEffect, useId, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { useSession } from "@/context/session-context";
import { useData } from "@/hooks/use-data";
import { api } from "@workspace/backend";
import { getInitials } from "@/utils/helpers";

interface AssigneeSelectorProps {
  assignee: string | null;
  onChange?: (assignee: string) => void;
  disabled?: boolean;
  iconOnly?: boolean;
}

export function AssigneeSelector({
  assignee,
  onChange,
  disabled,
  iconOnly,
}: AssigneeSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string | null>(assignee || null);

  const { token } = useSession();
  const { data: members } = useData(api.user.orgMembers, {
    token,
  });

  useEffect(() => {
    setValue(assignee || null);
  }, [assignee]);

  const handleAssigneeChange = (userId: string) => {
    if (userId === "unassigned") {
      setValue(null);
      onChange?.(userId);
    } else {
      setValue(userId);
      const newAssignee = members?.find((u) => u?._id === userId);
      if (newAssignee) {
        onChange?.(newAssignee._id);
      }
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          className="flex items-center max-w-[200px] truncate"
          size={iconOnly ? "icon-sm" : "xs"}
          variant="secondary"
          role="combobox"
          disabled={disabled}
          aria-expanded={open}
        >
          {value ? (
            (() => {
              const selectedUser = members?.find((user) => user?._id === value);
              if (selectedUser) {
                return (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="rounded-none size-5">
                          <AvatarImage
                            src={selectedUser.image || ""}
                            alt={selectedUser.name}
                            className="rounded-none size-5"
                          />
                          <AvatarFallback className="rounded-none size-5">
                            {getInitials(selectedUser?.name || "")}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage
                              src={selectedUser.image || ""}
                              alt={selectedUser.name}
                            />
                            <AvatarFallback>
                              {getInitials(selectedUser?.name || "")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <p className="font-medium text-sm">
                              {selectedUser.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {selectedUser.email}
                            </p>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              }
              return <UserCircle className="size-5" />;
            })()
          ) : (
            <UserCircle />
          )}
          {iconOnly ? null : (
            <div>
              {value
                ? members?.find((user) => user?._id === value)?.name
                : "No lead assigned"}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Lead by..." />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              {members?.map((user) => {
                return (
                  <CommandItem
                    key={user?._id}
                    value={user?._id}
                    onSelect={() => handleAssigneeChange(user?._id as any)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="size-5">
                        <AvatarImage src={user?.image || ""} alt={user?.name} />
                        <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {user?.name}
                    </div>
                    {value === user?._id && (
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
  );
}
