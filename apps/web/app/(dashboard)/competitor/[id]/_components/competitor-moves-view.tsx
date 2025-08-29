"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCompetitiveMoves,
  deleteCompetitiveMove,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Badge } from "@workspace/ui/components/badge";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { toast } from "sonner";
import {
  Trash2,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  MoreHorizontal,
} from "lucide-react";

import { format } from "date-fns";
import { AddCompetitiveMove } from "./add-competitive-move";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Separator } from "@workspace/ui/components/separator";
import { CollaborativeEditor } from "@/components/collaborative-editor";

function getStatusIcon(
  move: Pick<CompetitiveMove, "announcedDate" | "launchDate" | "completionDate">
) {
  if (move.completionDate)
    return (
      <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
    );
  if (move.launchDate)
    return <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />;
  if (move.announcedDate)
    return <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />;
  return <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />;
}

function getStatusText(
  move: Pick<CompetitiveMove, "announcedDate" | "launchDate" | "completionDate">
) {
  if (move.completionDate) return "Completed";
  if (move.launchDate) return "Launching";
  if (move.announcedDate) return "Announced";
  return "Planned";
}

interface CompetitorMovesViewProps {
  competitorId: string;
}

type Importance = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface CompetitiveMove {
  id: string;
  competitorId: string | null;
  moveType: string;
  title: string;
  description: string;
  impactLevel: Importance;
  targetAudience?: string | null;
  affectedFeatures: string[];
  announcedDate?: Date | null;
  launchDate?: Date | null;
  completionDate?: Date | null;
  userFeedback?: string | null;
  pressCoverage: string[];
  opportunities: string[];
  threats: string[];
  responseRequired: boolean;
  responseStrategy?: string | null;
  createdAt: Date;
}

// Variant mapping functions
function getMoveTypeVariant(moveType: string): "default" | "secondary" | "destructive" | "outline" {
  switch (moveType) {
    case "Acquisition":
      return "destructive";
    default:
      return "secondary";
  }
}

function getImpactVariant(impactLevel: Importance): "default" | "secondary" | "destructive" | "outline" {
  switch (impactLevel) {
    case "LOW":
      return "default";
    case "MEDIUM":
      return "secondary";
    case "HIGH":
      return "outline";
    case "CRITICAL":
      return "destructive";
    default:
      return "default";
  }
}

function getImpactLabel(impactLevel: Importance): string {
  switch (impactLevel) {
    case "LOW":
      return "Low";
    case "MEDIUM":
      return "Medium";
    case "HIGH":
      return "High";
    case "CRITICAL":
      return "Critical";
    default:
      return "Low";
  }
}

