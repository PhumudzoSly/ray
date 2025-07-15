"use client";

import { useData } from "@/hooks/use-data";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import Link from "next/link";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  BarChart,
  Globe,
  Smartphone,
  Server,
  Terminal,
  Puzzle,
} from "lucide-react";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";

const statusIcons = {
  planning: Clock,
  "in-progress": BarChart,
  review: AlertTriangle,
  completed: CheckCircle2,
};

const platformIcons = {
  web: Globe,
  mobile: Smartphone,
  both: Globe,
  api: Server,
  plugin: Puzzle,
  desktop: Terminal,
  cli: Terminal,
};

export default function ProjectOverview() {
  const { token } = useSession();
  const { data: projects, isPending } = useData(api.projects.list, {
    token,
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!projects?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <BarChart className="h-12 w-12 mb-2 opacity-20" />
        <p>No projects found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center p-4 border-b">
        <BarChart className="h-5 w-5 mr-2 text-primary" />
        <h3 className="font-semibold">Project Status</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {projects.map((project) => {
          const StatusIcon = statusIcons[project.status || "planning"];
          const PlatformIcon = platformIcons[project.platform];

          return (
            <Card
              key={project._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <Link
                    href={`/project/${project._id}`}
                    className="text-lg font-medium hover:underline"
                  >
                    {project.name}
                  </Link>
                  <Badge variant="secondary" className="capitalize">
                    {project.status || "planning"}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <PlatformIcon className="h-4 w-4" />
                    <span className="capitalize">{project.platform}</span>
                  </div>

                  <div className="text-sm">
                    <div className="font-medium mb-1">Tech Stack</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(project.techStack).map(([key, value]) => (
                        <Badge
                          key={key}
                          variant="outline"
                          className="capitalize"
                        >
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
