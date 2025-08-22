"use client";

import React from "react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  AlertTriangle,
  MapPin,
  Eye,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllCompetitors } from "@/actions/idea/competitor";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  //

  const router = useRouter();

  const {
    data: competitors,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["idea-competitors", ideaId],
    queryFn: () => getAllCompetitors(ideaId),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-0 ring-1 ring-border/50 bg-card/50">
            <CardContent className="p-6">
              {/* Header Section Skeleton */}
              <div className="mb-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/30">
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>

              {/* Metrics Section Skeleton */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Section Skeleton */}
              <div className="pt-4 border-t border-border/30 flex items-center justify-between">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {competitors?.map((competitor) => {
          const ThreatIcon = getThreatLevelIcon(competitor.threatLevel);
          return (
            <Card
              key={competitor.id}
              className="group hover:shadow-lg hover:shadow-black/5 transition-all duration-300 cursor-pointer border-0 bg-card/50 hover:bg-card ring-1 ring-border/50 hover:ring-border"
              onClick={() => router.push(`/competitor/${competitor.id}`)}
            >
              <CardContent className="px-6">
                {/* Header Section */}
                <div className="mb-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 flex-shrink-0 ring-1 ring-border/30 rounded-xl">
                      <AvatarImage
                        src={competitor.logoUrl || ""}
                        alt={competitor.name}
                        className="object-cover rounded-xl"
                      />
                      <AvatarFallback className="bg-muted border text-muted-foreground font-medium text-xs rounded-xl">
                        {getCompanyInitials(competitor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base leading-tight group-hover:text-foreground transition-colors line-clamp-1 mb-2">
                        {competitor.name}
                      </h3>
                      {competitor.description && (
                        <p className="text-sm text-muted-foreground/70 line-clamp-1 leading-relaxed">
                          {competitor.description} lorem ipsum dolor sit amet,
                          consectetur adipiscing elit.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  {competitor.headquarters && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
                      <MapPin className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground/70 font-medium">
                        {competitor.headquarters}
                      </span>
                    </div>
                  )}
                </div>

                {/* Metrics Section */}
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wider">
                          Founded
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground/90">
                        {competitor.foundedYear || "—"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wider">
                          Team
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground/90">
                        {formatEmployeeCount(competitor.employeeCount)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wider">
                          Revenue
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground/90">
                        {formatCurrency(competitor.annualRevenue)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <BarChart3 className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wider">
                          Share
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground/90">
                        {formatPercentage(competitor.marketShare)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="pt-4 border-t border-border/30 flex items-center justify-between">
                  <Badge
                    variant={getThreatLevelColor(competitor.threatLevel)}
                    className="gap-1.5 font-medium text-xs px-2.5 py-1"
                  >
                    <ThreatIcon className="h-3 w-3" />
                    {competitor.threatLevel}
                  </Badge>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/competitor/${competitor.id}`}
                      className="flex items-center gap-2"
                    >
                      Manage
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* <CompetitorDetailsSheet
        competitor={selectedCompetitor}
        open={!!selectedCompetitor}
        onOpenChange={(open) => !open && setSelectedCompetitor(null)}
      /> */}
    </>
  );
}
