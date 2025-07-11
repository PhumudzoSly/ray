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

interface AssigneeSelectorProps {
  assignee: string | null;
  onChange: (assignee: string) => void;
}

export function AssigneeSelector({
  assignee,
  onChange,
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
      onChange(userId);
    } else {
      setValue(userId);
      const newAssignee = members?.find((u) => u?._id === userId);
      if (newAssignee) {
        onChange(newAssignee._id);
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
            className="flex items-center"
            size="xs"
            variant="secondary"
            role="combobox"
            aria-expanded={open}
          >
            {value ? (
              (() => {
                const selectedUser = members?.find(
                  (user) => user?._id === value
                );
                if (selectedUser) {
                  return (
                    <Avatar className="size-5">
                      <AvatarImage
                        src={selectedUser.image || ""}
                        alt={selectedUser.name}
                      />
                      <AvatarFallback>
                        {selectedUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  );
                }
                return <UserCircle className="size-5" />;
              })()
            ) : (
              <UserCircle className="size-5" />
            )}

            <span>
              {value
                ? members
                    ?.find((user) => user?._id === value)
                    ?.name?.slice(0, 16) + "..."
                : "No lead assigned"}
            </span>
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
                          <AvatarImage
                            src={user?.image || ""}
                            alt={user?.name}
                          />
                          <AvatarFallback>
                            {user?.name.charAt(0)}
                          </AvatarFallback>
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
    </div>
  );
}
