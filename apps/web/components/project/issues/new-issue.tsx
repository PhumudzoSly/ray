"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { toast } from "sonner";
import { StatusSelector } from "@/components/ui/selectors/status-selector";
import { PrioritySelector } from "@/components/ui/selectors/priority-selector";
import { LabelSelector } from "@/components/ui/selectors/label-selector";
import { ProjectSelector } from "@/components/ui/selectors/project-selector";
import { labels } from "@/utils/constants/issues/labels";
import { useSession } from "@/context/session-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as issueActions from "@/actions/issue";
import { IssueOptionalDefaults } from "@workspace/backend";
import {
  Importance,
  IssueLabel,
  IssueStatus,
} from "@workspace/backend/prisma/generated/client/client";

type NewIssueProps = {
  projectId?: string;
  parentIssueId?: string;
  variant?: "default" | "sub-issue";
  size?: "default" | "sm";
  defaultStatus?: IssueStatus;
};

type FormState = {
  title: string;
  description: string;
  status: IssueStatus;
  priority: Importance;
  label: IssueLabel;
  projectId: string | null;
  dependencies: string[];
};

export function NewIssue({
  projectId: initialProjectId,
  parentIssueId,
  variant = "default",
  size = "default",
  defaultStatus,
}: NewIssueProps) {
  const { token, org } = useSession();
  const queryClient = useQueryClient();
  const createIssueMutation = useMutation({
    mutationFn: async (data: any) => issueActions.createIssue(data),
  });
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    status: defaultStatus || "IN_REVIEW",
    priority: "MEDIUM",
    label: "FEATURE",
    projectId: initialProjectId || "",
    dependencies: [],
  });

  // Utility function to validate form fields
  const validateForm = (form: FormState) => {
    if (!form.projectId) {
      toast.error("Project is required");
      return false;
    }

    const requiredStringFields: (keyof FormState)[] = ["title", "description"];
    for (const key of requiredStringFields) {
      if (typeof form[key] === "string" && !form[key].trim()) {
        toast.error(
          `${key.charAt(0).toUpperCase() + key.slice(1)} is required`
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
    setOpen(false);

    try {
      const result = await createIssueMutation.mutateAsync({
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        label: form.label,
        projectId: form.projectId,
        parentIssueId,
        organizationId: org,
      });

      if (result && result.success) {
        toast.success(
          variant === "sub-issue"
            ? "Sub-issue created successfully"
            : "Issue created successfully"
        );

        // Invalidate all issue-related queries to ensure data consistency
        queryClient.invalidateQueries({ queryKey: ["issues"] });
        queryClient.invalidateQueries({ queryKey: ["issues-grouped"] });
        queryClient.invalidateQueries({ queryKey: ["issue"] });
        queryClient.invalidateQueries({ queryKey: ["issueHierarchy"] });
        queryClient.invalidateQueries({ queryKey: ["issueActivities"] });
        queryClient.invalidateQueries({ queryKey: ["issueDependencies"] });

        // Invalidate project-specific issue queries
        if (form.projectId) {
          queryClient.invalidateQueries({
            queryKey: ["issues", form.projectId],
          });
          queryClient.invalidateQueries({
            queryKey: ["issues", form.projectId, token],
          });
        }

        // If creating a sub-issue, invalidate parent issue hierarchy
        if (parentIssueId) {
          queryClient.invalidateQueries({
            queryKey: ["issueHierarchy", parentIssueId],
          });
          queryClient.invalidateQueries({ queryKey: ["issue", parentIssueId] });
        }

        router.refresh();
      } else {
        const errorMsg =
          result && result.error
            ? typeof result.error === "object" &&
              result.error !== null &&
              "message" in result.error &&
              typeof result.error.message === "string"
              ? result.error.message
              : String(result.error)
            : "Failed to create issue";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error creating issue:", error);
      toast.error("Failed to create issue");
    }
  }

  // Find the full label object based on the form's label ID
  const selectedLabel = labels.find((l) => l.id === form.label);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "sub-issue" ? (
          <Button
            size={size === "sm" ? "icon-sm" : "default"}
            variant="outline"
            className="flex items-center gap-1.5"
          >
            <Plus />
            {size === "sm" ? "Add Sub-Issue" : "Add Sub-Issue"}
          </Button>
        ) : (
          <Button
            className="shrink-0 flex items-center gap-1.5"
            variant={size === "sm" ? "outline" : "fancy"}
            size={size === "sm" ? "icon-sm" : "default"}
          >
            <Plus /> {size === "sm" ? "" : "New Issue"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-[750px] shadow-xl">
        <DialogHeader>
          <DialogTitle>
            {variant === "sub-issue" ? "New Sub-Issue" : "New Issue"}
          </DialogTitle>
          <DialogDescription>
            {variant === "sub-issue"
              ? "Create a sub-issue that will be linked to the parent issue"
              : "New issues are auto-assigned to their creator"}
          </DialogDescription>
        </DialogHeader>

        <div className="pb-0 space-y-3 w-full">
          <Input
            placeholder="Issue title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <Textarea
            placeholder="Add description..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="w-full flex items-center justify-start gap-1.5 flex-wrap">
            <StatusSelector
              status={form.status}
              onChange={(status: string) =>
                setForm({ ...form, status: status as any })
              }
            />
            <PrioritySelector
              priority={form.priority}
              onChange={(priority: string) =>
                setForm({ ...form, priority: priority as any })
              }
            />
            <LabelSelector
              selectedLabel={selectedLabel}
              onChange={(label) =>
                setForm({
                  ...form,
                  label: label.id as any,
                })
              }
            />
            {!initialProjectId && (
              <ProjectSelector
                currentProject={form.projectId}
                onChange={(projectId) => setForm({ ...form, projectId })}
              />
            )}
          </div>
        </div>
        <div className="flex items-center justify-end py-2.5 px-4 w-full border-t">
          <Button onClick={handleSubmit}>Create Issue</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
