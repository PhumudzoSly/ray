"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCompetitorSwots,
  createCompetitorSwot,
  deleteCompetitorSwot,
} from "@/actions/idea/competitor";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Label } from "@workspace/ui/components/label";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Target,
  TrendingUp,
  Shield,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CompetitorSwotViewProps {
  competitorId: string;
}

type SwotType = "Strength" | "Weakness" | "Opportunity" | "Threat";
type Importance = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface SwotEntry {
  id: string;
  type: SwotType;
  swotAnalysis: string;
  impact: Importance;
  competitorId: string;
  createdAt: Date;
  updatedAt: Date;
}

const swotTypeConfig = {
  Strength: {
    label: "Strength",
    icon: Shield,
    color: "bg-green-50 text-green-700 border-green-200",
  },
  Weakness: {
    label: "Weakness",
    icon: AlertTriangle,
    color: "bg-red-50 text-red-700 border-red-200",
  },
  Opportunity: {
    label: "Opportunity",
    icon: TrendingUp,
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  Threat: {
    label: "Threat",
    icon: Target,
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
};

const impactColors = {
  LOW: "bg-gray-50 text-gray-600 border-gray-200",
  MEDIUM: "bg-yellow-50 text-yellow-700 border-yellow-200",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  CRITICAL: "bg-red-50 text-red-700 border-red-200",
};

export const CompetitorSwotView: React.FC<CompetitorSwotViewProps> = ({
  competitorId,
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<SwotEntry | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [counterAction, setCounterAction] = useState<string>("");
  const [isGeneratingCounter, setIsGeneratingCounter] = useState(false);
  const [newEntry, setNewEntry] = useState<{
    type: SwotType;
    swotAnalysis: string;
    impact: Importance;
  }>({
    type: "Strength",
    swotAnalysis: "",
    impact: "MEDIUM",
  });

  const queryClient = useQueryClient();

  const { data: swotEntries = [], isLoading } = useQuery({
    queryKey: ["competitorSwots", competitorId],
    queryFn: () => getCompetitorSwots(competitorId),
  });

  const createMutation = useMutation({
    mutationFn: createCompetitorSwot,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["competitorSwots", competitorId],
      });
      setIsCreateDialogOpen(false);
      setNewEntry({ type: "Strength", swotAnalysis: "", impact: "MEDIUM" });
      toast.success("SWOT entry created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create SWOT entry");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCompetitorSwot,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["competitorSwots", competitorId],
      });
      toast.success("SWOT entry deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete SWOT entry");
      console.error(error);
    },
  });

  const handleCreate = () => {
    if (!newEntry.swotAnalysis.trim()) {
      toast.error("Please enter SWOT analysis");
      return;
    }

    createMutation.mutate({
      swot: {
        competitorId,
        type: newEntry.type,
        swotAnalysis: newEntry.swotAnalysis,
        impact: newEntry.impact,
      },
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this SWOT entry?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleRowClick = (entry: SwotEntry) => {
    setSelectedEntry(entry);
    setCounterAction("");
    setIsSheetOpen(true);
  };

  const generateCounterAction = async () => {
    if (!selectedEntry) return;

    setIsGeneratingCounter(true);
    try {
      // Simulate AI generation - replace with actual AI call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockCounterActions = {
        Strength: `Counter-Strategy: Focus on differentiation by highlighting unique value propositions that this competitor cannot easily replicate. Consider strategic partnerships or acquisitions to neutralize this advantage.`,
        Weakness: `Opportunity: Capitalize on this weakness by positioning our strengths directly against their limitations. Develop targeted marketing campaigns that highlight our superior capabilities in this area.`,
        Opportunity: `Defensive Action: Monitor this opportunity closely and consider entering the same market space or developing competing solutions. Establish barriers to entry or strategic partnerships to limit their access.`,
        Threat: `Mitigation Strategy: Develop contingency plans and strengthen our position in areas where this threat could impact us. Consider preemptive moves to reduce the threat's potential impact on our market position.`,
      };

      setCounterAction(
        mockCounterActions[selectedEntry.type] || "No counter-action generated."
      );
    } catch (error) {
      toast.error("Failed to generate counter-action");
    } finally {
      setIsGeneratingCounter(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">SWOT Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Analyze competitor strengths, weaknesses, opportunities, and threats
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New SWOT Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newEntry.type}
                  onValueChange={(value: SwotType) =>
                    setNewEntry({ ...newEntry, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(swotTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="impact">Impact Level</Label>
                <Select
                  value={newEntry.impact}
                  onValueChange={(value: Importance) =>
                    setNewEntry({ ...newEntry, impact: value })
                  }
                >
                  <SelectTrigger>
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
              <div>
                <Label htmlFor="analysis">Analysis</Label>
                <Textarea
                  id="analysis"
                  placeholder="Enter SWOT analysis details..."
                  value={newEntry.swotAnalysis}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, swotAnalysis: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {swotEntries.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No SWOT analysis entries yet</p>
            <p className="text-sm">
              Add your first entry to start analyzing the competitor
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead>Analysis</TableHead>
                <TableHead className="w-[100px]">Impact</TableHead>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {swotEntries.map((entry) => {
                const config = swotTypeConfig[entry.type as SwotType];
                if (!config) {
                  console.warn(`Unknown SWOT type: ${entry.type}`);
                  return null;
                }
                const Icon = config.icon;

                return (
                  <TableRow
                    key={entry.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      handleRowClick({
                        ...entry,
                        competitorId: entry.competitorId || "",
                      })
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <Badge
                          variant="outline"
                          className={cn("text-xs", config.color)}
                        >
                          {config.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[400px]">
                      <p className="truncate">{entry.swotAnalysis}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", impactColors[entry.impact])}
                      >
                        {entry.impact}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(entry.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px]">
          {selectedEntry &&
            (() => {
              const config = swotTypeConfig[selectedEntry.type as SwotType];
              if (!config) return null;

              return (
                <>
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      {React.createElement(config.icon, {
                        className: "h-5 w-5",
                      })}
                      {config.label} Analysis
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-6 space-y-6">
                    <div>
                      <Label className="text-sm font-medium">Type</Label>
                      <div className="mt-1">
                        <Badge
                          variant="outline"
                          className={cn("text-sm", config.color)}
                        >
                          {config.label}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Impact Level
                      </Label>
                      <div className="mt-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-sm",
                            impactColors[selectedEntry.impact]
                          )}
                        >
                          {selectedEntry.impact}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Analysis</Label>
                      <div className="mt-2 p-3 bg-muted rounded-lg">
                        <p className="text-sm leading-relaxed">
                          {selectedEntry.swotAnalysis}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(selectedEntry.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>

                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <Label className="text-sm font-medium">
                          AI Counter-Action
                        </Label>
                        <Button
                          size="sm"
                          onClick={generateCounterAction}
                          disabled={isGeneratingCounter}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          {isGeneratingCounter ? "Generating..." : "Generate"}
                        </Button>
                      </div>

                      {counterAction ? (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm leading-relaxed text-blue-900">
                            {counterAction}
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground italic">
                            Click "Generate" to create an AI-powered
                            counter-action strategy
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
        </SheetContent>
      </Sheet>
    </div>
  );
};
