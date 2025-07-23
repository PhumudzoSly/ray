"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import * as roadmapItemActions from "@/actions/roadmap/items";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { toast } from "sonner";
import { StatusSelector } from "@/components/ui/selectors/status-selector";
import { IssueSelector } from "@/components/ui/selectors/issue-selector";
import { PrioritySelector } from "@/components/ui/selectors/priority-selector";
import { DateSelector } from "@/components/ui/selectors";
import { CommandSelect } from "@workspace/ui/components/command-select";
import {
  Bug,
  Sparkles,
  Wrench,
  TrendingUp,
  Settings,
  Circle,
} from "lucide-react";
import { IssueStatus } from "@workspace/backend/prisma/generated/client/client";
import { LabelSelector } from "@/components/ui/selectors/label-selector";

interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roadmapId: string;
  initialStatus?: IssueStatus;
}

export function AddItemDialog({
  isOpen,
  onClose,
  roadmapId,
  initialStatus = "IN_REVIEW",
}: AddItemDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: initialStatus || "IN_REVIEW",
    category: "feature",
    isPublic: true,
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    targetDate: new Date(),
    issueId: "",
    nodeId: "",
  });

  const createRoadmapItemMutation = useMutation({
    mutationFn: async (data: any) => roadmapItemActions.createRoadmapItem(data),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: initialStatus,
      category: "feature",
      isPublic: true,
      priority: "MEDIUM",
      targetDate: new Date(),
      issueId: "",
      nodeId: "",
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Transform category to uppercase enum value
      const categoryMap: Record<string, string> = {
        feature: "FEATURE",
        enhancement: "IMPROVEMENT",
        "bug-fix": "BUG",
        improvement: "IMPROVEMENT",
        maintenance: "TASK",
        other: "TASK",
      };

      const result = await createRoadmapItemMutation.mutateAsync({
        roadmapId,
        issueId: formData.issueId ? (formData.issueId as any) : undefined,
        nodeId: formData.nodeId || undefined,
        title: formData.title,
        description: formData.description,
        status: formData.status as any,
        category: categoryMap[formData.category] || "FEATURE",
        isPublic: formData.isPublic,
        priority: formData.priority,
        targetDate: formData.targetDate
          ? new Date(formData.targetDate)
          : undefined,
      });

      if (result.success) {
        toast.success("Roadmap item added successfully!");
        resetForm();
        onClose();
      } else {
        toast.error(result.error || "Failed to add roadmap item");
      }
    } catch (error) {
      console.error("Roadmap item creation error:", error);
      toast.error("Failed to add roadmap item");
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Roadmap Item</DialogTitle>
          <DialogDescription>
            Add a new item to your public roadmap
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="New roadmap title"
          />

          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
              })
            }
            placeholder="Describe this roadmap item"
            rows={3}
          />

          <div className="flex items-center gap-3 flex-wrap">
            <LabelSelector
              selectedLabel={formData.category}
              onChange={(label) =>
                setFormData({ ...formData, category: label as any })
              }
            />
            <StatusSelector
              onChange={(status) =>
                setFormData({ ...formData, status: status as IssueStatus })
              }
              status={formData.status}
            />
            {/* <IssueSelector
              value={formData.issueId}
              onValueChange={(issueId) =>
                setFormData({ ...formData, issueId: issueId || "" })
              }
            /> */}
            <PrioritySelector
              onChange={(priority) =>
                setFormData({ ...formData, priority: priority as any })
              }
              priority={formData.priority}
            />
            <DateSelector
              placeholder="Target date"
              onChange={(date) =>
                setFormData({ ...formData, targetDate: date || new Date() })
              }
              value={new Date(formData.targetDate)}
            />

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPublic: checked })
                }
              />
              <Label htmlFor="isPublic" className="text-muted-foreground">
                Public item
              </Label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 py-2.5 px-4 w-full border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Item</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
