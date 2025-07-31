import { z } from "zod";
import { PhaseAnalyzer } from "./baseAnalyzer";
import type {
  ResearchPhase,
  AnalysisResult,
  ResearchContext,
} from "@/types/research";

const CustomerSegmentSchema = z.object({
  name: z.string(),
  description: z.string(),
  size: z.string(),
  demographics: z.object({
    companySize: z.string().optional(),
    industry: z.string().optional(),
    geography: z.string().optional(),
    role: z.string().optional(),
  }),
  painPoints: z.array(z.string()),
  currentSolutions: z.array(z.string()),
  buyingBehavior: z.object({
    decisionMakers: z.array(z.string()),
    buyingProcess: z.string(),
    budgetRange: z.string().optional(),
    evaluationCriteria: z.array(z.string()),
  }),
  willingness: z.object({
    toPay: z.enum(["high", "medium", "low"]),
    toSwitch: z.enum(["high", "medium", "low"]),
    toAdopt: z.enum(["high", "medium", "low"]),
  }),
  priority: z.enum(["primary", "secondary", "tertiary"]),
});

const CustomerValidationSchema = z.object({
  targetSegments: z.array(CustomerSegmentSchema),
  problemValidation: z.object({
    problemSeverity: z.enum(["critical", "significant", "moderate", "minor"]),
    problemFrequency: z.enum(["daily", "weekly", "monthly", "occasionally"]),
    currentCosts: z.string(),
    impactOfNotSolving: z.string(),
    urgency: z.enum(["immediate", "short-term", "medium-term", "long-term"]),
  }),
  solutionFit: z.object({
    productMarketFit: z.enum(["strong", "moderate", "weak"]),
    featureImportance: z.array(
      z.object({
        feature: z.string(),
        importance: z.enum(["must-have", "nice-to-have", "not-important"]),
        currentGap: z.boolean(),
      })
    ),
    usabilityRequirements: z.array(z.string()),
    integrationNeeds: z.array(z.string()),
  }),
  adoptionBarriers: z.array(
    z.object({
      barrier: z.string(),
      severity: z.enum(["high", "medium", "low"]),
      affectedSegments: z.array(z.string()),
      mitigation: z.string(),
    })
  ),
  valueProposition: z.object({
    primaryValue: z.string(),
    quantifiableBenefits: z.array(
      z.object({
        benefit: z.string(),
        metric: z.string(),
        estimatedImprovement: z.string(),
      })
    ),
    emotionalBenefits: z.array(z.string()),
    competitiveAdvantage: z.string(),
  }),
  customerJourney: z.object({
    awareness: z.string(),
    consideration: z.string(),
    evaluation: z.string(),
    purchase: z.string(),
    onboarding: z.string(),
    retention: z.string(),
  }),
  feedbackChannels: z.array(
    z.object({
      channel: z.string(),
      effectiveness: z.enum(["high", "medium", "low"]),
      cost: z.enum(["high", "medium", "low"]),
      timeframe: z.string(),
    })
  ),
  sources: z.array(z.string()),
});

export class CustomerValidationAnalyzer extends PhaseAnalyzer {
  async analyze(
    sessionId: string,
    phase: ResearchPhase,
    context: ResearchContext
  ): Promise<AnalysisResult> {
    const researchTopic = `Customer validation and market research for ${context.ideaName} targeting ${context.targetAudience || context.industry + " professionals"}`;
    const searchQueries = this.getSearchQueries(context);

    // Use research-based analysis for better customer insights
    return this.conductResearchAnalysis(
      sessionId,
      phase,
      context,
      researchTopic,
      searchQueries,
      CustomerValidationSchema
    );
  }

  protected getSearchQueries(context: ResearchContext): string[] {
    const industry = context.industry.toLowerCase();
    const targetAudience =
      context.targetAudience?.toLowerCase() || `${industry} professionals`;
    const problemSolved = context.problemSolved?.toLowerCase() || "";

    return [
      `${targetAudience} pain points challenges 2024`,
      `${industry} customer personas demographics`,
      `${problemSolved} customer research surveys`,
      `${industry} software buying behavior decision makers`,
      `${targetAudience} willingness to pay SaaS tools`,
      `${industry} customer journey mapping`,
      `${problemSolved} adoption barriers challenges`,
      `${industry} customer feedback validation methods`,
      `${targetAudience} software evaluation criteria`,
      `${industry} customer retention strategies`,
    ];
  }

