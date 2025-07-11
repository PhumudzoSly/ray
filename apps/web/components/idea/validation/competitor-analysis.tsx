"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { Button } from "@workspace/ui/components/button";
import {
  Target,
  ExternalLink,
  Building,
  MapPin,
  DollarSign,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";

interface CompetitorAnalysisProps {
  data: any;
  competitors: any[];
}

export const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({
  data,
  competitors,
}) => {
  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            No competitor analysis data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatRevenue = (revenue: number) => {
    if (revenue >= 1e9) return `$${(revenue / 1e9).toFixed(1)}B`;
    if (revenue >= 1e6) return `$${(revenue / 1e6).toFixed(1)}M`;
    if (revenue >= 1e3) return `$${(revenue / 1e3).toFixed(1)}K`;
    return `$${revenue}`;
  };

  return (
    <div className="space-y-6">
      {/* Competitive Score Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              <CardTitle>Competitive Landscape</CardTitle>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {data.score}/100
            </Badge>
          </div>
          <CardDescription>
            Analysis of competitive positioning and market differentiation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Competitive Advantage Score</span>
                <span className="font-medium">{data.score}%</span>
              </div>
              <Progress value={data.score} className="h-2" />
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm leading-relaxed">{data.analysis}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitive Advantage */}
      {data.competitiveAdvantage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Competitive Advantage
            </CardTitle>
            <CardDescription>
              Key advantages that differentiate this idea from competitors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-green-50/50 border-green-200">
              <p className="text-sm leading-relaxed">
                {data.competitiveAdvantage}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Differentiators */}
      {data.differentiators && data.differentiators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Key Differentiators
            </CardTitle>
            <CardDescription>
              Unique features and advantages that set this idea apart
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.differentiators.map(
                (differentiator: string, index: number) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg bg-background hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                      <p className="text-sm font-medium">{differentiator}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Known Competitors */}
      {data.competitors && data.competitors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              Identified Competitors
            </CardTitle>
            <CardDescription>
              Direct and indirect competitors in the market space
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.competitors.map((competitor: string, index: number) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{competitor}</p>
                      <p className="text-xs text-muted-foreground">
                        Competitor
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Competitor Profiles */}
      {competitors && competitors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Competitor Profiles
            </CardTitle>
            <CardDescription>
              Detailed analysis of key competitors in the market
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {competitors.map((competitor: any, index: number) => (
                <div
                  key={index}
                  className="p-6 border rounded-lg bg-background hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-4">
                    {/* Competitor Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            {competitor.name}
                          </h3>
                          {competitor.website && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                window.open(competitor.website, "_blank")
                              }
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {competitor.description}
                        </p>
                      </div>
                    </div>

                    {/* Competitor Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {competitor.industry && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{competitor.industry}</span>
                        </div>
                      )}

                      {competitor.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{competitor.location}</span>
                        </div>
                      )}

                      {competitor.revenue && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {formatRevenue(competitor.revenue)} revenue
                          </span>
                        </div>
                      )}

                      {competitor.marketShare && (
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>{competitor.marketShare}% market share</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competitive Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Competitive Insights</CardTitle>
          <CardDescription>
            Strategic recommendations based on competitive analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-green-700 mb-2">Opportunities</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {data.score >= 70 && (
                  <li>• Strong competitive positioning identified</li>
                )}
                {data.differentiators && data.differentiators.length > 0 && (
                  <li>• Multiple differentiators provide competitive edge</li>
                )}
                {data.competitiveAdvantage && (
                  <li>• Clear competitive advantage established</li>
                )}
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-orange-700 mb-2">Challenges</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {data.competitors && data.competitors.length > 3 && (
                  <li>• Highly competitive market with many players</li>
                )}
                {data.score < 50 && (
                  <li>• Competitive advantage needs strengthening</li>
                )}
                {!data.competitiveAdvantage && (
                  <li>• Need to identify unique competitive advantage</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
