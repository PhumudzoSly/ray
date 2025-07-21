"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/card";
import { Textarea } from "@workspace/ui/textarea";
import { Badge } from "@workspace/ui/badge";
import { AlertCircle, CheckCircle, HelpCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@workspace/ui/alert";
import { toast } from "sonner";

interface ValidationQuestion {
  question: string;
  importance: "low" | "medium" | "important";
  context: string;
}

interface ValidationQuestionsProps {
  ideaId: string;
  questions: ValidationQuestion[];
  onSubmit: (
    answers: Array<{ question: string; answer: string }>
  ) => Promise<void>;
  onSkip: () => void;
}

const getImportanceColor = (importance: string) => {
  switch (importance) {
    case "important":
      return "bg-red-100 text-red-800 border-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getImportanceIcon = (importance: string) => {
  switch (importance) {
    case "important":
      return <AlertCircle className="h-4 w-4" />;
    case "medium":
      return <HelpCircle className="h-4 w-4" />;
    case "low":
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <HelpCircle className="h-4 w-4" />;
  }
};

export const ValidationQuestions: React.FC<ValidationQuestionsProps> = ({
  ideaId,
  questions,
  onSubmit,
  onSkip,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswerChange = (question: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [question]: answer,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const answersArray = questions.map((q) => ({
        question: q.question,
        answer: answers[q.question] || "",
      }));

      await onSubmit(answersArray);
      toast.success("Answers submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit answers. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = questions.every((q) => answers[q.question]?.trim());

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Additional Information Needed
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          To provide you with the most accurate validation, we need a bit more
          information about your idea. Please answer the following questions to
          help us better understand your SaaS concept.
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={index} className="border-l-4 border-l-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    {question.question}
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm">
                    {question.context}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={`${getImportanceColor(question.importance)} flex items-center gap-1`}
                >
                  {getImportanceIcon(question.importance)}
                  {question.importance}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter your answer here..."
                value={answers[question.question] || ""}
                onChange={(e) =>
                  handleAnswerChange(question.question, e.target.value)
                }
                className="min-h-[100px] resize-none"
                rows={4}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onSkip} disabled={isSubmitting}>
          Skip for now
        </Button>

        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            {questions.filter((q) => answers[q.question]?.trim()).length} of{" "}
            {questions.length} answered
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit & Continue"
            )}
          </Button>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Your answers will help us provide more accurate validation results.
          You can always update this information later in your idea settings.
        </AlertDescription>
      </Alert>
    </div>
  );
};