  protected generateFollowUpPrompt(
    currentFindings: any,
    context: ResearchContext,
    iteration: number
  ): string {
    const gaps = this.identifyGaps(currentFindings);

    return `
Based on the previous customer validation analysis, please provide more detailed information on:

${gaps.map((gap) => `- ${gap}`).join("\n")}

Current validation status:
- Customer segments identified: ${currentFindings.targetSegments?.length || 0}
- Problem validation: ${currentFindings.problemValidation ? "Available" : "Missing"}
- Solution fit analysis: ${currentFindings.solutionFit ? "Available" : "Missing"}
- Adoption barriers: ${currentFindings.adoptionBarriers?.length || 0}
- Value proposition: ${currentFindings.valueProposition ? "Available" : "Missing"}

Iteration ${iteration} - focus on specific customer personas, quantifiable benefits, and actionable insights.
Provide more detailed demographic information and realistic customer scenarios.
`;
  }

  protected calculateConfidence(findings: any, iteration: number): number {
    let confidence = this.getBaseConfidence(findings, iteration);

    const requiredFields = [
      "targetSegments",
      "problemValidation",
      "solutionFit",
      "valueProposition",
    ];

    if (this.hasRequiredFields(findings, requiredFields)) {
      confidence += 20;
    }

    // Segment analysis bonuses
    const segmentCount = findings.targetSegments?.length || 0;
    if (segmentCount >= 2) confidence += 10;
    if (segmentCount >= 3) confidence += 5;

    // Detailed segment analysis
    const hasDetailedSegments = findings.targetSegments?.some(
      (s: any) => s.demographics && s.painPoints?.length > 0 && s.buyingBehavior
    );
    if (hasDetailedSegments) confidence += 10;

    // Problem validation depth
    if (
      findings.problemValidation?.problemSeverity &&
      findings.problemValidation?.currentCosts
    ) {
      confidence += 8;
    }

    // Solution fit analysis
    if (findings.solutionFit?.featureImportance?.length >= 3) confidence += 5;

    // Value proposition quality
    if (findings.valueProposition?.quantifiableBenefits?.length >= 2)
      confidence += 8;

    // Customer journey mapping
    if (
      findings.customerJourney &&
      Object.keys(findings.customerJourney).length >= 4
    ) {
      confidence += 5;
    }

    // Adoption barriers analysis
    if (findings.adoptionBarriers?.length >= 2) confidence += 5;

    return Math.min(confidence, 100);
  }

  protected mergeFindings(existing: any, newFindings: any): any {
    return {
      targetSegments: this.mergeSegments(
        existing.targetSegments,
        newFindings.targetSegments
      ),
      problemValidation: this.mergeObjects(
        existing.problemValidation,
        newFindings.problemValidation
      ),
      solutionFit: this.mergeSolutionFit(
        existing.solutionFit,
        newFindings.solutionFit
      ),
      adoptionBarriers: this.mergeArrays(
        existing.adoptionBarriers,
        newFindings.adoptionBarriers,
        "barrier"
      ),
      valueProposition: this.mergeValueProposition(
        existing.valueProposition,
        newFindings.valueProposition
      ),
      customerJourney: this.mergeObjects(
        existing.customerJourney,
        newFindings.customerJourney
      ),
      feedbackChannels: this.mergeArrays(
        existing.feedbackChannels,
        newFindings.feedbackChannels,
        "channel"
      ),
      sources: this.mergeArrays(existing.sources, newFindings.sources),
    };
  }

