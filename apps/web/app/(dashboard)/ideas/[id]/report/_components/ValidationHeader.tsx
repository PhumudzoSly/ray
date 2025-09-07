"use client";

import { format } from "date-fns";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useValidationOverview } from "@/lib/queries/validation";
import { ValidationNotFound } from "./ValidationNotFound";
import {
  ReportSection,
  ReportParagraph,
  ReportHighlight,
} from "./shared/ReportComponents";
import { ReportMetric } from "./shared/ReportMetric";

interface ValidationHeaderProps {
  ideaId: string;
}

export function ValidationHeader({ ideaId }: ValidationHeaderProps) {
  const { data: validation, isLoading, error } = useValidationOverview(ideaId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>
    );
  }

  if (error || !validation) {
    return <ValidationNotFound />;
  }

  const getValidationAssessment = (score: number) => {
    if (score >= 80)
      return {
        text: "Strong validation with high market potential",
        type: "success" as const,
      };
    if (score >= 70)
      return {
        text: "Good validation with solid market opportunity",
        type: "info" as const,
      };
    if (score >= 60)
      return {
        text: "Moderate validation requiring strategic adjustments",
        type: "warning" as const,
      };
    if (score >= 40)
      return {
        text: "Below-average validation with significant challenges",
        type: "warning" as const,
      };
    return {
      text: "Poor validation requiring major pivots or reconsideration",
      type: "danger" as const,
    };
  };

  const assessment = getValidationAssessment(validation.overallScore);
  const progressStatus =
    validation.validationProgress >= 100
      ? "Complete"
      : validation.validationProgress >= 75
        ? "Nearly Complete"
        : validation.validationProgress >= 50
          ? "In Progress"
          : "Initial Stage";

  return (
    <ReportSection className="px-8 mt-6 mb-8">
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            Validation Report
          </h1>
          <h2 className="text-lg text-muted-foreground font-medium">
            Market Validation Analysis Report
          </h2>
        </div>
        <div className="text-right space-y-1">
          <div className="text-4xl font-bold">
            {Math.round(validation.overallScore)}
            <span className="text-xl text-muted-foreground">/100</span>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Validation Score
          </div>
        </div>
      </div>

      <ReportHighlight type={assessment.type}>
        <ReportParagraph emphasis>
          <strong>Overall Assessment:</strong> {assessment.text}
        </ReportParagraph>
      </ReportHighlight>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <ReportMetric
          label="Validation Status"
          value={progressStatus}
          description={`${Math.round(validation.validationProgress)}% complete`}
        />
        <ReportMetric
          label="Confidence Level"
          value={Math.round(validation.confidenceLevel)}
          unit="%"
          description="Statistical confidence in findings"
        />
        <ReportMetric
          label="Report Date"
          value={
            validation.completedAt
              ? format(validation.completedAt, "MMM dd, yyyy")
              : format(new Date(), "MMM dd, yyyy")
          }
          description={validation.completedAt ? "Completed" : "Last updated"}
        />
      </div>

      <ReportParagraph>
        This comprehensive validation report analyzes the market viability,
        customer demand, and business potential for{" "}
        <strong>{validation.idea.name}</strong>. The assessment covers market
        analysis, competitive landscape, customer segmentation, business model
        validation, and risk assessment to provide actionable insights for
        strategic decision-making.
      </ReportParagraph>
    </ReportSection>
  );
}
