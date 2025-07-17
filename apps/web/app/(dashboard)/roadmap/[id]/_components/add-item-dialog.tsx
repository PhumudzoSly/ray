"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import * as roadmapItemActions from "@/actions/roadmap/items";
import { api } from "@workspace/backend";
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
  DialogFooter,
} from "@workspace/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { toast } from "sonner";
import { Id } from "@workspace/backend";
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

interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roadmapId: Id<"publicRoadmaps">;
  token: string;
  initialStatus?: string;
}

export function AddItemDialog({
  isOpen,
  onClose,
  roadmapId,
  token,
  initialStatus = "BACKLOG",
}: AddItemDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: initialStatus || "BACKLOG",
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
      const targetDate = formData.targetDate
        ? new Date(formData.targetDate).getTime()
        : undefined;

      await createRoadmapItemMutation.mutateAsync({
        roadmapId,
        issueId: formData.issueId ? (formData.issueId as any) : undefined,
        nodeId: formData.nodeId || undefined,
        title: formData.title,
        description: formData.description,
        status: formData.status as any,
        category: formData.category,
        isPublic: formData.isPublic,
        priority: formData.priority,
        targetDate,
        token,
      });

      toast.success("Roadmap item added successfully!");
      resetForm();
      onClose();
    } catch (error) {
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
            <CommandSelect
              options={[
                {
                  label: "Feature",
                  value: "feature",
                  color: "gray",
                  icon: <Sparkles size={16} />,
                },
                {
                  label: "Enhancement",
                  value: "enhancement",
                  color: "gray",
                  icon: <TrendingUp size={16} />,
                },
                {
                  label: "Bug Fix",
                  value: "bug-fix",
                  color: "gray",
                  icon: <Bug size={16} />,
                },
                {
                  label: "Improvement",
                  value: "improvement",
                  color: "gray",
                  icon: <Wrench size={16} />,
                },
                {
                  label: "Maintenance",
                  value: "maintenance",
                  color: "gray",
                  icon: <Settings size={16} />,
                },
                {
                  label: "Other",
                  value: "other",
                  color: "gray",
                  icon: <Circle size={16} />,
                },
              ]}
              placeholder="Select a category"
              onValueChange={(value) =>
                setFormData({ ...formData, category: value as any })
              }
              value={formData.category}
            />
            <StatusSelector
              onChange={(status) => setFormData({ ...formData, status })}
              status={formData.status}
            />
            <IssueSelector
              onChange={(issueId) =>
                setFormData({ ...formData, issueId: issueId || "" })
              }
              currentIssue={formData.issueId}
            />
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
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isPublic"
            checked={formData.isPublic}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isPublic: checked })
            }
          />
          <Label htmlFor="isPublic" className="text-muted-foreground">
            Make this item public
          </Label>
        </div>

        <div className="flex items-center justify-end py-2.5 px-4 w-full border-t">
          <Button onClick={handleSubmit}>Create Item</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
