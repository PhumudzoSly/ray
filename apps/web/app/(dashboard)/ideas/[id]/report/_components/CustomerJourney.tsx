"use client";

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useCustomerJourney } from "@/lib/queries/validation";
import { SectionHeader } from "./shared/SectionHeader";
import { MetricCard } from "./shared/MetricCard";
import { Badge } from "@workspace/ui/components/badge";

interface CustomerJourneyProps {
  ideaId: string;
}

export function CustomerJourney({ ideaId }: CustomerJourneyProps) {
  const { data, isLoading, error } = useCustomerJourney(ideaId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <SectionHeader
          title="Customer Journey Mapping"
          score={data.overallJourneyScore}
          description="Journey stages, touchpoints, and optimization opportunities"
        />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Journey Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            label="Journey Stages"
            value={data.totalJourneyStages}
          />
          <MetricCard
            label="Average Journey Time"
            value={`${data.averageJourneyTime} days`}
          />
          <MetricCard
            label="Conversion Rate"
            value={data.conversionRate}
            variant="percentage"
          />
          <MetricCard
            label="Customer Satisfaction"
            value={data.customerSatisfaction}
            variant="percentage"
          />
        </div>

        {/* Journey Stages */}
        {data.journeyStages && data.journeyStages.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Journey Stages</h3>
            <div className="space-y-3">
              {data.journeyStages
                .sort((a, b) => a.stageOrder - b.stageOrder)
                .map((stage, index) => (
                  <Card key={stage.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <h4 className="font-medium">{stage.stageName}</h4>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-medium">Conversion</p>
                            <p className="text-green-600 font-bold">{stage.conversionRate}%</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">Satisfaction</p>
                            <p className="text-blue-600 font-bold">{stage.satisfactionScore}%</p>
                          </div>
                        </div>
                      </div>
                      
                      {stage.averageDuration && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Average duration: {stage.averageDuration} hours
                        </p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {stage.customerGoals && stage.customerGoals.length > 0 && (
                          <div>
                            <p className="font-medium mb-1">Customer Goals:</p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                              {stage.customerGoals.slice(0, 3).map((goal, i) => (
                                <li key={i}>{goal}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {stage.customerActions && stage.customerActions.length > 0 && (
                          <div>
                            <p className="font-medium mb-1">Customer Actions:</p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                              {stage.customerActions.slice(0, 3).map((action, i) => (
                                <li key={i}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Pain Points Summary */}
        {data.journeyPainPoints && data.journeyPainPoints.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Key Pain Points</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.journeyPainPoints.slice(0, 6).map((painPoint) => (
                <Card key={painPoint.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm">{painPoint.painPointName}</h5>
                      <Badge variant="destructive" className="text-xs">
                        {painPoint.severityScore}% severity
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Stage: {painPoint.journeyStage}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Category: {painPoint.painCategory}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}