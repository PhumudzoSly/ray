"use client";

import React, { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Textarea } from "@workspace/ui/components/textarea";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import {
  Brain,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Sparkles,
  HelpCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ideaActions from "@/actions/idea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ValidationSidebarProps {
  ideaId: string;
  idea: any;
  children: React.ReactNode;
}

type ValidationStep = "checking" | "questions" | "validating" | "complete";

export const ValidationSidebar: React.FC<ValidationSidebarProps> = ({
  ideaId,
  idea,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<ValidationStep>("checking");
  const [clarityResult, setClarityResult] = useState<any>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  // Check idea clarity mutation
  const checkClarityMutation = useMutation({
    mutationFn: async () => ideaActions.checkIdeaClarity({ ideaId }),
    onSuccess: (result) => {
      setClarityResult(result);
      if (result.isClear) {
        setCurrentStep("validating");
        startValidationMutation.mutate();
      } else {
        setQuestions(result.questions || []);
        setCurrentStep("questions");
      }
    },
    onError: (error) => {
      toast.error("Failed to check idea clarity. Please try again.");
      console.error("Clarity check error:", error);
    },
  });

  // Start validation mutation
  const startValidationMutation = useMutation({
    mutationFn: async (additionalContext?: any) =>
      ideaActions.startValidation({ ideaId, additionalContext }),
    onSuccess: () => {
      setCurrentStep("complete");
      toast.success("Validation started successfully!");
      queryClient.invalidateQueries({ queryKey: ["idea", ideaId] });
      // Close the sheet after a short delay
      setTimeout(() => setIsOpen(false), 2000);
    },
    onError: (error) => {
      toast.error("Failed to start validation. Please try again.");
      console.error("Validation error:", error);
    },
  });

  const handleStartValidation = () => {
    setCurrentStep("checking");
    checkClarityMutation.mutate();
  };

  const handleAnswerChange = (question: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [question]: answer,
    }));
  };

  const handleSubmitAnswers = () => {
    const answersArray = questions.map((question) => ({
      question,
      answer: answers[question] || "",
    }));

    // Create additional context from answers
    const additionalContext = {
      preValidationAnswers: answersArray,
      timestamp: new Date().toISOString(),
      source: "validation-sidebar",
    };

    setCurrentStep("validating");
    startValidationMutation.mutate(additionalContext);
  };

  const handleSkipQuestions = () => {
    setCurrentStep("validating");
    startValidationMutation.mutate();
  };

  const canSubmitAnswers = questions.every((q) => answers[q]?.trim());

  const getStepContent = () => {
    switch (currentStep) {
      case "checking":
        return (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-medium mb-2">Checking Idea Clarity</h3>
            <p className="text-sm text-muted-foreground">
              Analyzing your idea to determine if we need more information...
            </p>
          </div>
        );

      case "questions":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium">
                Additional Information Needed
              </h3>
              <p className="text-sm text-muted-foreground">
                To provide accurate validation, we need more details about your
                idea.
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your answers will help us provide more accurate validation
                results.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="space-y-2">
                  <label className="text-sm font-medium">
                    Question {index + 1}
                  </label>
                  <p className="text-sm text-muted-foreground mb-2">
                    {question}
                  </p>
                  <Textarea
                    placeholder="Enter your answer here..."
                    value={answers[question] || ""}
                    onChange={(e) =>
                      handleAnswerChange(question, e.target.value)
                    }
                    className="min-h-[80px] resize-none"
                    rows={3}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={handleSkipQuestions}>
                Skip for now
              </Button>

              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">
                  {questions.filter((q) => answers[q]?.trim()).length} of{" "}
                  {questions.length} answered
                </div>
                <Button
                  onClick={handleSubmitAnswers}
                  disabled={!canSubmitAnswers}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Validation
                </Button>
              </div>
            </div>
          </div>
        );

      case "validating":
        return (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Starting Validation</h3>
            <p className="text-sm text-muted-foreground">
              Initializing AI validation process...
            </p>
          </div>
        );

      case "complete":
        return (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Validation Started</h3>
            <p className="text-sm text-muted-foreground">
              Your idea is now being analyzed. Check back soon for results!
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "questions":
        return <HelpCircle className="h-4 w-4" />;
      case "validating":
        return <Brain className="h-4 w-4" />;
      case "complete":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "checking":
        return "Checking Clarity";
      case "questions":
        return "Additional Questions";
      case "validating":
        return "Starting Validation";
      case "complete":
        return "Validation Started";
      default:
        return "Idea Validation";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {getStepIcon()}
            {getStepTitle()}
          </SheetTitle>
          <SheetDescription>
            {currentStep === "checking" && "Analyzing your idea for clarity"}
            {currentStep === "questions" && "Please provide additional details"}
            {currentStep === "validating" && "Initializing validation process"}
            {currentStep === "complete" &&
              "Validation process started successfully"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {currentStep === "checking" && !clarityResult && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Brain className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    AI Idea Validation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get comprehensive analysis of your idea across market fit,
                    competition, feasibility and finances
                  </p>
                </div>
              </div>

              <Button
                onClick={handleStartValidation}
                disabled={checkClarityMutation.isPending}
                className="w-full"
                size="lg"
              >
                {checkClarityMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start Validation
                  </>
                )}
              </Button>
            </div>
          )}

          {getStepContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
};
