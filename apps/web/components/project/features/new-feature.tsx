"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Plus, AlertCircle, Loader2 } from "lucide-react";
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
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { PrioritySelector } from "@/components/ui/selectors/priority-selector";
import { ProjectSelector } from "@/components/ui/selectors/project-selector";
import { PhaseSelector } from "@/components/ui/selectors/phase-selector";
import { FeatureSelector } from "@/components/ui/selectors/feature-selector";
import { useSession } from "@/context/session-context";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import * as featureActions from "@/actions/features";
import { DateInput } from "@workspace/ui/components/date-input";

type NewFeatureProps = {
  projectId?: string;
  parentFeatureId?: string;
};

type FormState = {
  name: string;
  description: string;
  priority: any;
  phase: any;
  projectId: string | null;
  parentFeatureId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  estimatedEffort: number | null;
  businessValue: number | null;
};

type DateValidationError = {
  type:
  | "end_before_start"
  | "start_in_past"
  | "end_in_past"
  | "duration_too_long";
  message: string;
};

export function NewFeature({
  projectId: initialProjectId,
  parentFeatureId: initialParentFeatureId,
}: NewFeatureProps) {
  const { token, org } = useSession();
  const queryClient = useQueryClient();
  // TanStack mutation for creating a feature
  const createFeatureMutation = useMutation({
    mutationFn: async (featureData: any) => {
      return await featureActions.createFeature(featureData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["features"] });
    },
    onError: () => {
      toast.error("Failed to create feature");
    },
  });
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { data: currentFeature, isLoading: loadingFeature } = useQuery({
    queryKey: ["feature", initialParentFeatureId],
    queryFn: () => initialParentFeatureId ? featureActions.getFeatureById(initialParentFeatureId) : null,
    enabled: !!initialParentFeatureId,
  });

  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    priority: "MEDIUM",
    phase: "DISCOVERY",
    projectId: initialProjectId || currentFeature?.projectId || "",
    parentFeatureId: initialParentFeatureId || null,
    startDate: null,
    endDate: null,
    estimatedEffort: null,
    businessValue: null,
  });

  // Date validation logic
  const dateValidation = useMemo((): DateValidationError | null => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!form.startDate && !form.endDate) {
      return null;
    }

    // Check if end date is before start date
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      return {
        type: "end_before_start",
        message: "End date cannot be before start date",
      };
    }

    // Check if start date is in the past (optional warning)
    if (form.startDate && form.startDate < today) {
      return {
        type: "start_in_past",
        message: "Start date is in the past",
      };
    }

    // Check if end date is in the past
    if (form.endDate && form.endDate < today) {
      return {
        type: "end_in_past",
        message: "End date cannot be in the past",
      };
    }

    // Check if duration is unreasonably long (more than 2 years)
    if (form.startDate && form.endDate) {
      const diffTime = Math.abs(
        form.endDate.getTime() - form.startDate.getTime()
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 730) {
        // 2 years
        return {
          type: "duration_too_long",
          message:
            "Feature duration exceeds 2 years. Consider breaking it down.",
        };
      }
    }

    return null;
  }, [form.startDate, form.endDate]);

  const projectDuration = useMemo(() => {
    if (!form.startDate || !form.endDate) return null;

    const diffTime = Math.abs(
      form.endDate.getTime() - form.startDate.getTime()
    );
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day";
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months`;
    return `${Math.ceil(diffDays / 365)} years`;
  }, [form.startDate, form.endDate]);

  // Smart date handling functions
  const handleStartDateChange = (date: Date) => {
    const newForm = { ...form, startDate: date };

    // If end date exists and is before the new start date, adjust it
    if (form.endDate && form.endDate < date) {
      // Set end date to be 1 week after start date as a reasonable default
      const suggestedEndDate = new Date(date);
      suggestedEndDate.setDate(date.getDate() + 7);
      newForm.endDate = suggestedEndDate;
      toast.info("End date adjusted to maintain valid date range");
    }

    setForm(newForm);
  };

  const handleEndDateChange = (date: Date) => {
    const newForm = { ...form, endDate: date };

    // If start date doesn't exist, set it to today or the end date minus 1 week
    if (!form.startDate) {
      const suggestedStartDate = new Date(date);
      suggestedStartDate.setDate(date.getDate() - 7);
      const today = new Date();
      newForm.startDate =
        suggestedStartDate > today ? suggestedStartDate : today;
      toast.info("Start date automatically set based on end date");
    }
    // If start date exists and is after the new end date, adjust it
    else if (form.startDate && form.startDate > date) {
      const suggestedStartDate = new Date(date);
      suggestedStartDate.setDate(date.getDate() - 7);
      newForm.startDate = suggestedStartDate;
      toast.info("Start date adjusted to maintain valid date range");
    }

    setForm(newForm);
  };

  // Utility function to validate form fields
  const validateForm = (form: FormState) => {
    if (!form.projectId) {
      toast.error("Project is required");
      return false;
    }

    const requiredStringFields: (keyof FormState)[] = ["name"];
    for (const key of requiredStringFields) {
      if (typeof form[key] === "string" && !form[key].trim()) {
        toast.error(
          `${key.charAt(0).toUpperCase() + key.slice(1)} is required`
        );
        return false;
      }
    }

    // Validate business value
    if (form.businessValue !== null) {
      if (form.businessValue < 1 || form.businessValue > 10) {
        toast.error("Business value must be between 1 and 10");
        return false;
      }
    }

    // Validate estimated effort (should be positive)
    if (form.estimatedEffort !== null && form.estimatedEffort <= 0) {
      toast.error("Estimated effort must be greater than 0");
      return false;
    }

    // Validate dates
    if (
      dateValidation &&
      (dateValidation.type === "end_before_start" ||
        dateValidation.type === "end_in_past")
    ) {
      toast.error(dateValidation.message);
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
      await createFeatureMutation.mutateAsync({
        name: form.name,
        description: form.description || undefined,
        priority: form.priority,
        projectId: form.projectId,
        parentFeatureId: form.parentFeatureId || undefined,
        phase: form.phase,
        startDate: form.startDate?.toISOString() || undefined,
        endDate: form.endDate?.toISOString() || undefined,
        estimatedEffort: form.estimatedEffort || undefined,
        businessValue: form.businessValue || undefined,
      });

      toast.success("Feature created successfully");
      router.refresh();
    } catch (error) {
      console.error("Error creating feature:", error);
      toast.error("Failed to create feature");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shrink-0" variant={"dark"}>
          <Plus /> {initialParentFeatureId ? "New Sub-Feature" : "New Feature"}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-[750px] shadow-xl">
        <DialogHeader>
          <DialogTitle>
            {initialParentFeatureId ? "New Sub-Feature" : "New Feature"}
          </DialogTitle>
          <DialogDescription>
            {initialParentFeatureId
              ? "Create a sub-feature that will automatically depend on the parent feature"
              : "Create a new feature to track development progress"}
          </DialogDescription>
        </DialogHeader>

        <div className="pb-0 space-y-3 w-full">
          <Input
            placeholder="Feature name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Textarea
            placeholder="Add description..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">
                Estimated Effort (hours)
              </label>
              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={form.estimatedEffort || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setForm({ ...form, estimatedEffort: null });
                  } else {
                    const numValue = parseFloat(value);
                    // Ensure positive value
                    const validValue = numValue > 0 ? numValue : 0.1;
                    setForm({ ...form, estimatedEffort: validValue });
                  }
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Business Value (1-10)
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={form.businessValue || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setForm({ ...form, businessValue: null });
                  } else {
                    const numValue = parseInt(value);
                    // Clamp the value between 1 and 10
                    const clampedValue = Math.max(1, Math.min(10, numValue));
                    setForm({ ...form, businessValue: clampedValue });
                  }
                }}
              />
            </div>
          </div>

          {initialParentFeatureId && (
            <div className="space-y-2">
              <div className="p-2 bg-muted border border-border rounded-md text-sm">
                Creating a sub-feature that will automatically depend on the
                parent feature.
              </div>
            </div>
          )}

          <div className="w-full flex items-center justify-start gap-1.5 flex-wrap">
            <PrioritySelector
              priority={form.priority}
              onChange={(priority: string) =>
                setForm({ ...form, priority: priority as any })
              }
            />
            <PhaseSelector
              phase={form.phase}
              onChange={(phase: string) =>
                setForm({ ...form, phase: phase as any })
              }
            />
            {!initialProjectId && !initialParentFeatureId && (
              <ProjectSelector
                currentProject={form.projectId}
                onChange={(projectId) => setForm({ ...form, projectId })}
              />
            )}
          </div>

          {/* Parent Feature Selection */}
          {form.projectId && !initialParentFeatureId && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Parent Feature (Optional)
              </label>
              <FeatureSelector
                projectId={form.projectId}
                value={form.parentFeatureId || undefined}
                onChange={(parentFeatureId) =>
                  setForm({ ...form, parentFeatureId })
                }
                excludeFeatureIds={[]} // We could exclude the current feature if editing
              />
              {form.parentFeatureId && (
                <p className="text-xs text-muted-foreground">
                  This will create a sub-feature that automatically depends on
                  the selected parent feature.
                </p>
              )}
            </div>
          )}

          {/* Date validation alerts */}
          {dateValidation && (
            <Alert
              variant={
                dateValidation.type === "end_before_start" ||
                  dateValidation.type === "end_in_past"
                  ? "destructive"
                  : "default"
              }
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{dateValidation.message}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex items-center justify-between py-4 w-full border-t">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4">
              <DateInput
                value={form.startDate || undefined}
                placeholder="Start date"
                onChange={handleStartDateChange}
              />
            </div>
            <span className="text-sm text-muted-foreground">to</span>
            <div className="flex items-center gap-4">
              <DateInput
                value={form.endDate || undefined}
                placeholder="End date"
                onChange={handleEndDateChange}
              />
            </div>
            {projectDuration && (
              <div className="text-sm text-muted-foreground">
                ({projectDuration})
              </div>
            )}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={
              dateValidation?.type === "end_before_start" ||
              dateValidation?.type === "end_in_past" ||
              loadingFeature
            }
          >
            {loadingFeature ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Create Feature"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
