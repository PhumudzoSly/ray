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
import { useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { toast } from "sonner";
import { Id } from "@workspace/backend";
import { InlineEditTextArea } from "@workspace/ui/components/inline-textarea";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

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
  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    const platformType = projectTypes.find((type) => type.id === platform);
    if (!platformType) return Globe;

    switch (platformType.icon) {
      case "Globe":
        return Globe;
      case "Smartphone":
        return Smartphone;
      case "Devices":
        return Devices;
      case "Server":
        return Server;
      case "Puzzle":
        return Puzzle;
      case "Monitor":
        return Monitor;
      case "Terminal":
        return Terminal;
      default:
        return Globe;
    }
  };

  const PlatformIcon = getPlatformIcon(platform);
  const updateProject = useMutation(api.projects.update);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <PlatformIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <InlineEditField
              displayValue={
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              }
              value={title}
              onSave={async (value) => {
                try {
                  await updateProject({
                    project: {
                      projectId: id as Id<"projects">,
                      name: value,
                    },
                    token,
                  });
                } catch (error) {
                  toast.error("Failed to update project");
                }
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={"fancy"} asChild>
            <Link href={`/project/${id}/flow`}>Project Flow</Link>
          </Button>
        </div>
      </div>

      <InlineEditTextArea
        value={description}
        onSave={async (value) => {
          try {
            await updateProject({
              project: {
                projectId: id as Id<"projects">,
                description: value,
              },
              token,
            });
          } catch (error) {
            toast.error("Failed to update project");
          }
        }}
      />
    </div>
  );
};
