"use client";

import React from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Progress } from "@workspace/ui/components/progress";
import { Separator } from "@workspace/ui/components/separator";
import { Badge } from "@workspace/ui/components/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import {
  Building2,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Star,
  ExternalLink,
  MapPin,
  Target,
  BarChart3,
  AlertTriangle,
  Globe,
} from "lucide-react";

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

interface CompetitorDetailsSheetProps {
  competitor: Competitor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
      return TrendingUp;
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

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function CompetitorDetailsSheet({
  competitor,
  open,
  onOpenChange,
}: CompetitorDetailsSheetProps) {
  if (!competitor) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={competitor.logoUrl || ""}
                alt={competitor.name}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                {getCompanyInitials(competitor.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <SheetTitle className="text-2xl font-bold">
                {competitor.name}
              </SheetTitle>
              <SheetDescription className="text-base mt-1">
                {competitor.description || "No description available"}
              </SheetDescription>
              {competitor.website && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.open(competitor.website!, "_blank")}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Visit Website
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Threat Assessment */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Threat Assessment
            </h3>
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="font-medium">Threat Level</span>
                <Badge
                  variant={getThreatLevelColor(competitor.threatLevel)}
                  className="gap-1"
                >
                  {React.createElement(
                    getThreatLevelIcon(competitor.threatLevel),
                    {
                      className: "h-3 w-3",
                    }
                  )}
                  {competitor.threatLevel}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Company Overview */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Overview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Founded
                </div>
                <div className="font-medium">
                  {competitor.foundedYear || "N/A"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Headquarters
                </div>
                <div className="font-medium">
                  {competitor.headquarters || "N/A"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Employees
                </div>
                <div className="font-medium">
                  {formatEmployeeCount(competitor.employeeCount)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  Target Audience
                </div>
                <div className="font-medium">
                  {competitor.targetAudience || "N/A"}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Metrics */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Metrics
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Annual Revenue
                  </span>
                  <span className="font-bold text-lg">
                    {formatCurrency(competitor.annualRevenue)}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Market Cap
                  </span>
                  <span className="font-bold text-lg">
                    {formatCurrency(competitor.marketCap)}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Market Share
                  </span>
                  <span className="font-bold text-lg">
                    {formatPercentage(competitor.marketShare)}
                  </span>
                </div>
                {competitor.marketShare && (
                  <Progress
                    value={competitor.marketShare}
                    className="h-2 mt-2"
                  />
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Performance Metrics */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {competitor.customerSatisfaction && (
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">
                        Customer Satisfaction
                      </span>
                    </div>
                    <span className="font-bold text-lg">
                      {competitor.customerSatisfaction}/10
                    </span>
                  </div>
                  <Progress
                    value={competitor.customerSatisfaction * 10}
                    className="h-2"
                    variant="success"
                  />
                </div>
              )}
              {competitor.userGrowthRate !== null && (
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      User Growth Rate
                    </span>
                    <span className="font-bold text-lg">
                      {formatPercentage(competitor.userGrowthRate)}
                    </span>
                  </div>
                </div>
              )}
              {competitor.churnRate !== null && (
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Churn Rate
                    </span>
                    <span className="font-bold text-lg">
                      {formatPercentage(competitor.churnRate)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Tracking Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <div className="font-medium">
                  {formatDate(competitor.createdAt)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <div className="font-medium">
                  {formatDate(competitor.lastUpdated)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
