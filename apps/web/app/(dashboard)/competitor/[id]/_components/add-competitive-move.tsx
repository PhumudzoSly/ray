"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCompetitiveMove } from "@/actions/idea/competitor";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DateInput } from "@workspace/ui/components/date-input";
import { Separator } from "@workspace/ui/components/separator";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function AddCompetitiveMove({ competitorId }: AddCompetitiveMoveProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newMove, setNewMove] = useState<NewMoveState>({
    moveType: "",
    title: "",
    description: "",
    impactLevel: "MEDIUM",
    targetAudience: "",
    affectedFeatures: [],
    announcedDate: null,
    launchDate: null,
    completionDate: null,
    userFeedback: "",
    pressCoverage: [],
    opportunities: [],
    threats: [],
    responseRequired: false,
    responseStrategy: "",
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createCompetitiveMove,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["competitiveMoves", competitorId],
      });
      setIsOpen(false);
      resetNewMove();
      toast.success("Competitive move created successfully");
    },
    onError: () => {
      toast.error("Failed to create competitive move");
    },
  });

  function resetNewMove() {
    setNewMove({
      moveType: "",
      title: "",
      description: "",
      impactLevel: "MEDIUM",
      targetAudience: "",
      affectedFeatures: [],
      announcedDate: null,
      launchDate: null,
      completionDate: null,
      userFeedback: "",
      pressCoverage: [],
      opportunities: [],
      threats: [],
      responseRequired: false,
      responseStrategy: "",
    });
  }

  function handleCreate() {
    if (!newMove.title.trim() || !newMove.moveType.trim()) {
      toast.error("Please provide title and move type");
      return;
    }

    const moveData: any = {
      competitorId,
      moveType: newMove.moveType,
      title: newMove.title,
      description: newMove.description,
      impactLevel: newMove.impactLevel,
      targetAudience: newMove.targetAudience || null,
      affectedFeatures: newMove.affectedFeatures,
      userFeedback: newMove.userFeedback || null,
      pressCoverage: newMove.pressCoverage,
      opportunities: newMove.opportunities,
      threats: newMove.threats,
      responseRequired: newMove.responseRequired,
      responseStrategy: newMove.responseStrategy || null,
    };

    if (newMove.announcedDate) moveData.announcedDate = newMove.announcedDate;
    if (newMove.launchDate) moveData.launchDate = newMove.launchDate;
    if (newMove.completionDate)
      moveData.completionDate = newMove.completionDate;

    createMutation.mutate({ move: moveData });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Move
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            Add New Competitive Move
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="moveType"
                      className="text-sm font-medium text-foreground"
                    >
                      Move Type
                    </Label>
                    <Select
                      value={newMove.moveType}
                      onValueChange={(value) =>
                        setNewMove({ ...newMove, moveType: value })
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select move type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(moveTypeConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="impactLevel"
                      className="text-sm font-medium text-foreground"
                    >
                      Impact Level
                    </Label>
                    <Select
                      value={newMove.impactLevel}
                      onValueChange={(value: Importance) =>
                        setNewMove({ ...newMove, impactLevel: value })
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium text-foreground"
                  >
                    Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter move title"
                    value={newMove.title}
                    onChange={(e) =>
                      setNewMove({ ...newMove, title: e.target.value })
                    }
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 mt-6">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-foreground"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the competitive move in detail"
                    value={newMove.description}
                    onChange={(e) =>
                      setNewMove({ ...newMove, description: e.target.value })
                    }
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Market & Audience */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-4">
                  Market & Audience
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="targetAudience"
                      className="text-sm font-medium text-foreground"
                    >
                      Target Audience
                    </Label>
                    <Input
                      id="targetAudience"
                      placeholder="Who is this move targeting"
                      value={newMove.targetAudience}
                      onChange={(e) =>
                        setNewMove({
                          ...newMove,
                          targetAudience: e.target.value,
                        })
                      }
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="userFeedback"
                      className="text-sm font-medium text-foreground"
                    >
                      User Feedback
                    </Label>
                    <Textarea
                      id="userFeedback"
                      placeholder="User reactions and feedback"
                      value={newMove.userFeedback}
                      onChange={(e) =>
                        setNewMove({ ...newMove, userFeedback: e.target.value })
                      }
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Timeline */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-4">
                  Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      Announced Date
                    </Label>
                    <DateInput
                      value={newMove.announcedDate || new Date()}
                      onChange={(date) =>
                        setNewMove({ ...newMove, announcedDate: date })
                      }
                      placeholder="Select announcement date"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      Launch Date
                    </Label>
                    <DateInput
                      value={newMove.launchDate || new Date()}
                      onChange={(date) =>
                        setNewMove({ ...newMove, launchDate: date })
                      }
                      placeholder="Select launch date"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      Completion Date
                    </Label>
                    <DateInput
                      value={newMove.completionDate || new Date()}
                      onChange={(date) =>
                        setNewMove({ ...newMove, completionDate: date })
                      }
                      placeholder="Select completion date"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Response Strategy */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-4">
                  Response Strategy
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="responseRequired"
                      checked={newMove.responseRequired}
                      onCheckedChange={(checked) =>
                        setNewMove({ ...newMove, responseRequired: !!checked })
                      }
                    />
                    <Label
                      htmlFor="responseRequired"
                      className="text-sm font-medium cursor-pointer text-foreground"
                    >
                      Response Required
                    </Label>
                  </div>

                  {newMove.responseRequired && (
                    <div className="space-y-2 ml-7">
                      <Label
                        htmlFor="responseStrategy"
                        className="text-sm font-medium text-foreground"
                      >
                        Response Strategy
                      </Label>
                      <Textarea
                        id="responseStrategy"
                        placeholder="Describe your strategic response to this competitive move"
                        value={newMove.responseStrategy}
                        onChange={(e) =>
                          setNewMove({
                            ...newMove,
                            responseStrategy: e.target.value,
                          })
                        }
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/20">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="h-11 px-8"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="h-11 px-8"
          >
            {createMutation.isPending ? "Creating..." : "Create Move"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Types and UI config
interface AddCompetitiveMoveProps {
  competitorId: string;
}

interface NewMoveState {
  moveType: string;
  title: string;
  description: string;
  impactLevel: Importance;
  targetAudience: string;
  affectedFeatures: string[];
  announcedDate: Date | null;
  launchDate: Date | null;
  completionDate: Date | null;
  userFeedback: string;
  pressCoverage: string[];
  opportunities: string[];
  threats: string[];
  responseRequired: boolean;
  responseStrategy: string;
}

type Importance = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const moveTypeConfig = {
  "Product Launch": { label: "Product Launch" },
  "Feature Update": { label: "Feature Update" },
  "Pricing Change": { label: "Pricing Change" },
  "Market Expansion": { label: "Market Expansion" },
  Partnership: { label: "Partnership" },
  Acquisition: { label: "Acquisition" },
  Other: { label: "Other" },
} as const;
