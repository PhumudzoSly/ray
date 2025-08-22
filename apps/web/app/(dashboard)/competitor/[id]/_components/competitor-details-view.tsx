"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getCompetitor } from "@/actions/idea/competitor";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Building2, Globe, Users, Calendar, MapPin, DollarSign, TrendingUp, Star } from "lucide-react";
import { Separator } from "@workspace/ui/components/separator";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";

interface CompetitorDetailsViewProps {
  competitorId: string;
}

export function CompetitorDetailsView({ competitorId }: CompetitorDetailsViewProps) {
  const { data: competitor, isLoading } = useQuery({
    queryKey: ["competitor", competitorId],
    queryFn: () => getCompetitor({ id: competitorId }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (!competitor) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Competitor not found</p>
      </div>
    );
  }
  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount * 1000000); // Convert millions to actual amount
  };

  const formatPercentage = (value: number | null) => {
    if (!value) return "N/A";
    return `${value.toFixed(1)}%`;
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "destructive";
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "secondary";
      case "LOW":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitor.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Website:</span>
                <a
                  href={competitor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {competitor.website}
                </a>
              </div>
            )}
            
            {competitor.foundedYear && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Founded:</span>
                <span className="text-sm">{competitor.foundedYear}</span>
              </div>
            )}
            
            {competitor.headquarters && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Headquarters:</span>
                <span className="text-sm">{competitor.headquarters}</span>
              </div>
            )}
            
            {competitor.employeeCount && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Employees:</span>
                <span className="text-sm">{competitor.employeeCount}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Threat Level:</span>
            <Badge variant={getThreatLevelColor(competitor.threatLevel) as any}>
              {competitor.threatLevel}
            </Badge>
          </div>
          
          {competitor.targetAudience && (
            <div>
              <span className="text-sm font-medium">Target Audience:</span>
              <p className="text-sm text-muted-foreground mt-1">
                {competitor.targetAudience}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Annual Revenue</span>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrency(competitor.annualRevenue)}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Market Share</span>
              </div>
              <p className="text-2xl font-bold">
                {formatPercentage(competitor.marketShare)}
              </p>
            </div>
            
            {competitor.marketCap && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Market Cap</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(competitor.marketCap)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">User Growth Rate</span>
              </div>
              <p className="text-2xl font-bold">
                {formatPercentage(competitor.userGrowthRate)}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Churn Rate</span>
              </div>
              <p className="text-2xl font-bold">
                {formatPercentage(competitor.churnRate)}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Customer Satisfaction</span>
              </div>
              <p className="text-2xl font-bold">
                {competitor.customerSatisfaction ? `${competitor.customerSatisfaction.toFixed(1)}/10` : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle>Status & Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={competitor.isActive ? "default" : "secondary"}>
              {competitor.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Created:</span>
            <span className="text-sm text-muted-foreground">
              {new Date(competitor.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Updated:</span>
            <span className="text-sm text-muted-foreground">
              {new Date(competitor.lastUpdated).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}