"use client";

import { useState } from "react";
import { useSession } from "@/context/session-context";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { toast } from "sonner";
import { DateRangeSelector } from "@/components/ui/selectors/date-range-selector";
import { AssigneeSelector } from "@/components/ui/selectors/assignee-selector";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createMilestone } from "@/actions/project/milestone";
import { getOrgMembers } from "@/actions/account/user";

interface CreateMilestoneDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormState = {
  name: string;
  description: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  ownerId: string | undefined;
};

export function CreateMilestoneDialog({
  projectId,
  open,
  onOpenChange,
}: CreateMilestoneDialogProps) {
  const { token } = useSession();
  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    startDate: new Date(),
    endDate: undefined,
    ownerId: undefined,
  });

  // Fetch org members for assignee selector
  const { data: organizationMembers } = useQuery({
    queryKey: ["orgMembers", token],
    queryFn: async () => {
      if (!token) return [];
      const raw = await getOrgMembers();
      return (raw ?? []).map((m: any) => ({
        _id: m.id,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
      }));
    },
    enabled: !!token,
  });

  // Utility function to validate form fields
  const validateForm = (form: FormState) => {
    if (!form.name.trim()) {
      toast.error("Milestone name is required");
      return false;
    }
    return true;
  };

  const close = () => {
    onOpenChange(false);
    // Reset form
    setForm({
      name: "",
      description: "",
      startDate: new Date(),
      endDate: undefined,
      ownerId: undefined,
    });
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => createMilestone(data),
    onSuccess: () => {
      toast.success("Milestone created successfully");
      close();
    },
    onError: () => {
      toast.error("Failed to create milestone");
    },
  });

  async function handleSubmit() {
    if (!validateForm(form)) {
      return;
    }
    mutation.mutate({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      projectId,
      startDate: form.startDate?.getTime(),
      endDate: form.endDate?.getTime(),
      ownerId: form.ownerId,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create Milestone
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name *
            </Label>
            <Input
              id="name"
              placeholder="Enter milestone name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter milestone description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="min-h-[80px] resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-4">
            <AssigneeSelector
              assignee={form.ownerId ?? null}
              onChange={(value) =>
                setForm({ ...form, ownerId: value })
              }
            />
            <DateRangeSelector
              startDate={form.startDate}
              endDate={form.endDate}
              onRangeChange={(startDate, endDate) =>
                setForm({ ...form, startDate, endDate })
              }
              placeholder="Select milestone duration"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            className="mb-2"
            type="button"
            variant="outline"
            onClick={close}
          >
            Cancel
          </Button>
          <Button className="mb-2" onClick={handleSubmit} disabled={mutation.status === "pending"}>
            {mutation.status === "pending" ? "Creating..." : "Create Milestone"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
