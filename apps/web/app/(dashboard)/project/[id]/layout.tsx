"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as projectActions from "@/actions/project";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Database, Lock, Trash, Bot, Server } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useSession } from "@/context/session-context";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import { ProjectInfo } from "./_components/project-info";
import { CommandSelect } from "@workspace/ui/components/command-select";
import { toast } from "sonner";
import { DATABASE_PROVIDERS } from "@/utils/constants/sources/database";
import { AUTH_PROVIDERS } from "@/utils/constants/sources/auth";
import { ProjectTypeSelector } from "@/components/ui/selectors/project-type-selector";
import { ImConnection } from "react-icons/im";
import { ProjectTabs } from "./_components/tabs";
import { ReactNode } from "react";
import Header from "@/components/shared/header";
import { useConfirm } from "@workspace/ui/components/confirm-dialog";
import { DateSelector } from "@/components/ui/selectors";
import { INFRASTRUCTURE_PROVIDERS } from "@/utils/constants/sources/infrastructure";
import { ProjectStatusSelector } from "@/components/ui/selectors/project-status-selector";
import { ActivityFeed } from "@/components/shared";
import { ORM_PLATFORMS } from "@/utils/constants/sources/orms";
import { AI_PLATFORMS } from "@/utils/constants/sources/ai";

