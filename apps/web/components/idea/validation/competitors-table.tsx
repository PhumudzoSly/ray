"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { useGetCompetitorValidation } from "@/lib/queries/idea";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { CompetitorDetailsSheet } from "./competitor-details-sheet";
import {
  Building2,
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  AlertTriangle,
  MapPin,
  Eye,
} from "lucide-react";

interface CompetitorsTableProps {
  ideaId: string;
}

interface Competitor {
  id: string;
  name: string;
  website?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  marketShare?: number | null;
  annualRevenue?: number | null;
  employeeCount?: string | null;
  foundedYear?: number | null;
  headquarters?: string | null;
  targetAudience?: string | null;
  threatLevel: string;
  userGrowthRate?: number | null;
  churnRate?: number | null;
  customerSatisfaction?: number | null;
  marketCap?: number | null;
  lastUpdated: Date;
  createdAt: Date;
  isActive: boolean;
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

const formatCurrency = (amount: number | null) => {
  if (!amount) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
  }).format(amount);
};

const formatPercentage = (value: number | null) => {
  if (value === null) return "N/A";
  return `${value}%`;
};

const formatEmployeeCount = (count: string | null) => {
  if (!count) return "N/A";
  const num = parseInt(count.replace(/,/g, ""), 10);
  if (isNaN(num)) return count;
  return num.toLocaleString();
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
  const { data: idea, isLoading, isError } = useGetCompetitorValidation(ideaId);
  const [selectedCompetitor, setSelectedCompetitor] =
    useState<Competitor | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Competitors</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !idea) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Could not fetch competitor data.
          </p>
        </CardContent>
      </Card>
    );
  }

  const competitors = idea.Competitor;

  if (!competitors || competitors.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No competitors found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Competitors ({competitors.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="w-[300px]">Company</TableHead>
                  <TableHead className="text-center">Founded</TableHead>
                  <TableHead className="text-center">Employees</TableHead>
                  <TableHead className="text-center">Revenue</TableHead>
                  <TableHead className="text-center">Market Share</TableHead>
                  <TableHead className="text-center">Threat Level</TableHead>
                  <TableHead className="w-[100px] text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitors.map((competitor) => {
                  const ThreatIcon = getThreatLevelIcon(competitor.threatLevel);
                  return (
                    <TableRow
                      key={competitor.id}
                      className="group hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedCompetitor(competitor)}
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={competitor.logoUrl || ""}
                              alt={competitor.name}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                              {getCompanyInitials(competitor.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-sm group-hover:text-primary transition-colors">
                              {competitor.name}
                            </div>
                            {competitor.description && (
                              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {competitor.description}
                              </div>
                            )}
                            {competitor.headquarters && (
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {competitor.headquarters}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {competitor.foundedYear || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {formatEmployeeCount(competitor.employeeCount)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {formatCurrency(competitor.annualRevenue)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <BarChart3 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {formatPercentage(competitor.marketShare)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={getThreatLevelColor(competitor.threatLevel)}
                          className="gap-1"
                        >
                          <ThreatIcon className="h-3 w-3" />
                          {competitor.threatLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCompetitor(competitor);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CompetitorDetailsSheet
        competitor={selectedCompetitor}
        open={!!selectedCompetitor}
        onOpenChange={(open) => !open && setSelectedCompetitor(null)}
      />
    </>
  );
}
