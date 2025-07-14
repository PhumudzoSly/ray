"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend";
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
import { Id } from "@workspace/backend";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/session-context";
import { ProjectTypeSelector } from "@/components/ui/selectors/project-type-selector";
import { IdeaSelector } from "./ui/selectors/idea-selector";
import { CommandSelect } from "../../../packages/ui/src/components/command-select";
import { techStackOptions } from "@/lib/types";
import { DATABASE_PROVIDERS } from "@/utils/constants/sources/database";
import { AUTH_PROVIDERS } from "@/utils/constants/sources/auth";

type CreateProjectDialogProps = {
  ideaId?: Id<"idea">;
};

type FormState = {
  name: string;
  description: string;
  platform: string;
  priority: string;
  techStack: {
    auth: string;
    orm: string;
    database: string;
    ai: string;
  };
  ideaId?: Id<"idea">;
};

export function CreateProjectDialog({ ideaId }: CreateProjectDialogProps) {
  const { token, org } = useSession();
  const router = useRouter();
  const createProject = useMutation(api.projects.create);
  const [open, setOpen] = useState(false);

  // Fetch idea details if ideaId is provided

  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    platform: "web",
    priority: "MEDIUM",
    techStack: {
      auth: "",
      orm: "",
      database: "",
      ai: "",
    },
    ideaId: ideaId,
  });

  const validateForm = (form: FormState) => {
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
      const projectId = await createProject({
        project: {
          name: form.name,
          description: form.description,
          platform: form.platform as any,
          techStack: form.techStack,
          ideaId: form.ideaId,
        },
        token: token,
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
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <h6 className="text-sm font-medium text-muted-foreground">
            Tech Stack
          </h6>
          <div className="flex items-center mb-2 flex-wrap gap-2">
            <CommandSelect
              options={techStackOptions.ai.map((option) => ({
                value: option,
                label: option,
              }))}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  techStack: { ...form.techStack, ai: value },
                })
              }
              value={form.techStack.ai}
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
                  techStack: { ...form.techStack, auth: value },
                })
              }
              value={form.techStack.auth}
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
                  techStack: { ...form.techStack, database: value },
                })
              }
              value={form.techStack.database}
              placeholder="Select Database provider"
            />
            <CommandSelect
              options={techStackOptions.orm.map((option) => ({
                value: option,
                label: option,
              }))}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  techStack: { ...form.techStack, orm: value },
                })
              }
              value={form.techStack.orm}
              placeholder="Select ORM provider"
            />
          </div>

          <h6 className="text-sm mt-1 font-medium text-muted-foreground">
            Platform
          </h6>
          <div className="w-full flex items-center justify-start gap-1.5 flex-wrap">
            <ProjectTypeSelector
              selectedType={form.platform}
              onChange={(type) => setForm({ ...form, platform: type })}
            />

            <IdeaSelector
              idea={form.ideaId}
              onChange={(ideaId) =>
                setForm({ ...form, ideaId: ideaId as Id<"idea"> })
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
