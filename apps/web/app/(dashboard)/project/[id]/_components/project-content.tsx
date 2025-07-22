"use client";

import { useQuery } from "@tanstack/react-query";
import * as projectActions from "@/actions/project";
import { ProjectInfo } from "./project-info";
import { ProjectTabs } from "./tabs";
import { ReactNode } from "react";

interface ProjectContentProps {
  projectId: string;
  token: string;
  children: ReactNode;
}

export function ProjectContent({
  projectId,
  token,
  children,
}: ProjectContentProps) {
  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectActions.getProject(projectId),
  });

  if (!project) {
    return <div className="p-4">Loading...</div>;
  }
  return (
    <>
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
    </>
  );
}