export default function ProjectPage({ children }: { children: ReactNode }) {
  //

  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const id = params.id as string;
  const { token } = useSession();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  // Fetch project data using TanStack Query and server action
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectActions.getProject(id),
  });

  // Optimistic update mutation for project
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await projectActions.updateProject(id, updates);
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["project", id] });
      const previousProject = queryClient.getQueryData(["project", id]);
      queryClient.setQueryData(["project", id], (old: any) => ({ ...old, ...updates }));
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

  // Optimistic delete mutation for project
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      return await projectActions.deleteProject(id);
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["project", id] });
      const previousProject = queryClient.getQueryData(["project", id]);
      queryClient.setQueryData(["project", id], null);
      return { previousProject };
    },
    onError: (err, variables, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(["project", id], context.previousProject);
      }
      toast.error("Failed to delete project");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
    },
  });

  if (pathname === `/project/${project?.id}/flow`) return children;
  if (pathname === `/project/${project?.id}/board`) return children;

  const handleDeleteProject = async () => {
    try {
      const isConfirmed = await confirm({
        description: "Are you sure you want to delete this project?",
        title: "Delete Project",
      });
      if (isConfirmed && project?.id) {
        await deleteProjectMutation.mutateAsync(project.id);
        router.push("/project");
      }
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  return (
    <>
      <Header
        crumb={[
          {
            title: "Projects",
            url: "/project",
          },
          {
            title: project?.name || "",
            url: `/project/${project?.id}`,
          },
        ]}
      >
        {null}
      </Header>
      {project === undefined ? (
        <LoadingSpinner />
      ) : project === null ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-3">Project not found</h1>
            <p className="text-muted-foreground max-w-md">
              We couldn't find the project you're looking for. It may have been
              deleted or you may not have access.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/project">Back to Projects</Link>
            </Button>
          </div>
        </div>
      ) : (
        <ExpandedLayoutContainer
          sidebar={
            <div className="p-4">
              <div className="flex justify-between items-center gap-4 mb-6">
                <h1 className="text-lg font-medium ">Properties</h1>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={handleDeleteProject}
                >
                  <Trash />
                </Button>
              </div>
              <div className="space-y-3">
                <h3 className="font-medium text-muted-foreground mb-6">
                  Project Info
                </h3>
                <div className="grid grid-cols-[120px_1fr] gap-y-4">
                  <h3 className="text-xs font-medium text-muted-foreground">
                    Status
                  </h3>
                  <ProjectStatusSelector
                    onChange={async (value) => updateProjectMutation.mutate({ id: project.id, updates: { status: value } })}
                    status={project.status}
                  />

                  <h3 className="text-xs font-medium text-muted-foreground">
                    Platform
                  </h3>
                  <ProjectTypeSelector
                    selectedType={project.platform}
                    onChange={async (value) => updateProjectMutation.mutate({ id: project.id, updates: { platform: value } })}
                  />

                  <h3 className="text-xs font-medium text-muted-foreground">
                    Due date
                  </h3>
                  <DateSelector
                    value={project?.dueDate ? new Date(project?.dueDate) : null}
                    onChange={async (e) => updateProjectMutation.mutate({ id: project.id, updates: { dueDate: e?.toDateString() } })}
                  />

                  <h3 className="text-xs font-medium text-muted-foreground">
                    Added
                  </h3>
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(project.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <h3 className="text-xs font-medium text-muted-foreground">
                    Last Updated
                  </h3>
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(project.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="space-y-3">
                <h3 className="font-medium text-muted-foreground mb-6">
                  Tech Stack
                </h3>
                <div className="grid grid-cols-[120px_1fr] gap-y-4">
                  <h3 className="text-xs font-medium text-muted-foreground">
                    ORM
                  </h3>
                  <CommandSelect
                    options={ORM_PLATFORMS.map((option) => ({
                      value: option.name,
                      label: option.name,
                      icon: <ImConnection />,
                    }))}
                    onValueChange={async (value) => updateProjectMutation.mutate({
                      id: project.id, updates: {
                        ...project,
                        orm: value
                      }
                    })}
                    value={project?.orm || ""}
                    placeholder="Select ORM"
                  />

                  <h3 className="text-xs font-medium text-muted-foreground">
                    Database
                  </h3>
                  <CommandSelect
                    options={DATABASE_PROVIDERS.map((option) => ({
                      value: option.name,
                      label: option.name,
                      icon: <Database />,
                    }))}
                    onValueChange={async (value) => updateProjectMutation.mutate({
                      id: project.id, updates: {
                        ...project,
                        database: value
                      }
                    })}
                    value={project?.database || ""}
                    placeholder="Select Database"
                  />

                  <h3 className="text-xs font-medium text-muted-foreground">
                    Auth
                  </h3>
                  <CommandSelect
                    options={AUTH_PROVIDERS.map((option) => ({
                      value: option.name,
                      label: option.name,
                      icon: <Lock />,
                    }))}
                    onValueChange={async (value) => updateProjectMutation.mutate({
                      id: project.id, updates: {
                        ...project,
                        auth: value
                      }
                    })}
                    value={project.auth || ""}
                    placeholder="Select Auth provider"
                  />
                  <h3 className="text-xs font-medium text-muted-foreground">
                    AI
                  </h3>
                  <CommandSelect
                    options={AI_PLATFORMS.map((option) => ({
                      value: option.name,
                      label: option.name,
                      icon: <Bot />,
                    }))}
                    onValueChange={async (value) => updateProjectMutation.mutate({
                      id: project.id, updates: {
                        ...project,
                        ai: value
                      }
                    })}
                    value={project?.ai || ''}
                    placeholder="Select AI provider"
                  />

                  <h3 className="text-xs font-medium text-muted-foreground">
                    Infrastructure
                  </h3>
                  <CommandSelect
                    options={INFRASTRUCTURE_PROVIDERS.map((option) => ({
                      value: option.name,
                      label: option.name,
                      icon: <Server />,
                    }))}
                    onValueChange={async (value) => updateProjectMutation.mutate({
                      id: project.id, updates: {
                        ...project,
                        infrastructure: value
                      }
                    })}
                    value={project?.infrastructure as string}
                    placeholder="Select infrastructure"
                  />
                </div>
              </div>
              <ActivityFeed
                entityId={project?.id}
                entityType="PROJECT"
                emptyMessage="No activity yet"
                limit={20}
              />
            </div>
          }
        >
          <div className="container space-y-4 p-4">
            <ProjectInfo
              title={project.name}
              description={project?.description || ""}
              platform={project?.platform || ""}
              id={project.id}
              token={token}
            />
          </div>
          <ProjectTabs projectId={project.id} />

          <div className="p-4">{children}</div>
        </ExpandedLayoutContainer>
      )}
    </>
  );
}