export const CompetitorMovesView: React.FC<CompetitorMovesViewProps> = ({
  competitorId,
}) => {
  const [selectedMove, setSelectedMove] = useState<CompetitiveMove | null>(
    null
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: competitiveMoves, isLoading } = useQuery({
    queryKey: ["competitiveMoves", competitorId],
    queryFn: () => getCompetitiveMoves(competitorId),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCompetitiveMove,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["competitiveMoves", competitorId],
      });
      toast.success("Competitive move deleted successfully");
      setIsSheetOpen(false);
    },
    onError: () => {
      toast.error("Failed to delete competitive move");
    },
  });

  const handleViewDetails = (move: CompetitiveMove) => {
    setSelectedMove(move);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this competitive move?")) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-medium">Competitive Moves</h2>
            <p className="text-sm text-muted-foreground">
              Track competitor activities, product launches, and strategic moves
            </p>
          </div>
          <AddCompetitiveMove competitorId={competitorId} />
        </div>

        {!competitiveMoves || competitiveMoves.length === 0 ? (
          <div className="text-center py-20">
            <div className="space-y-3">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/40" />
              <div className="space-y-1">
                <p className="text-sm font-medium">No competitive moves yet</p>
                <p className="text-sm text-muted-foreground">
                  Track competitor activities, product launches, and strategic
                  moves
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Move</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitiveMoves.map((move) => {
                  const statusText = getStatusText({
                    announcedDate: move.announcedDate,
                    launchDate: move.launchDate,
                    completionDate: move.completionDate,
                  });
                  const statusIcon = getStatusIcon({
                    announcedDate: move.announcedDate,
                    launchDate: move.launchDate,
                    completionDate: move.completionDate,
                  });

                  return (
                    <TableRow key={move.id} className="group">
                      <TableCell>
                        {move.responseRequired && (
                          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {move.title}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {move.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getMoveTypeVariant(move.moveType)}
                          className="text-xs"
                        >
                          {move.moveType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getImpactVariant(move.impactLevel)}
                          className="text-xs"
                        >
                          {getImpactLabel(move.impactLevel)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {statusIcon}
                          <span className="text-sm">{statusText}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {move.completionDate
                            ? format(new Date(move.completionDate), "MMM dd")
                            : move.launchDate
                              ? format(new Date(move.launchDate), "MMM dd")
                              : move.announcedDate
                                ? format(new Date(move.announcedDate), "MMM dd")
                                : "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(move)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(move.id)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full md:w-[600px sm:max-w-[600px]">
          {selectedMove && (
            <>
              <SheetHeader>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon({
                      announcedDate: selectedMove.announcedDate,
                      launchDate: selectedMove.launchDate,
                      completionDate: selectedMove.completionDate,
                    })}
                    <SheetTitle className="text-lg">
                      {selectedMove.title}
                    </SheetTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getMoveTypeVariant(selectedMove.moveType)}
                      className="text-xs"
                    >
                      {selectedMove.moveType}
                    </Badge>
                    <Badge
                      variant={getImpactVariant(selectedMove.impactLevel)}
                      className="text-xs"
                    >
                      {getImpactLabel(selectedMove.impactLevel)} Impact
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getStatusText({
                        announcedDate: selectedMove.announcedDate,
                        launchDate: selectedMove.launchDate,
                        completionDate: selectedMove.completionDate,
                      })}
                    </Badge>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedMove.description}
                  </p>
                </div>

                {/* Timeline */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    {selectedMove.announcedDate && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Announced{" "}
                          {format(
                            new Date(selectedMove.announcedDate),
                            "MMM dd, yyyy"
                          )}
                        </span>
                      </div>
                    )}
                    {selectedMove.launchDate && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          Launches{" "}
                          {format(
                            new Date(selectedMove.launchDate),
                            "MMM dd, yyyy"
                          )}
                        </span>
                      </div>
                    )}
                    {selectedMove.completionDate && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="h-4 w-4" />
                        <span>
                          Completed{" "}
                          {format(
                            new Date(selectedMove.completionDate),
                            "MMM dd, yyyy"
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Target Audience */}
                {selectedMove.targetAudience && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Target Audience</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedMove.targetAudience}
                    </p>
                  </div>
                )}

                {/* Affected Features */}
                {selectedMove.affectedFeatures.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Affected Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedMove.affectedFeatures.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Feedback */}
                {selectedMove.userFeedback && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">User Feedback</h4>
                    <blockquote className="text-sm text-muted-foreground italic border-l-2 border-muted pl-4">
                      "{selectedMove.userFeedback}"
                    </blockquote>
                  </div>
                )}

                {/* Press Coverage */}
                {selectedMove.pressCoverage.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Press Coverage</h4>
                    <div className="space-y-1">
                      {selectedMove.pressCoverage.map((coverage, index) => (
                        <a
                          key={index}
                          href={coverage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline block"
                        >
                          {coverage}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Opportunities & Threats */}
                {(selectedMove.opportunities.length > 0 ||
                  selectedMove.threats.length > 0) && (
                  <div className="grid grid-cols-1 gap-6">
                    {selectedMove.opportunities.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-green-600 dark:text-green-400">
                          Opportunities
                        </h4>
                        <ul className="text-sm space-y-1">
                          {selectedMove.opportunities.map(
                            (opportunity, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="text-green-600 dark:text-green-400 mt-1.5 text-xs">
                                  •
                                </span>
                                <span className="text-muted-foreground">
                                  {opportunity}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                    {selectedMove.threats.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-red-600 dark:text-red-400">
                          Threats
                        </h4>
                        <ul className="text-sm space-y-1">
                          {selectedMove.threats.map((threat, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-red-600 dark:text-red-400 mt-1.5 text-xs">
                                •
                              </span>
                              <span className="text-muted-foreground">
                                {threat}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Response Required */}
                {selectedMove.responseRequired && (
                  <div className="p-4 bg-yellow-500/10 dark:bg-yellow-400/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-sm font-medium">
                        Response Required
                      </span>
                    </div>
                    {selectedMove.responseStrategy && (
                      <p className="text-sm text-muted-foreground">
                        {selectedMove.responseStrategy}
                      </p>
                    )}
                  </div>
                )}

                <Separator />
                <CollaborativeEditor
                  entityId={selectedMove.id}
                  entityType="competitiveMove"
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
