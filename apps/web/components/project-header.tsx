"use client";

import { Button } from "@workspace/ui/components/button";
import { Header } from "@workspace/ui/components/header";
import { Badge } from "@workspace/ui/components/badge";
import {
  ArrowLeft,
  Workflow,
  Settings,
  ExternalLink,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { Project } from "@/lib/types";

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <Header
          title={project.name}
          showBackButton={true}
          backHref="/dashboard"
        >
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/project/${project._id}/flow`}>
                <Workflow className="w-4 h-4 mr-2" />
                Flow Editor
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/issues?project=${project._id}`}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Issues
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/project/${project._id}/launch`}>
                <Rocket className="w-4 h-4 mr-2" />
                Launch
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </Header>

        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-muted-foreground">Tech Stack:</span>
          <Badge variant="secondary" className="text-xs">
            {project.techStack.auth.split(" ")[0]}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {project.techStack.orm}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {project.techStack.database.split(" ")[0]}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {project.techStack.ai}
          </Badge>
        </div>
      </div>
    </div>
  );
}
