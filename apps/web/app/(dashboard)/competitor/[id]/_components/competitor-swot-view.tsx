"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCompetitorSwots,
  deleteCompetitorSwot,
} from "@/actions/idea/competitor";
import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
// removed unused Textarea, Select, Dialog imports after extraction
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
// removed unused Label import
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { toast } from "sonner";
import {
  // Plus removed, Sparkles removed
  Trash2,
  Target,
  TrendingUp,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CollaborativeEditor } from "@/components/collaborative-editor";
import { AddCompetitorSwot } from "./add-competitor-swot";

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
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10 dark:bg-green-400/10",
  },
  Weakness: {
    label: "Weakness",
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10 dark:bg-red-400/10",
  },
  Opportunity: {
    label: "Opportunity",
    icon: TrendingUp,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10 dark:bg-blue-400/10",
  },
  Threat: {
    label: "Threat",
    icon: Target,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/10 dark:bg-orange-400/10",
  },
};

const impactConfig = {
  LOW: {
    label: "Low",
    color: "text-muted-foreground",
    bgColor: "bg-muted-foreground/10",
  },
  MEDIUM: {
    label: "Medium",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-500/10 dark:bg-yellow-400/10",
  },
  HIGH: {
    label: "High",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/10 dark:bg-orange-400/10",
  },
  CRITICAL: {
    label: "Critical",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10 dark:bg-red-400/10",
  },
};

export const CompetitorSwotView: React.FC<CompetitorSwotViewProps> = ({
  competitorId,
}) => {
  // removed isCreateDialogOpen
  const [selectedEntry, setSelectedEntry] = useState<SwotEntry | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // counterAction generation removed; no UI currently triggers it

  const queryClient = useQueryClient();

  const { data: swotEntries = [], isLoading } = useQuery({
    queryKey: ["competitorSwots", competitorId],
    queryFn: () => getCompetitorSwots(competitorId),
  });

  // removed createMutation

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

  // removed handleCreate

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this SWOT entry?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleRowClick = (entry: SwotEntry) => {
    setSelectedEntry(entry);
    setIsSheetOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-medium">SWOT Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Analyze competitor strengths, weaknesses, opportunities, and threats
          </p>
        </div>
        {/* Replaced inline dialog with extracted component */}
        <AddCompetitorSwot competitorId={competitorId} />
      </div>

      {swotEntries.length === 0 ? (
        <div className="text-center py-20">
          <div className="space-y-3">
            <Target className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                No SWOT analysis entries yet
              </p>
              <p className="text-sm text-muted-foreground">
                Add your first entry to start analyzing the competitor
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border/40">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[140px]">Type</TableHead>
                <TableHead>Analysis</TableHead>
                <TableHead className="w-[100px]">Impact</TableHead>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {swotEntries.map((entry) => {
                const config = swotTypeConfig[entry.type as SwotType];
                const impactInfo = impactConfig[entry.impact];
                if (!config) {
                  console.warn(`Unknown SWOT type: ${entry.type}`);
                  return null;
                }
                const Icon = config.icon;

                return (
                  <TableRow
                    key={entry.id}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() =>
                      handleRowClick({
                        ...entry,
                        competitorId: entry.competitorId || "",
                      })
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-3.5 w-3.5", config.color)} />
                        <span
                          className={cn(
                            "text-sm font-medium px-2 py-1 rounded-md",
                            config.bgColor
                          )}
                        >
                          {config.label}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[400px]">
                      <p className="truncate text-sm">{entry.swotAnalysis}</p>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-1 rounded-md",
                          impactInfo.bgColor
                        )}
                      >
                        {impactInfo.label}
                      </span>
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
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
        <SheetContent className="w-full md:w-[600px sm:max-w-[600px] p-0">
          {selectedEntry &&
            (() => {
              const config = swotTypeConfig[selectedEntry.type as SwotType];
              const impactInfo = impactConfig[selectedEntry.impact];
              if (!config) return null;

              return (
                <>
                  <SheetHeader className="p-4">
                    <SheetTitle className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-md", config.bgColor)}>
                        {React.createElement(config.icon, {
                          className: cn("h-5 w-5", config.color),
                        })}
                      </div>
                      {config.label} Analysis
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-8 space-y-8">
                    <div className="space-y-6 px-6">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                          Type & Impact
                        </p>
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "text-sm font-medium px-3 py-1.5 rounded-md",
                              config.bgColor
                            )}
                          >
                            {config.label}
                          </span>
                          <span
                            className={cn(
                              "text-sm font-medium px-3 py-1.5 rounded-md",
                              impactInfo.bgColor
                            )}
                          >
                            {impactInfo.label} Impact
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                          Analysis
                        </p>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-sm leading-relaxed">
                            {selectedEntry.swotAnalysis}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border/40">
                      <CollaborativeEditor
                        entityId={selectedEntry.id}
                        entityType="competitorSwot"
                      />
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
