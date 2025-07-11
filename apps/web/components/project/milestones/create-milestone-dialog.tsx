"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { Id } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Calendar } from "@workspace/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { DateRangeSelector } from "@/components/ui/selectors/date-range-selector";
import { AssigneeSelector } from "@/components/ui/selectors/assignee-selector";

interface CreateMilestoneDialogProps {
  projectId: Id<"projects">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormState = {
  name: string;
  description: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  ownerId: Id<"user"> | undefined;
};

export function CreateMilestoneDialog({
  projectId,
  open,
  onOpenChange,
}: CreateMilestoneDialogProps) {
  const { token } = useSession();
  const createMilestone = useMutation(api.milestones.createMilestone);
  const organizationMembers = useQuery(api.user.orgMembers, { token });

  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    startDate: new Date(),
    endDate: undefined,
    ownerId: undefined,
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

  async function handleSubmit() {
    if (!validateForm(form)) {
      return;
    }

    try {
      await toast.promise(
        createMilestone({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          projectId,
          startDate: form.startDate?.getTime(),
          endDate: form.endDate?.getTime(),
          ownerId: form.ownerId,
          token,
        }),
        {
          loading: "Creating milestone...",
          error: "Failed to create milestone",
          success: "Milestone created successfully",
        }
      );

      close();
    } catch (error) {
      console.error("Error creating milestone:", error);
      toast.error("Failed to create milestone");
    }
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

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date Range</Label>
              <DateRangeSelector
                startDate={form.startDate}
                endDate={form.endDate}
                onRangeChange={(startDate, endDate) =>
                  setForm({ ...form, startDate, endDate })
                }
                placeholder="Select milestone duration"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Owner</Label>
              <AssigneeSelector
                assignee={form.ownerId as Id<"user">}
                onChange={(value) =>
                  setForm({ ...form, ownerId: value as Id<"user"> })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Milestone</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
