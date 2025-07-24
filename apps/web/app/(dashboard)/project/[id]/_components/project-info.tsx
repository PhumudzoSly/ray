"use client";

import { InlineEditField } from "@workspace/ui/components/inline-field";
import { toast } from "sonner";
import { InlineEditTextArea } from "@workspace/ui/components/inline-textarea";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { ProjectTypeSelector } from "@/components/ui/selectors/project-type-selector";
import { ProjectPlatform } from "@workspace/backend/prisma/generated/client/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProject } from "@/actions/project/index";

export const ProjectInfo = ({
  title,
  description,
  id,
  platform,
  token,
}: {
  title: string;
  description: string;
  id: string;
  platform: ProjectPlatform;
  token: string;
}) => {
  const queryClient = useQueryClient();
  // Optimistic update mutation for project
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await updateProject(id, updates);
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["project", id] });
      const previousProject = queryClient.getQueryData(["project", id]);
      queryClient.setQueryData(["project", id], (old: any) => ({
        ...old,
        ...updates,
      }));
      return { previousProject };
    },
    onError: (err, variables, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(["project", id], context.previousProject);
      }
      toast.error("Failed to update project");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-3">
          <ProjectTypeSelector
            iconOnly
            selectedType={platform}
            size="lg"
            disabled={true}
          />
          <div>
            <InlineEditField
              displayValue={
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              }
              value={title}
              onSave={async (value) => {
                try {
                  updateProjectMutation.mutate({
                    id,
                    updates: { name: value },
                  });
                } catch (error) {
                  toast.error("Failed to update project");
                }
              }}
            />
          </div>
        </div>
        <div className="flex items-center  gap-4">
          <Button variant={"dark"} asChild>
            <Link href={`/project/${id}/board`}>Project Board</Link>
          </Button>
        </div>
      </div>

      <InlineEditTextArea
        value={description}
        onSave={async (value) => {
          try {
            updateProjectMutation.mutate({
              id,
              updates: { description: value },
            });
          } catch (error) {
            toast.error("Failed to update project");
          }
        }}
      />
    </div>
  );
};
