"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Database, Lock, Trash, Bot, Server } from "lucide-react";
import { Id } from "@workspace/backend";
import { useParams, usePathname, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { techStackOptions } from "@/lib/types";
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

export default function ProjectPage({ children }: { children: ReactNode }) {
  //

  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const id = params.id as string;
  const { token } = useSession();
  const confirm = useConfirm();

  const project = useQuery(api.projects.get, {
    id: id as Id<"projects">,
    token,
  });

  const updateProject = useMutation(api.projects.update);
  const deleteProject = useMutation(api.projects.deleteProject);

  if (pathname === `/project/${project?._id}/flow`) return children;
  if (pathname === `/project/${project?._id}/board`) return children;

  const handleDeleteProject = async () => {
    try {
      const isConfirmed = await confirm({
        description: "Are you sure you want to delete this project?",
        title: "Delete Project",
      });

      if (isConfirmed && project?._id) {
        await deleteProject({ id: project?._id, token });
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
            url: `/project/${project?._id}`,
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
                    onChange={async (value) => {
                      try {
                        await updateProject({
                          project: {
                            projectId: project._id,
                            status: value as any,
                          },
                          token,
                        });
                      } catch (error) {
                        toast.error("Failed to update project");
                      }
                    }}
                    status={project.status}
                  />

                  <h3 className="text-xs font-medium text-muted-foreground">
                    Platform
                  </h3>
                  <ProjectTypeSelector
                    selectedType={project.platform}
                    onChange={async (value) => {
                      try {
                        await updateProject({
                          project: {
                            projectId: project._id,
                            platform: value as any,
                          },
                          token,
                        });
                      } catch (error) {
                        toast.error("Failed to update project");
                      }
                    }}
                  />

                  <h3 className="text-xs font-medium text-muted-foreground">
                    Due date
                  </h3>
                  <DateSelector
                    value={project?.dueDate ? new Date(project?.dueDate) : null}
                    onChange={async (e) => {
                      try {
                        await updateProject({
                          project: {
                            projectId: project._id,
                            dueDate: e?.toDateString(),
                          },
                          token,
                        });
                      } catch (error) {
                        toast.error("Failed to update due date");
                      }
                    }}
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
                    options={techStackOptions.orm.map((option) => ({
                      value: option,
                      label: option,
                      icon: <ImConnection />,
                    }))}
                    onValueChange={async (value) => {
                      try {
                        await updateProject({
                          project: {
                            projectId: project._id,
                            techStack: { ...project.techStack, orm: value },
                          },
                          token,
                        });
                      } catch (error) {
                        toast.error("Failed to update project");
                      }
                    }}
                    value={project.techStack.orm}
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
                    onValueChange={async (value) => {
                      try {
                        await updateProject({
                          project: {
                            projectId: project._id,
                            techStack: {
                              ...project.techStack,
                              database: value,
                            },
                          },
                          token,
                        });
                      } catch (error) {
                        toast.error("Failed to update project");
                      }
                    }}
                    value={project.techStack.database}
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
                    onValueChange={async (value) => {
                      try {
                        await updateProject({
                          project: {
                            projectId: project._id,
                            techStack: { ...project.techStack, auth: value },
                          },
                          token,
                        });
                      } catch (error) {
                        toast.error("Failed to update project");
                      }
                    }}
                    value={project.techStack.auth}
                    placeholder="Select Auth provider"
                  />
                  <h3 className="text-xs font-medium text-muted-foreground">
                    AI
                  </h3>
                  <CommandSelect
                    options={techStackOptions.ai.map((option) => ({
                      value: option,
                      label: option,
                      icon: <Bot />,
                    }))}
                    onValueChange={async (value) => {
                      try {
                        await updateProject({
                          project: {
                            projectId: project._id,
                            techStack: { ...project.techStack, ai: value },
                          },
                          token,
                        });
                      } catch (error) {
                        toast.error("Failed to update project");
                      }
                    }}
                    value={project.techStack.ai}
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
                    onValueChange={async (value) => {
                      try {
                        await updateProject({
                          project: {
                            projectId: project._id,
                            infrastructure: value,
                          },
                          token,
                        });
                      } catch (error) {
                        toast.error("Failed to update project");
                      }
                    }}
                    value={project?.infrastructure}
                    placeholder="Select infrastructure"
                  />
                </div>
              </div>
              <Separator className="my-3" />
              <ActivityFeed
                entityId={project?._id}
                entityType="project"
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
              id={project._id}
              token={token}
            />
          </div>
          <ProjectTabs projectId={project._id} />

          <div className="p-4">{children}</div>
        </ExpandedLayoutContainer>
      )}
    </>
  );
}
