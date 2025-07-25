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
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import * as ideaActions from "@/actions/idea";
import { useSession } from "@/context/session-context";
import { toast } from "sonner";
import { ValidationQuestions } from "./validation-questions";

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
  const [showQuestions, setShowQuestions] = useState(false);
  const [validationQuestions, setValidationQuestions] = useState<any[]>([]);
  const [isCheckingQuestions, setIsCheckingQuestions] = useState(false);
  const startValidationMutation = useMutation({
    mutationFn: async (additionalContext?: any) =>
      ideaActions.startValidation({ ideaId: idea.id, additionalContext }),
    onSuccess: () => {
      toast.success("Validation started in background!");
      window.location.reload();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to validate idea"
      );
    },
    onSettled: () => setIsValidating(false),
  });

  // Mutation to check validation questions
  const checkQuestionsMutation = useMutation({
    mutationFn: async (additionalContext?: any) =>
      ideaActions.checkIdeaClarity({ ideaId: idea.id, additionalContext }),
    onSuccess: (result) => {
      if (
        result &&
        result.isClear === false &&
        result.questions &&
        result.questions.length > 0
      ) {
        // Convert the questions array to the expected format
        const formattedQuestions = result.questions.map((question: string) => ({
          question,
          importance: "important" as const,
          context: "Clarification needed for validation accuracy",
        }));
        setValidationQuestions(formattedQuestions);
        setShowQuestions(true);
      } else {
        // No questions needed, proceed directly to validation
        startValidationMutation.mutate(undefined);
      }
    },
    onError: (error) => {
      console.error("Error checking questions:", error);
      // Fallback to direct validation
      startValidationMutation.mutate(undefined);
    },
    onSettled: () => setIsCheckingQuestions(false),
  });

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
    setIsCheckingQuestions(true);
    // Pass any existing additional context if available
    const additionalContext = validationDetails?.additionalContext || {};
    checkQuestionsMutation.mutate(additionalContext);
  };

  const handleSkipQuestions = () => {
    setShowQuestions(false);
    // Pass any existing additional context if available
    const additionalContext = validationDetails?.additionalContext || {};
    startValidationMutation.mutate(additionalContext);
  };

  const handleSubmitAnswers = async (
    answers: Array<{ question: string; answer: string }>
  ) => {
    // Create additional context with the answers
    const additionalContext = {
      preValidationAnswers: answers,
      source: "user_questions",
    };

    // Close the questions dialog
    setShowQuestions(false);

    // Start validation with the additional context
    startValidationMutation.mutate(additionalContext);
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
          <h3 className="text-lg font-medium mb-2">AI Validation</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Get comprehensive analysis of your idea across market fit,
            competition, feasibility and finances
          </p>
        </div>
        <Button
          onClick={handleValidate}
          disabled={isValidating || isCheckingQuestions}
          size="lg"
        >
          {isValidating || isCheckingQuestions ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isCheckingQuestions ? "Checking..." : "Validating..."}
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
      {/* Validation Questions Step */}
      {showQuestions && (
        <div className="bg-card border rounded-lg p-6">
          <ValidationQuestions
            ideaId={idea.id}
            questions={validationQuestions}
            onSubmit={handleSubmitAnswers}
            onSkip={handleSkipQuestions}
          />
        </div>
      )}

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
