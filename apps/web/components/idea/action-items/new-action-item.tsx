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
import { ActionItemStatusSelector } from "@/components/ui/selectors/action-item-status-selector";
import { ActionItemPrioritySelector } from "@/components/ui/selectors/action-item-priority-selector";
import { AssigneeSelector } from "@/components/ui/selectors/assignee-selector";
import { useSession } from "@/context/session-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as actionItemActions from "@/actions/idea/action-items";
import {
  ActionItemStatus,
  Importance,
} from "@workspace/backend/prisma/generated/client/client";

type NewActionItemProps = {
  ideaId: string;
  variant?: "default" | "compact";
  size?: "default" | "sm";
  defaultStatus?: ActionItemStatus;
};

type FormState = {
  name: string;
  description: string;
  status: ActionItemStatus;
  priority: Importance;
  assigneeId: string | null;
};

export function NewActionItem({
  ideaId,
  variant = "default",
  size = "default",
  defaultStatus,
}: NewActionItemProps) {
  const { token, org } = useSession();
  const queryClient = useQueryClient();
  const createActionItemMutation = useMutation({
    mutationFn: async (data: any) => actionItemActions.createActionItem(data),
  });
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    status: defaultStatus || "BACKLOG",
    priority: "MEDIUM",
    assigneeId: null,
  });

  // Utility function to validate form fields
  const validateForm = (form: FormState) => {
    if (!form.name.trim()) {
      toast.error("Action item name is required");
      return false;
    }
    return true;
  };

  async function handleSubmit() {
    if (!validateForm(form)) {
      return;
    }
    setOpen(false);

    try {
      const result = await createActionItemMutation.mutateAsync({
        name: form.name,
        description: form.description || undefined,
        status: form.status,
        priority: form.priority,
        ideaId: ideaId,
        assigneeId: form.assigneeId || undefined,
      });

      if (result && result.success) {
        toast.success("Action item created successfully");

        // Invalidate all action item-related queries
        queryClient.invalidateQueries({ queryKey: ["actionItems"] });
        queryClient.invalidateQueries({ queryKey: ["actionItems", ideaId] });

        // Reset form
        setForm({
          name: "",
          description: "",
          status: defaultStatus || "BACKLOG",
          priority: "MEDIUM",
          assigneeId: null,
        });

        router.refresh();
      } else {
        const errorMsg = (result as any)?.error
          ? String((result as any).error)
          : "Failed to create action item";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error creating action item:", error);
      toast.error("Failed to create action item");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="shrink-0 flex items-center gap-1.5"
          size={size === "sm" ? "icon-sm" : "default"}
        >
          <Plus /> {size === "sm" ? "" : "New Item"}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-[750px] shadow-xl">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
          <DialogDescription>
            Create a new validation task for your idea
          </DialogDescription>
        </DialogHeader>

        <div className="pb-0 space-y-3 w-full">
          <Input
            placeholder="Action item name (e.g., Survey target customers)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Textarea
            placeholder="Add description..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="w-full flex items-center justify-start gap-1.5 flex-wrap">
            <ActionItemStatusSelector
              status={form.status}
              onChange={(status: ActionItemStatus) =>
                setForm({ ...form, status })
              }
            />
            <ActionItemPrioritySelector
              priority={form.priority}
              onChange={(priority: Importance) =>
                setForm({ ...form, priority })
              }
            />
            <AssigneeSelector
              assignee={form.assigneeId}
              onChange={(assigneeId: string) => {
                if (assigneeId === "unassigned") {
                  setForm({ ...form, assigneeId: null });
                } else {
                  setForm({ ...form, assigneeId });
                }
              }}
            />
          </div>
        </div>
        <div className="flex items-center justify-end py-2.5 px-4 w-full border-t">
          <Button
            onClick={handleSubmit}
            disabled={createActionItemMutation.isPending}
          >
            {createActionItemMutation.isPending
              ? "Creating..."
              : "Create Action Item"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
