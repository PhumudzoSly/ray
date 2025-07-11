"use client";

import { useState } from "react";
import { BaseFlowNode } from "./BaseFlowNode";
import {
  OnboardingNodeData,
  SpecializedNodeProps,
  HandleConfig,
} from "./types";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Card } from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import {
  UserPlus,
  CheckCircle,
  Circle,
  ArrowRight,
  SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function OnboardingNode(
  props: SpecializedNodeProps<OnboardingNodeData>
) {
  const { data, selected, onDataChange, isReadOnly } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  // Custom handles for onboarding node
  const onboardingHandles: HandleConfig[] = [
    {
      id: "user-input",
      type: "target",
      position: "top",
      label: "New User",
      className: "!bg-blue-500",
    },
    {
      id: "completed-output",
      type: "source",
      position: "right",
      label: "Completed",
      className: "!bg-green-500",
    },
    {
      id: "skipped-output",
      type: "source",
      position: "bottom",
      label: "Skipped",
      className: "!bg-yellow-500",
    },
    {
      id: "step-output",
      type: "source",
      position: "left",
      label: "Step Change",
      className: "!bg-purple-500",
    },
  ];

  const addStep = () => {
    const newStep = {
      id: `step-${Date.now()}`,
      title: "New Step",
      description: "Step description",
      required: false,
      completed: false,
    };
    onDataChange?.({ steps: [...data.steps, newStep] });
  };

  const removeStep = (index: number) => {
    const newSteps = data.steps.filter((_, i) => i !== index);
    onDataChange?.({ steps: newSteps });
  };

  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...data.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    onDataChange?.({ steps: newSteps });
  };

  const handleCompletionActionChange = (field: string, value: any) => {
    onDataChange?.({
      completionActions: {
        ...data.completionActions,
        [field]: value,
      },
    });
  };

  const getCompletionPercentage = () => {
    if (data.steps.length === 0) return 0;
    const completedSteps = data.steps.filter((step) => step.completed).length;
    return Math.round((completedSteps / data.steps.length) * 100);
  };

  const getCurrentStepInfo = () => {
    const currentStep = data.steps[data.currentStep || 0];
    return currentStep || data.steps[0];
  };

  const getRequiredStepsCount = () => {
    return data.steps.filter((step) => step.required).length;
  };

  return (
    <BaseFlowNode
      {...props}
      handles={onboardingHandles}
      nodeIcon="UserPlus"
      nodeColor="bg-green-500"
      className="min-w-[340px] max-w-[480px]"
      showDefaultHandles={false}
    >
      <div className="space-y-3">
        {/* Onboarding Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Onboarding Flow</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {data.steps.length} steps
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{getCompletionPercentage()}%</span>
            </div>
            <Progress value={getCompletionPercentage()} className="h-2" />
          </div>
        </div>

        {/* Current Step */}
        {getCurrentStepInfo() && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Current Step</Label>
              <Badge variant="outline" className="text-xs">
                {(data.currentStep || 0) + 1} of {data.steps.length}
              </Badge>
            </div>

            <Card className="p-2 space-y-1">
              <div className="flex items-center gap-2">
                {getCurrentStepInfo().completed ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  {getCurrentStepInfo().title}
                </span>
                {getCurrentStepInfo().required && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                {getCurrentStepInfo().description}
              </p>
            </Card>
          </div>
        )}

        {/* Onboarding Settings */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SkipForward className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs">Skip Enabled</Label>
            </div>
            {!isReadOnly ? (
              <Switch
                checked={data.skipEnabled || false}
                onCheckedChange={(checked) =>
                  onDataChange?.({ skipEnabled: checked })
                }
              />
            ) : (
              <Badge
                variant={data.skipEnabled ? "default" : "secondary"}
                className="text-xs"
              >
                {data.skipEnabled ? "Yes" : "No"}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs">Track Progress</Label>
            </div>
            {!isReadOnly ? (
              <Switch
                checked={data.progressTracking || false}
                onCheckedChange={(checked) =>
                  onDataChange?.({ progressTracking: checked })
                }
              />
            ) : (
              <Badge
                variant={data.progressTracking ? "default" : "secondary"}
                className="text-xs"
              >
                {data.progressTracking ? "On" : "Off"}
              </Badge>
            )}
          </div>
        </div>

        {/* Steps Management */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Onboarding Steps</Label>
            {!isReadOnly && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs px-2"
                onClick={addStep}
              >
                Add Step
              </Button>
            )}
          </div>

          <div className="space-y-1 max-h-32 overflow-y-auto">
            {data.steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center gap-2 p-2 border rounded text-xs"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {step.completed ? (
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="font-medium truncate">{step.title}</span>
                  {step.required && (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>

                {!isReadOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                    onClick={() => removeStep(index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Configuration */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs p-0 font-medium"
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={isReadOnly}
          >
            Advanced Config {isExpanded ? "▼" : "▶"}
          </Button>

          {isExpanded && (
            <Card className="p-3 space-y-3">
              {/* Step Details */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  Step Configuration
                </Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {data.steps.map((step, index) => (
                    <Card key={step.id} className="p-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">
                          Step {index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          {!isReadOnly && (
                            <>
                              <Switch
                                checked={step.required}
                                onCheckedChange={(checked) =>
                                  updateStep(index, "required", checked)
                                }
                              />
                              <Label className="text-xs">Required</Label>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Title</Label>
                        {!isReadOnly ? (
                          <Input
                            value={step.title}
                            onChange={(e) =>
                              updateStep(index, "title", e.target.value)
                            }
                            className="h-6 text-xs"
                          />
                        ) : (
                          <div className="text-xs bg-muted p-1 rounded">
                            {step.title}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        {!isReadOnly ? (
                          <Input
                            value={step.description}
                            onChange={(e) =>
                              updateStep(index, "description", e.target.value)
                            }
                            className="h-6 text-xs"
                          />
                        ) : (
                          <div className="text-xs bg-muted p-1 rounded">
                            {step.description}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Completion Actions */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  Completion Actions
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs w-16">Redirect:</Label>
                    {!isReadOnly ? (
                      <Input
                        value={data.completionActions?.redirect || ""}
                        onChange={(e) =>
                          handleCompletionActionChange(
                            "redirect",
                            e.target.value
                          )
                        }
                        className="flex-1 h-6 text-xs"
                        placeholder="/dashboard"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {data.completionActions?.redirect || "/dashboard"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-xs w-16">Webhook:</Label>
                    {!isReadOnly ? (
                      <Input
                        value={data.completionActions?.webhook || ""}
                        onChange={(e) =>
                          handleCompletionActionChange(
                            "webhook",
                            e.target.value
                          )
                        }
                        className="flex-1 h-6 text-xs"
                        placeholder="/api/onboarding/complete"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {data.completionActions?.webhook || "None"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Send Email</Label>
                    {!isReadOnly ? (
                      <Switch
                        checked={data.completionActions?.email || false}
                        onCheckedChange={(checked) =>
                          handleCompletionActionChange("email", checked)
                        }
                      />
                    ) : (
                      <Badge
                        variant={
                          data.completionActions?.email
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {data.completionActions?.email ? "Yes" : "No"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Onboarding Summary */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className="text-xs bg-green-50 text-green-700"
            >
              {getRequiredStepsCount()} required
            </Badge>
            {data.skipEnabled && (
              <Badge
                variant="outline"
                className="text-xs bg-yellow-50 text-yellow-700"
              >
                Skippable
              </Badge>
            )}
            {data.progressTracking && (
              <Badge
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700"
              >
                Tracked
              </Badge>
            )}
          </div>

          {/* Completion Status */}
          <div className="flex items-center gap-1">
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {getCompletionPercentage()}% complete
            </span>
          </div>
        </div>
      </div>
    </BaseFlowNode>
  );
}
