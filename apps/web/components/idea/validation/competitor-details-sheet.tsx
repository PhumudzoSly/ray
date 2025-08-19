"use client";

import React, { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
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
  Trash2,
  Info,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { toast } from "sonner";
import { InlineEditField } from "@workspace/ui/components/inline-field";
import { InlineEditTextArea } from "@workspace/ui/components/inline-textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

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
  onUpdate?: (id: string, updates: Partial<Competitor>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
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

const getThreatLevelVariant = (threatLevel: string) => {
  switch (threatLevel.toLowerCase()) {
    case "critical":
      return "destructive";
    case "high":
      return "destructive";
    case "medium":
      return "secondary";
    case "low":
      return "default";
    default:
      return "default";
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

const formatCurrency = (amount: number | null | undefined) => {
  if (!amount) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
  }).format(amount);
};

const formatPercentage = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "N/A";
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

const MetricCard = ({
  title,
  value,
  icon: Icon,
  tooltip,
  className = "",
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  tooltip?: string;
  className?: string;
}) => (
  <Card className={`border-0 shadow-none ${className}`}>
    <CardHeader className="p-0 pb-2">
      <CardTitle className="text-sm font-medium flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {title}
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <div className="text-2xl font-semibold">{value}</div>
    </CardContent>
  </Card>
);

const ProgressMetricCard = ({
  title,
  value,
  max,
  icon: Icon,
  variant = "default",
  tooltip,
}: {
  title: string;
  value: number | null;
  max: number;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "success";
  tooltip?: string;
}) => {
  if (value === null || value === undefined) return null;

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-2">
        <div className="text-2xl font-semibold">
          {value}
          {max === 100 ? "%" : ""}
        </div>
        <Progress value={value} max={max} className="h-2" variant={variant} />
      </CardContent>
    </Card>
  );
};

export function CompetitorDetailsSheet({
  competitor,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: CompetitorDetailsSheetProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!competitor) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-[640px] p-0">
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-7 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const handleNameChange = async (name: string) => {
    if (!onUpdate) return;
    setIsUpdating(true);
    try {
      await onUpdate(competitor.id, { name });
      toast.success("Competitor name updated");
    } catch (error) {
      toast.error("Failed to update competitor name");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDescriptionChange = async (description: string) => {
    if (!onUpdate) return;
    setIsUpdating(true);
    try {
      await onUpdate(competitor.id, { description: description || undefined });
      toast.success("Competitor description updated");
    } catch (error) {
      toast.error("Failed to update competitor description");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(competitor.id);
      toast.success("Competitor deleted");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to delete competitor");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[740px] p-0 overflow-y-auto">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarImage
                    src={competitor.logoUrl || ""}
                    alt={competitor.name}
                    className="rounded-lg"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold rounded-lg">
                    {getCompanyInitials(competitor.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <InlineEditField
                    displayValue={
                      <h1 className="text-lg font-semibold text-foreground leading-tight truncate">
                        {competitor.name}
                      </h1>
                    }
                    value={competitor.name}
                    onSave={handleNameChange}
                    disabled={isUpdating}
                    className="w-full"
                  />
                  <div className="mt-1">
                    <Badge
                      variant={getThreatLevelVariant(competitor.threatLevel)}
                      className="gap-1 text-xs font-medium"
                    >
                      {React.createElement(
                        getThreatLevelIcon(competitor.threatLevel),
                        {
                          className: "h-3 w-3",
                        }
                      )}
                      {competitor.threatLevel} Threat
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {onDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete competitor</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{competitor.name}"?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Description */}
          <div className="space-y-3">
            <InlineEditTextArea
              value={competitor.description || ""}
              placeholder="Add a description..."
              onSave={handleDescriptionChange}
              disabled={isUpdating}
              className="text-sm text-muted-foreground leading-relaxed p-0 border-0 shadow-none resize-none"
            />
          </div>

          {/* Website */}
          {competitor.website && (
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-fit h-8 px-3 text-xs"
                onClick={() => window.open(competitor.website!, "_blank")}
              >
                <Globe className="h-3.5 w-3.5 mr-2" />
                Visit Website
                <ExternalLink className="h-3 w-3 ml-1.5" />
              </Button>
            </div>
          )}

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-9 bg-muted/30 rounded-lg p-1">
              <TabsTrigger
                value="overview"
                className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="financial"
                className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
              >
                Financial
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
              >
                Performance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-5 space-y-5">
              {/* Company Overview */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard
                    title="Founded"
                    value={competitor.foundedYear || "N/A"}
                    icon={Calendar}
                  />
                  <MetricCard
                    title="Headquarters"
                    value={competitor.headquarters || "N/A"}
                    icon={MapPin}
                  />
                  <MetricCard
                    title="Employees"
                    value={formatEmployeeCount(competitor.employeeCount?.toString() ?? null)}
                    icon={Users}
                  />
                  <MetricCard
                    title="Target Audience"
                    value={competitor.targetAudience || "N/A"}
                    icon={Target}
                  />
                </div>
              </div>

              <Separator className="my-2" />

              {/* Threat Assessment */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Threat Assessment
                </h3>
                <div className="p-4 rounded-lg border bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Threat Level</span>
                    <Badge
                      variant={getThreatLevelVariant(competitor.threatLevel)}
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
            </TabsContent>

            <TabsContent value="financial" className="mt-5 space-y-5">
              {/* Financial Metrics */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <MetricCard
                    title="Annual Revenue"
                    value={formatCurrency(competitor.annualRevenue)}
                    icon={DollarSign}
                    tooltip="Annual revenue in USD"
                  />
                  <MetricCard
                    title="Market Cap"
                    value={formatCurrency(competitor.marketCap)}
                    icon={BarChart3}
                    tooltip="Market capitalization in USD"
                  />
                  <ProgressMetricCard
                    title="Market Share"
                    value={competitor.marketShare ?? null}
                    max={100}
                    icon={BarChart3}
                    tooltip="Percentage of market share"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="mt-5 space-y-5">
              {/* Performance Metrics */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <ProgressMetricCard
                    title="Customer Satisfaction"
                    value={competitor.customerSatisfaction ?? null}
                    max={10}
                    icon={Star}
                    variant="success"
                    tooltip="Customer satisfaction score out of 10"
                  />
                  <MetricCard
                    title="User Growth Rate"
                    value={formatPercentage(competitor.userGrowthRate)}
                    icon={TrendingUp}
                    tooltip="Monthly user growth percentage"
                  />
                  <MetricCard
                    title="Churn Rate"
                    value={formatPercentage(competitor.churnRate)}
                    icon={AlertTriangle}
                    tooltip="Monthly customer churn percentage"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-2" />

          {/* Metadata */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground">Created</span>
                <div className="font-medium">
                  {formatDate(competitor.createdAt)}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Last Updated</span>
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
