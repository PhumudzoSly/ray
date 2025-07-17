"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/session-context";
import { ProjectTypeSelector } from "@/components/ui/selectors/project-type-selector";
import { IdeaSelector } from "./ui/selectors/idea-selector";
import { CommandSelect } from "../../../packages/ui/src/components/command-select";
import { DATABASE_PROVIDERS } from "@/utils/constants/sources/database";
import { AUTH_PROVIDERS } from "@/utils/constants/sources/auth";
import { ORM_PLATFORMS } from "@/utils/constants/sources/orms";
import { createProject } from "@/actions/project";
import { ProjectOptionalDefaults } from "@workspace/backend";
import { AI_PLATFORMS } from "@/utils/constants/sources/ai";

type CreateProjectDialogProps = {
  ideaId?: string;
};


export function CreateProjectDialog({ ideaId }: CreateProjectDialogProps) {
  const { token, org } = useSession();
  const router = useRouter();
  const createProjectMutation = useMutation(
    {
      mutationFn: createProject,
      onSuccess: () => {
        toast.success("Project created successfully!");
        //  router.push(`/project/${projectId}`);
      },
      onError: () => {
        toast.error("Failed to create project. Please try again.");
      }
    }
  );
  const [open, setOpen] = useState(false);

  // Fetch idea details if ideaId is provided

  const [form, setForm] = useState<ProjectOptionalDefaults>({
    name: "",
    description: "", // Ensure always string
    platform: "web", // Must match allowed types
    status: "review",
    auth: "",
    orm: "",
    database: "",
    ai: "",
    ideaId: ideaId ?? undefined, // Ensure string | undefined
  });

  const validateForm = (form: ProjectOptionalDefaults) => {
    const requiredFields = ["name", "platform", "ideaId"] as const;
    for (const field of requiredFields) {
      if (!form[field]?.trim()) {
        toast.error(
          `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        );
        return false;
      }
    }
    return true;
  };

  async function handleSubmit() {
    if (!validateForm(form)) {
      return;
    }

    try {
      const projectId = await createProjectMutation.mutateAsync({
        ...form,
        platform: form.platform as any,
      });

      setOpen(false);
      toast.success("Project created successfully!");
      router.push(`/project/${projectId}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shrink-0" variant="fancy">
          <Plus /> New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-[750px] shadow-xl">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>
            {ideaId
              ? "Create a project to implement your validated idea"
              : "Set up your app flow project with AI-powered PRD generation"}
          </DialogDescription>
        </DialogHeader>

        <div className="pb-0 space-y-3 w-full">
          <Input
            placeholder="Project name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Textarea
            placeholder="Project description..."
            value={form.description ?? ""} // Ensure string
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <h6 className="text-sm font-medium text-muted-foreground">
            Tech Stack
          </h6>
          <div className="flex items-center mb-2 flex-wrap gap-2">
            <CommandSelect
              options={AI_PLATFORMS.map((option) => ({
                value: option.name,
                label: option.name,
              }))}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  ai: value
                })
              }
              value={form.ai ?? ""}
              placeholder="Select AI provider"
            />
            <CommandSelect
              options={AUTH_PROVIDERS.map((option) => ({
                value: option.name,
                label: option.name,
              }))}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  auth: value
                })
              }
              value={form.auth ?? ""}
              placeholder="Select Auth provider"
            />
            <CommandSelect
              options={DATABASE_PROVIDERS.map((option) => ({
                value: option.name,
                label: option.name,
              }))}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  database: value
                })
              }
              value={form.database ?? ""}
              placeholder="Select Database provider"
            />
            <CommandSelect
              options={ORM_PLATFORMS.map((option) => ({
                value: option.name,
                label: option.name,
              }))}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  orm: value
                })
              }
              value={form.orm ?? ""}
              placeholder="Select ORM provider"
            />
          </div>

          <h6 className="text-sm mt-1 font-medium text-muted-foreground">
            Platform
          </h6>
          <div className="w-full flex items-center justify-start gap-1.5 flex-wrap">
            <ProjectTypeSelector
              selectedType={form.platform as "web" | "mobile" | "both" | "api" | "plugin" | "desktop" | "cli"}
              onChange={(type) => setForm({ ...form, platform: type })}
            />

            <IdeaSelector
              idea={form.ideaId ?? undefined}
              onChange={(ideaId) =>
                setForm({ ...form, ideaId: ideaId as string })
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-end py-2.5 px-4 w-full border-t">
          <Button onClick={handleSubmit}>Create Project</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
