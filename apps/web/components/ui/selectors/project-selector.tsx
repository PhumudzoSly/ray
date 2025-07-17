"use client";

import { useId, useState } from "react";
import { CheckIcon } from "lucide-react";
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
import { getProjects } from "@/actions/project";

interface ProjectSelectorProps {
  currentProject?: string | null;
  onChange: (project: string | null) => void;
}

interface Project {
  _id: string;
  name: string;
  platform?: string;
}

export function ProjectSelector({
  currentProject,
  onChange,
}: ProjectSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);

  const { token } = useSession();

  const handleProjectChange = (projectId: string) => {
    onChange(projectId);
    setOpen(false);
  };

  const { data: projects, isPending } = useQuery<Project[]>({
    queryKey: ["projects", token],
    queryFn: async () => {
      if (!token) return [];
      const raw = await getProjects();
      return (raw ?? []).map((p: any) => ({
        _id: p.id,
        name: p.name,
        platform: p.platform,
      }));
    },
    enabled: !!token,
  });

  const selectedProject = (projects ?? []).find((project: Project) => project._id === currentProject);

  // Find the project type configuration for the selected project
  const selectedProjectType = selectedProject
    ? projectTypes.find((type) => type.id === selectedProject.platform)
    : null;

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
            ) : selectedProject ? (
              <div className="flex items-center gap-2">
                {selectedProjectType ? (
                  <selectedProjectType.icon
                    className={selectedProjectType.colorClass + " size-4"}
                  />
                ) : (
                  <TbListDetails className="text-muted-foreground size-4" />
                )}
                <span>{selectedProject.name}</span>
              </div>
            ) : (
              <span>Select Project</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search projects..." />
            <CommandList>
              <CommandEmpty>
                {isPending ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="ml-2">Loading projects...</span>
                  </div>
                ) : (
                  "No projects found."
                )}
              </CommandEmpty>
              <CommandGroup>
                {(projects ?? []).map((project: Project) => {
                  const projectType = projectTypes.find(
                    (type) => type.id === project.platform
                  );
                  return (
                    <CommandItem
                      key={project._id}
                      value={project._id}
                      onSelect={() => handleProjectChange(project._id)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {projectType ? (
                          <projectType.icon
                            className={projectType.colorClass + " size-4"}
                          />
                        ) : (
                          <TbListDetails className="text-muted-foreground size-4" />
                        )}
                        <span>{project.name}</span>
                      </div>
                      {currentProject === project._id && (
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
