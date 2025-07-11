"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Folder } from "lucide-react";
import Link from "next/link";

interface MinimalProjectsProps {
  projects: any[];
}

export const MinimalProjects: React.FC<MinimalProjectsProps> = ({
  projects,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { variant: "default" | "secondary" | "outline"; label: string }
    > = {
      completed: { variant: "secondary", label: "Completed" },
      "in-progress": { variant: "default", label: "In Progress" },
      review: { variant: "secondary", label: "Review" },
      planning: { variant: "outline", label: "Planning" },
    };
    return statusConfig[status] || statusConfig["planning"];
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-normal flex items-center gap-2">
          <Folder className="h-4 w-4" />
          Projects
        </CardTitle>
        <Link
          href="/projects"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View all →
        </Link>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No projects yet
          </p>
        ) : (
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => {
              const status = getStatusBadge(project.status || "planning");
              return (
                <Link
                  key={project._id}
                  href={`/projects/${project._id}`}
                  className="block group"
                >
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none group-hover:text-primary">
                        {project.name}
                      </p>
                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={status.variant} className="ml-2">
                      {status.label}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
