"use client";

import React from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Calendar,
  Users,
  BarChart3,
  Eye,
  AlertTriangle,
  ExternalLink,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllCompetitors, deleteCompetitor } from "@/actions/idea/competitor";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@workspace/ui/components/confirm-dialog";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Card, CardContent } from "@workspace/ui/components/card";

interface CompetitorsTableProps {
  ideaId: string;
}

const getThreatLevelColor = (threatLevel: string) => {
  switch (threatLevel.toLowerCase()) {
    case "critical":
      return "destructive";
    case "high":
      return "destructive";
    case "medium":
      return "secondary";
    case "low":
      return "outline";
    default:
      return "outline";
  }
};

const getThreatLevelIcon = (threatLevel: string) => {
  switch (threatLevel.toLowerCase()) {
    case "critical":
    case "high":
      return AlertTriangle;
    case "medium":
      return BarChart3;
    case "low":
      return BarChart3;
    default:
      return BarChart3;
  }
};

const formatPercentage = (value: number | null) => {
  if (value === null || value === undefined) return "—";
  return `${value}%`;
};

const formatEmployeeCount = (count: string | null) => {
  if (!count) return "—";
  return count;
};

const getCompanyInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function CompetitorsTable({ ideaId }: CompetitorsTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const {
    data: competitors,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["idea-competitors", ideaId],
    queryFn: () => getAllCompetitors(ideaId),
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes (120,000 ms)
  });

  const deleteCompetitorMutation = useMutation({
    mutationFn: async (id: string) => deleteCompetitor({ id }),
    onSuccess: () => {
      toast.success("Competitor deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["idea-competitors", ideaId] });
    },
    onError: (error) => {
      console.error("Failed to delete competitor:", error);
      toast.error("Failed to delete competitor");
    },
  });

  const handleDelete = async (
    e: React.MouseEvent,
    competitorId: string,
    competitorName: string
  ) => {
    e.stopPropagation();
    const isConfirmed = await confirm({
      title: "Delete Competitor",
      description: `This action cannot be undone. Are you sure you want to delete "${competitorName}"?`,
    });

    if (isConfirmed) {
      await deleteCompetitorMutation.mutateAsync(competitorId);
    }
  };

  if (isLoading) {
    return (
      <>
        {/* Desktop Loading */}
        <div className="hidden md:block border rounded-lg overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px] w-[300px]">
                    Company
                  </TableHead>
                  <TableHead className="min-w-[100px] w-[120px]">
                    Threat Level
                  </TableHead>
                  <TableHead className="min-w-[80px] w-[100px]">
                    Founded
                  </TableHead>
                  <TableHead className="min-w-[90px] w-[100px] hidden lg:table-cell">
                    Market Share
                  </TableHead>
                  <TableHead className="min-w-[120px] w-[140px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3 min-w-0">
                        <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                        <div className="space-y-2 flex-1 min-w-0">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Loading */}
        <div className="md:hidden grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
                    <div className="space-y-2 flex-1 min-w-0">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-16 rounded" />
                    <Skeleton className="h-8 w-12 rounded" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">
            Could not fetch competitor data.
          </p>
        </div>
      </div>
    );
  }

  if (!competitors || competitors.length === 0) {
    return (
      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No competitors found.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Use the AI Discovery feature to find competitors automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <ScrollArea className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[250px] w-[300px]">
                  Company
                </TableHead>
                <TableHead className="min-w-[100px] w-[120px]">
                  Threat Level
                </TableHead>
                <TableHead className="min-w-[80px] w-[100px]">
                  Founded
                </TableHead>
                <TableHead className="min-w-[90px] w-[100px] hidden lg:table-cell">
                  Market Share
                </TableHead>
                <TableHead className="min-w-[120px] w-[140px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitors?.map((competitor) => {
                const ThreatIcon = getThreatLevelIcon(competitor.threatLevel);
                return (
                  <TableRow
                    key={competitor.id}
                    className="group hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => router.push(`/competitor/${competitor.id}`)}
                  >
                    {/* Company Info */}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 rounded-lg ring-1 ring-border/30 flex-shrink-0">
                          <AvatarImage
                            src={competitor.logoUrl || ""}
                            alt={competitor.name}
                            className="object-cover rounded-lg"
                          />
                          <AvatarFallback className="bg-muted border text-muted-foreground font-medium text-xs rounded-lg">
                            {getCompanyInitials(competitor.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-foreground group-hover:text-foreground transition-colors line-clamp-1">
                            {competitor.name}
                          </div>
                          {competitor.description && (
                            <div className="text-sm text-muted-foreground mt-0.5">
                              <span
                                className="block overflow-hidden"
                                style={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {competitor.description}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Threat Level */}
                    <TableCell>
                      <Badge
                        variant={getThreatLevelColor(competitor.threatLevel)}
                        className="gap-1.5 font-medium text-xs whitespace-nowrap"
                      >
                        <ThreatIcon className="h-3 w-3" />
                        {competitor.threatLevel}
                      </Badge>
                    </TableCell>

                    {/* Founded Year */}
                    <TableCell className="text-muted-foreground">
                      {competitor.foundedYear || "—"}
                    </TableCell>

                    {/* Market Share */}
                    <TableCell className="text-muted-foreground hidden lg:table-cell">
                      {formatPercentage(competitor.marketShare)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* Website */}
                        {competitor.website && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(competitor.website!, "_blank");
                            }}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}

                        {/* View */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/competitor/${competitor.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Delete */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                              disabled={deleteCompetitorMutation.isPending}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem
                              onClick={(e) =>
                                handleDelete(e, competitor.id, competitor.name)
                              }
                              className="text-destructive focus:text-destructive"
                              disabled={deleteCompetitorMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Mobile Grid View */}
      <div className="md:hidden grid gap-4">
        {competitors?.map((competitor) => {
          const ThreatIcon = getThreatLevelIcon(competitor.threatLevel);
          return (
            <Card
              key={competitor.id}
              className="group hover:bg-muted/30 cursor-pointer transition-colors border-border/50 hover:border-border"
              onClick={() => router.push(`/competitor/${competitor.id}`)}
            >
              <CardContent className="p-4 space-y-3">
                {/* Header with Company Info and Threat Level */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="h-12 w-12 rounded-lg ring-1 ring-border/30 flex-shrink-0">
                      <AvatarImage
                        src={competitor.logoUrl || ""}
                        alt={competitor.name}
                        className="object-cover rounded-lg"
                      />
                      <AvatarFallback className="bg-muted border text-muted-foreground font-medium text-sm rounded-lg">
                        {getCompanyInitials(competitor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-foreground group-hover:text-foreground transition-colors line-clamp-1">
                        {competitor.name}
                      </div>
                      {competitor.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          <span
                            className="block overflow-hidden"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {competitor.description}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={getThreatLevelColor(competitor.threatLevel)}
                    className="gap-1.5 font-medium text-xs whitespace-nowrap flex-shrink-0"
                  >
                    <ThreatIcon className="h-3 w-3" />
                    {competitor.threatLevel}
                  </Badge>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {competitor.foundedYear && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Founded {competitor.foundedYear}</span>
                    </div>
                  )}
                  {competitor.marketShare && (
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      <span>
                        {formatPercentage(competitor.marketShare)} market share
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    {/* Website Link */}
                    {competitor.website && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(competitor.website!, "_blank");
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Website
                      </Button>
                    )}

                    {/* View Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/competitor/${competitor.id}`);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>

                  {/* Delete Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-muted"
                        onClick={(e) => e.stopPropagation()}
                        disabled={deleteCompetitorMutation.isPending}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem
                        onClick={(e) =>
                          handleDelete(e, competitor.id, competitor.name)
                        }
                        className="text-destructive focus:text-destructive"
                        disabled={deleteCompetitorMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
