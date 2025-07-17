"use client";

import { projectTypes } from "@/lib/types";
import {
  Globe,
  Smartphone,
  Dices as Devices,
  Server,
  Puzzle,
  Monitor,
  Terminal,
  Users,
} from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import React from "react";
import { InlineEditField } from "@workspace/ui/components/inline-field";
import { api } from "@workspace/backend";
import { toast } from "sonner";
import { Id } from "@workspace/backend";
import { InlineEditTextArea } from "@workspace/ui/components/inline-textarea";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { ProjectTypeSelector } from "@/components/ui/selectors/project-type-selector";

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
  platform: string;
  token: string;
}) => {
  // Removed: const updateProject = useMutation(api.projects.update);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
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
                  // Removed: await updateProject({
                  // Removed:   project: {
                  // Removed:     projectId: id as Id<"projects">,
                  // Removed:     name: value,
                  // Removed:   },
                  // Removed:   token,
                  // Removed: });
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
          <Button variant={"fancy"} asChild>
            <Link href={`/project/${id}/flow`}>Project Flow</Link>
          </Button>
        </div>
      </div>

      <InlineEditTextArea
        value={description}
        onSave={async (value) => {
          try {
            // Removed: await updateProject({
            // Removed:   project: {
            // Removed:     projectId: id as Id<"projects">,
            // Removed:     description: value,
            // Removed:   },
            // Removed:   token,
            // Removed: });
          } catch (error) {
            toast.error("Failed to update project");
          }
        }}
      />
    </div>
  );
};
