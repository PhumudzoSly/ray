"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCompetitiveMove } from "@/actions/idea/competitor";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { MoveTypeSelector } from "./move-type-selector";
import { ImpactLevelSelector } from "./impact-level-selector";
import { DateSelector } from "@/components/ui/selectors/date-selector";

export function AddCompetitiveMove({ competitorId }: AddCompetitiveMoveProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    moveType: "PRODUCT_LAUNCH",
    impactLevel: "MEDIUM",
    announcedDate: null,
    launchDate: null,
    targetAudience: "",
    affectedFeatures: "",
    opportunities: "",
    threats: "",
    responseRequired: false,
    responseStrategy: "",
  });

  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async (data: any) => createCompetitiveMove(data),
  });

  // Utility function to validate form fields
  const validateForm = (form: FormState) => {
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
      const result = await createMutation.mutateAsync({
        move: {
          competitorId,
          title: form.title,
          description: form.description,
          moveType: form.moveType,
          impactLevel: form.impactLevel,
          announcedDate: form.announcedDate,
          launchDate: form.launchDate,
          targetAudience: form.targetAudience || null,
          affectedFeatures: form.affectedFeatures
            ? [form.affectedFeatures]
            : [],
          opportunities: form.opportunities ? [form.opportunities] : [],
          threats: form.threats ? [form.threats] : [],
          responseRequired: form.responseRequired,
          responseStrategy: form.responseStrategy || null,
          pressCoverage: [],
          userFeedback: null,
        },
      });

      if (result) {
        toast.success("Competitive move created successfully");

        // Invalidate competitive moves queries
        queryClient.invalidateQueries({
          queryKey: ["competitiveMoves", competitorId],
        });
        queryClient.invalidateQueries({ queryKey: ["competitiveMoves"] });
      } else {
        toast.error("Failed to create competitive move");
      }
    } catch (error) {
      console.error("Error creating competitive move:", error);
      toast.error("Failed to create competitive move");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" />
          Add Move
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-[750px] shadow-xl">
        <DialogHeader>
          <DialogTitle>New Competitive Move</DialogTitle>
          <DialogDescription>
            Track competitor activities and strategic moves
          </DialogDescription>
        </DialogHeader>

        <div className="pb-0 space-y-3 w-full">
          <Input
            placeholder="Move title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <Textarea
            placeholder="Add description..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <Input
            placeholder="Target audience (optional)"
            value={form.targetAudience}
            onChange={(e) =>
              setForm({ ...form, targetAudience: e.target.value })
            }
          />

          <Input
            placeholder="Affected features (optional)"
            value={form.affectedFeatures}
            onChange={(e) =>
              setForm({ ...form, affectedFeatures: e.target.value })
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Opportunities this creates"
              value={form.opportunities}
              onChange={(e) =>
                setForm({ ...form, opportunities: e.target.value })
              }
            />
            <Input
              placeholder="Threats this poses"
              value={form.threats}
              onChange={(e) => setForm({ ...form, threats: e.target.value })}
            />
          </div>

          {form.responseRequired && (
            <Textarea
              placeholder="Response strategy..."
              value={form.responseStrategy}
              onChange={(e) =>
                setForm({ ...form, responseStrategy: e.target.value })
              }
            />
          )}

          <div className="w-full flex items-center justify-start gap-1.5 flex-wrap">
            <MoveTypeSelector
              moveType={form.moveType}
              onChange={(moveType: string) => setForm({ ...form, moveType })}
            />
            <ImpactLevelSelector
              impactLevel={form.impactLevel}
              onChange={(impactLevel: string) =>
                setForm({ ...form, impactLevel: impactLevel as Importance })
              }
            />
            <DateSelector
              value={form.announcedDate}
              onChange={(date) => setForm({ ...form, announcedDate: date })}
              placeholder="Announced date"
              size="xs"
            />
            <DateSelector
              value={form.launchDate}
              onChange={(date) => setForm({ ...form, launchDate: date })}
              placeholder="Launch date"
              size="xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-between py-2.5 px-4 w-full border-t">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="response-required"
              checked={form.responseRequired}
              onChange={(e) =>
                setForm({ ...form, responseRequired: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="response-required"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Response required
            </label>
          </div>
          <Button onClick={handleSubmit}>Create Move</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AddCompetitiveMoveProps {
  competitorId: string;
}

type FormState = {
  title: string;
  description: string;
  moveType: string;
  impactLevel: Importance;
  announcedDate: Date | null;
  launchDate: Date | null;
  targetAudience: string;
  affectedFeatures: string;
  opportunities: string;
  threats: string;
  responseRequired: boolean;
  responseStrategy: string;
};

type Importance = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
