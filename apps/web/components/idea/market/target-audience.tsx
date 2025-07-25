"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getTargetAudiences } from "@/actions/idea/market-research";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
  Users,
  Target,
  Building,
  MapPin,
  DollarSign,
  Cpu,
  AlertCircle,
  Star,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TargetAudienceProps {
  ideaId: string;
}

export const TargetAudience: React.FC<TargetAudienceProps> = ({ ideaId }) => {
  const { data: targetAudiences, isPending } = useQuery({
    queryKey: ["target-audiences", ideaId],
    queryFn: () => getTargetAudiences(ideaId),
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!targetAudiences || targetAudiences.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <AlertCircle className="h-5 w-5 mr-2" />
        No target audience data available
      </div>
    );
  }

  const getCompanySizeColor = (size: string | null) => {
    if (!size) return "bg-gray-100 text-gray-800 border-gray-200";
    switch (size) {
      case "STARTUP":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SMALL":
        return "bg-green-100 text-green-800 border-green-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LARGE":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "ENTERPRISE":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTechSavvinessColor = (savviness: string) => {
    switch (savviness) {
      case "NOVICE":
        return "bg-red-100 text-red-800 border-red-200";
      case "BASIC":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ADVANCED":
        return "bg-green-100 text-green-800 border-green-200";
      case "EXPERT":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "N/A";
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const primaryAudience = targetAudiences.find((audience) => audience.isPrimary);
  const secondaryAudiences = targetAudiences.filter((audience) => !audience.isPrimary);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium">Target Audience</h3>
      </div>

      {/* Primary Audience */}
      {primaryAudience && (
        <Card className="border-2 border-blue-200 bg-blue-50/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-base">Primary Target Audience</CardTitle>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                Primary
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <AudienceDetails audience={primaryAudience} />
          </CardContent>
        </Card>
      )}

      {/* Secondary Audiences */}
      {secondaryAudiences.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Secondary Audiences</h4>
          {secondaryAudiences.map((audience) => (
            <Card key={audience.id}>
              <CardHeader>
                <CardTitle className="text-base">{audience.segmentName}</CardTitle>
              </CardHeader>
              <CardContent>
                <AudienceDetails audience={audience} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

interface AudienceDetailsProps {
  audience: any;
}

const AudienceDetails: React.FC<AudienceDetailsProps> = ({ audience }) => {
  const getCompanySizeColor = (size: string | null) => {
    if (!size) return "bg-gray-100 text-gray-800 border-gray-200";
    switch (size) {
      case "STARTUP":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SMALL":
        return "bg-green-100 text-green-800 border-green-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LARGE":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "ENTERPRISE":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTechSavvinessColor = (savviness: string) => {
    switch (savviness) {
      case "NOVICE":
        return "bg-red-100 text-red-800 border-red-200";
      case "BASIC":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ADVANCED":
        return "bg-green-100 text-green-800 border-green-200";
      case "EXPERT":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "N/A";
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-4">
      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {audience.ageRange && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Age Range</span>
            </div>
            <div className="font-medium">{audience.ageRange}</div>
          </div>
        )}
        {audience.location && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>Location</span>
            </div>
            <div className="font-medium">{audience.location}</div>
          </div>
        )}
        {audience.companySize && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Building className="h-3 w-3" />
              <span>Company Size</span>
            </div>
            <Badge variant="outline" className={cn("text-xs", getCompanySizeColor(audience.companySize))}>
              {audience.companySize.replace("_", " ")}
            </Badge>
          </div>
        )}
        {audience.industry && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Target className="h-3 w-3" />
              <span>Industry</span>
            </div>
            <div className="font-medium">{audience.industry}</div>
          </div>
        )}
      </div>

      <Separator />

      {/* Market Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {audience.estimatedSize && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Estimated Size</span>
            </div>
            <div className="font-medium">{audience.estimatedSize.toLocaleString()} companies</div>
          </div>
        )}
        {audience.averageSpend && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>Average Spend</span>
            </div>
            <div className="font-medium">{formatCurrency(audience.averageSpend)}</div>
          </div>
        )}
        {audience.segmentValue && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <UserCheck className="h-3 w-3" />
              <span>Segment Value</span>
            </div>
            <div className="font-medium">{formatCurrency(audience.segmentValue)}</div>
          </div>
        )}
      </div>

      <Separator />

      {/* Characteristics */}
      <div className="space-y-4">
        {/* Tech Savviness */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <Cpu className="h-3 w-3" />
            <span>Tech Savviness</span>
          </div>
          <Badge variant="outline" className={cn("text-xs", getTechSavvinessColor(audience.techSavviness))}>
            {audience.techSavviness.replace("_", " ")}
          </Badge>
        </div>

        {/* Budget Range */}
        {audience.budgetRange && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>Budget Range</span>
            </div>
            <div className="text-sm">{audience.budgetRange}</div>
          </div>
        )}

        {/* Pain Points */}
        {audience.painPoints && audience.painPoints.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Pain Points</div>
            <div className="flex flex-wrap gap-2">
              {audience.painPoints.map((point: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs text-red-700 border-red-200">
                  {point}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Decision Factors */}
        {audience.decisionFactors && audience.decisionFactors.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Decision Factors</div>
            <div className="flex flex-wrap gap-2">
              {audience.decisionFactors.map((factor: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {factor}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 