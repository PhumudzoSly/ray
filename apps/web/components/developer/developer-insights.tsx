"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  Target,
  BookOpen,
  Award,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import {
  getDeveloperProgress,
  getPersonalizedSuggestions,
} from "@/actions/developer-profile";

interface DeveloperInsightsProps {
  userId?: string;
}

export function DeveloperInsights({ userId }: DeveloperInsightsProps) {
  const {
    data: progressData,
    isLoading: progressLoading,
    refetch: refetchProgress,
  } = useQuery({
    queryKey: ["developer-progress", userId],
    queryFn: () => getDeveloperProgress(userId!),
    enabled: !!userId,
  });

  const { data: suggestionsData, isLoading: suggestionsLoading } = useQuery({
    queryKey: ["developer-suggestions", userId],
    queryFn: () => getPersonalizedSuggestions(userId!),
    enabled: !!userId,
  });

  if (progressLoading || suggestionsLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!progressData?.success || !suggestionsData?.success) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Unable to load developer insights
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetchProgress()}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { profile, progressMetrics, issueResolutionTrends, skillProgression } =
    progressData.data;
  const { suggestions, learningPath } = suggestionsData.data;

  const getTrendIcon = (trend: number) => {
    if (trend > 2) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < -2) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "senior":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "mid":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "junior":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProgressionColor = (progression: string) => {
    switch (progression) {
      case "expert":
        return "bg-purple-500";
      case "advanced":
        return "bg-blue-500";
      case "intermediate":
        return "bg-green-500";
      case "developing":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getProgressionScore = (progression: string) => {
    switch (progression) {
      case "expert":
        return 100;
      case "advanced":
        return 80;
      case "intermediate":
        return 60;
      case "developing":
        return 40;
      default:
        return 20;
    }
  };

  return (
    <div className="space-y-6">
      {/* Developer Profile Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Developer Profile
          </CardTitle>
          <Badge
            variant="outline"
            className={getSkillLevelColor(profile.skillLevel)}
          >
            {profile.skillLevel.charAt(0).toUpperCase() +
              profile.skillLevel.slice(1)}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Skill Progression */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Skill Progression</span>
                <span className="text-sm text-muted-foreground capitalize">
                  {skillProgression.progression}
                </span>
              </div>
              <Progress
                value={getProgressionScore(skillProgression.progression)}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Next milestone: {skillProgression.nextMilestone}
              </p>
            </div>

            {/* Languages */}
            {profile.preferredLanguages.length > 0 && (
              <div>
                <span className="text-sm font-medium">Preferred Languages</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.preferredLanguages
                    .slice(0, 5)
                    .map((lang: string) => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                </div>
              </div>
            )}

            {/* Improvement Areas */}
            {profile.improvementAreas.length > 0 && (
              <div>
                <span className="text-sm font-medium">Focus Areas</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.improvementAreas.slice(0, 3).map((area: string) => (
                    <Badge key={area} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Maintainability</span>
                {getTrendIcon(progressMetrics.maintainabilityTrend)}
              </div>
              <div className="text-xs text-muted-foreground">
                {progressMetrics.maintainabilityTrend > 0 ? "+" : ""}
                {progressMetrics.maintainabilityTrend.toFixed(1)}% change
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Security</span>
                {getTrendIcon(progressMetrics.securityTrend)}
              </div>
              <div className="text-xs text-muted-foreground">
                {progressMetrics.securityTrend > 0 ? "+" : ""}
                {progressMetrics.securityTrend.toFixed(1)}% change
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Complexity</span>
                {getTrendIcon(progressMetrics.complexityTrend)}
              </div>
              <div className="text-xs text-muted-foreground">
                {progressMetrics.complexityTrend > 0 ? "+" : ""}
                {progressMetrics.complexityTrend.toFixed(1)} change
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Issues Resolved</span>
                <Badge
                  variant={
                    issueResolutionTrends.trend >= 0 ? "default" : "secondary"
                  }
                >
                  {issueResolutionTrends.recentResolved}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {issueResolutionTrends.trend >= 0 ? "+" : ""}
                {issueResolutionTrends.trend} this month
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalized Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Personalized Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {suggestion.title}
                        </span>
                        <Badge
                          variant={
                            suggestion.priority === "high"
                              ? "destructive"
                              : suggestion.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {suggestion.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Target className="h-3 w-3" />
                        <span>{suggestion.category}</span>
                        <span>•</span>
                        <span>{suggestion.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Path */}
      {learningPath.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Learning Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {learningPath.slice(0, 3).map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                    {step.resources.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {step.resources.slice(0, 2).map((resource, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
