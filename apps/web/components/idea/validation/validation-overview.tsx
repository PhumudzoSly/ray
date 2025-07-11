"use client";

import React, { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Brain,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAction } from "convex/react";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { Id } from "@workspace/backend";
import { toast } from "sonner";

interface ValidationOverviewProps {
  idea: any;
  validationDetails: any;
}

export const ValidationOverview: React.FC<ValidationOverviewProps> = ({
  idea,
  validationDetails,
}) => {
  const { token } = useSession();
  const [isValidating, setIsValidating] = useState(false);
  const triggerValidation = useAction(api.idea.triggerValidation);

  const validationScore =
    validationDetails?.validation?.overallScore ||
    idea?.aiOverallValidation?.overallRating ||
    0;
  const hasValidation = validationDetails && validationDetails.validation;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 60)
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    if (score >= 40)
      return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Strong";
    if (score >= 60) return "Moderate";
    if (score >= 40) return "Weak";
    return "Poor";
  };

  const handleValidate = async () => {
    if (!idea) return;

    setIsValidating(true);

    try {
      const result = await triggerValidation({
        token,
        ideaId: idea._id as Id<"idea">,
      });

      if (result && result.success) {
        toast.success("Validation completed successfully!");
        window.location.reload();
      } else {
        throw new Error("Validation failed");
      }
    } catch (error) {
      console.error("Error validating idea:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to validate idea"
      );
    } finally {
      setIsValidating(false);
    }
  };

  // Validation metrics
  const metrics = [
    {
      icon: TrendingUp,
      label: "Market",
      score: validationDetails?.marketSize?.score || 0,
      color: "text-blue-600",
    },
    {
      icon: Users,
      label: "Competition",
      score: validationDetails?.competitorAnalysis?.score || 0,
      color: "text-purple-600",
    },
    {
      icon: Zap,
      label: "Customer Fit",
      score: validationDetails?.customerFit?.score || 0,
      color: "text-green-600",
    },
    {
      icon: DollarSign,
      label: "Feasibility",
      score: validationDetails?.feasibility?.score || 0,
      color: "text-orange-600",
    },
  ];

  if (!hasValidation) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">AI Validation</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Get comprehensive analysis of your idea across market fit,
            competition, feasibility and finances
          </p>
        </div>
        <Button onClick={handleValidate} disabled={isValidating} size="lg">
          {isValidating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Validate Idea
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getScoreIcon(validationScore)}
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-2xl font-bold",
                    getScoreColor(validationScore)
                  )}
                >
                  {validationScore}
                </span>
                <span className="text-muted-foreground">/100</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {getScoreLabel(validationScore)} Validation
              </Badge>
            </div>
          </div>
        </div>
        <Button
          onClick={handleValidate}
          disabled={isValidating}
          variant="outline"
          size="sm"
        >
          {isValidating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Re-validating...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Re-validate
            </>
          )}
        </Button>
      </div>

      {/* Recommendation */}
      <div className="bg-muted/30 border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {validationDetails?.validation?.recommendation ||
            idea?.aiOverallValidation?.overallComment ||
            "This idea has been analyzed by our AI validation system."}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg"
          >
            <metric.icon className={cn("h-5 w-5", metric.color)} />
            <div>
              <div className="font-medium">{metric.score}</div>
              <div className="text-xs text-muted-foreground">
                {metric.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