  private identifyGaps(findings: any): string[] {
    const gaps: string[] = [];

    const segmentCount = findings.targetSegments?.length || 0;
    if (segmentCount < 2) {
      gaps.push("More customer segments identification (need at least 2-3)");
    }

    // Check segment detail completeness
    const hasDetailedSegments = findings.targetSegments?.every(
      (s: any) => s.demographics && s.painPoints?.length > 0 && s.buyingBehavior
    );
    if (!hasDetailedSegments) {
      gaps.push(
        "More detailed customer segment analysis (demographics, pain points, buying behavior)"
      );
    }

    if (!findings.problemValidation?.problemSeverity) {
      gaps.push("Problem severity assessment");
    }

    if (!findings.problemValidation?.currentCosts) {
      gaps.push("Current cost analysis of the problem");
    }

    if (
      !findings.solutionFit?.featureImportance ||
      findings.solutionFit.featureImportance.length < 3
    ) {
      gaps.push("Feature importance analysis (must-have vs nice-to-have)");
    }

    if (
      !findings.valueProposition?.quantifiableBenefits ||
      findings.valueProposition.quantifiableBenefits.length < 2
    ) {
      gaps.push("Quantifiable benefits and ROI analysis");
    }

    if (
      !findings.customerJourney ||
      Object.keys(findings.customerJourney).length < 4
    ) {
      gaps.push("Complete customer journey mapping");
    }

    if (!findings.adoptionBarriers || findings.adoptionBarriers.length < 2) {
      gaps.push("Adoption barriers identification and mitigation strategies");
    }

    if (!findings.feedbackChannels || findings.feedbackChannels.length < 3) {
      gaps.push("Customer feedback and validation channels");
    }

    return gaps;
  }

  private mergeSegments(existing: any[] = [], newSegments: any[] = []): any[] {
    if (!newSegments) return existing;
    if (!existing) return newSegments;

    const existingNames = new Set(existing.map((s) => s.name.toLowerCase()));
    const uniqueNew = newSegments.filter(
      (s) => !existingNames.has(s.name.toLowerCase())
    );

    // Merge existing segments with additional details
    const merged = existing.map((existingSegment) => {
      const newSegment = newSegments.find(
        (s) => s.name.toLowerCase() === existingSegment.name.toLowerCase()
      );

      if (newSegment) {
        return {
          ...existingSegment,
          ...newSegment,
          painPoints: Array.from(
            new Set([
              ...(existingSegment.painPoints || []),
              ...(newSegment.painPoints || []),
            ])
          ),
          currentSolutions: Array.from(
            new Set([
              ...(existingSegment.currentSolutions || []),
              ...(newSegment.currentSolutions || []),
            ])
          ),
          demographics: {
            ...existingSegment.demographics,
            ...newSegment.demographics,
          },
          buyingBehavior: {
            ...existingSegment.buyingBehavior,
            ...newSegment.buyingBehavior,
          },
        };
      }

      return existingSegment;
    });

    return [...merged, ...uniqueNew];
  }

  private mergeSolutionFit(existing: any, newSolutionFit: any): any {
    if (!existing) return newSolutionFit;
    if (!newSolutionFit) return existing;

    return {
      ...existing,
      ...newSolutionFit,
      featureImportance: this.mergeArrays(
        existing.featureImportance,
        newSolutionFit.featureImportance,
        "feature"
      ),
      usabilityRequirements: this.mergeArrays(
        existing.usabilityRequirements,
        newSolutionFit.usabilityRequirements
      ),
      integrationNeeds: this.mergeArrays(
        existing.integrationNeeds,
        newSolutionFit.integrationNeeds
      ),
    };
  }

  private mergeValueProposition(existing: any, newValueProp: any): any {
    if (!existing) return newValueProp;
    if (!newValueProp) return existing;

    return {
      ...existing,
      ...newValueProp,
      quantifiableBenefits: this.mergeArrays(
        existing.quantifiableBenefits,
        newValueProp.quantifiableBenefits,
        "benefit"
      ),
      emotionalBenefits: this.mergeArrays(
        existing.emotionalBenefits,
        newValueProp.emotionalBenefits
      ),
    };
  }

  private mergeObjects(existing: any, newObj: any): any {
    if (!existing) return newObj;
    if (!newObj) return existing;
    return { ...existing, ...newObj };
  }

  private mergeArrays(
    existing: any[] = [],
    newItems: any[] = [],
    uniqueKey?: string
  ): any[] {
    if (!newItems) return existing;
    if (!existing) return newItems;

    if (uniqueKey) {
      const existingKeys = new Set(
        existing.map((item) => item[uniqueKey]?.toLowerCase())
      );
      const uniqueNewItems = newItems.filter(
        (item) => !existingKeys.has(item[uniqueKey]?.toLowerCase())
      );
      return [...existing, ...uniqueNewItems];
    }

    const combined = [...existing, ...newItems];
    return Array.from(new Set(combined));
  }
}
