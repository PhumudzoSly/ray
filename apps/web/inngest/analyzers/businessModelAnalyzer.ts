import { z } from "zod";
import { PhaseAnalyzer } from "./baseAnalyzer";
import type {
  ResearchPhase,
  AnalysisResult,
  ResearchContext,
} from "@/types/research";

const RevenueStreamSchema = z.object({
  name: z.string(),
  type: z.enum([
    "subscription",
    "one-time",
    "usage-based",
    "freemium",
    "marketplace",
    "advertising",
    "licensing",
  ]),
  description: z.string(),
  targetSegment: z.string(),
  pricingModel: z.string(),
  revenueProjection: z.object({
    year1: z.string(),
    year2: z.string(),
    year3: z.string(),
  }),
  scalability: z.enum(["high", "medium", "low"]),
  competitiveAdvantage: z.string(),
});

const BusinessModelSchema = z.object({
  revenueStreams: z.array(RevenueStreamSchema),
  costStructure: z.object({
    fixedCosts: z.array(
      z.object({
        category: z.string(),
        description: z.string(),
        monthlyAmount: z.string(),
        scalability: z.enum(["fixed", "semi-variable", "variable"]),
      })
    ),
    variableCosts: z.array(
      z.object({
        category: z.string(),
        description: z.string(),
        unitCost: z.string(),
        driver: z.string(),
      })
    ),
    totalCostProjection: z.object({
      year1: z.string(),
      year2: z.string(),
      year3: z.string(),
    }),
  }),
  keyMetrics: z.object({
    customerAcquisitionCost: z.string(),
    customerLifetimeValue: z.string(),
    churnRate: z.string(),
    monthlyRecurringRevenue: z.string(),
    grossMargin: z.string(),
    paybackPeriod: z.string(),
  }),
  unitEconomics: z.object({
    revenuePerCustomer: z.string(),
    costPerCustomer: z.string(),
    contributionMargin: z.string(),
    breakEvenPoint: z.string(),
  }),
  scalabilityAnalysis: z.object({
    scalabilityFactors: z.array(z.string()),
    growthConstraints: z.array(z.string()),
    scalingStrategy: z.string(),
    resourceRequirements: z.array(z.string()),
  }),
  monetizationStrategy: z.object({
    primaryStrategy: z.string(),
    pricingStrategy: z.string(),
    valueCapture: z.string(),
    optimizationOpportunities: z.array(z.string()),
  }),
  businessModelCanvas: z.object({
    valuePropositions: z.array(z.string()),
    keyPartners: z.array(z.string()),
    keyActivities: z.array(z.string()),
    keyResources: z.array(z.string()),
    channels: z.array(z.string()),
    customerRelationships: z.array(z.string()),
  }),
  riskFactors: z.array(
    z.object({
      risk: z.string(),
      impact: z.enum(["high", "medium", "low"]),
      probability: z.enum(["high", "medium", "low"]),
      mitigation: z.string(),
    })
  ),
  sources: z.array(z.string()),
});

export class BusinessModelAnalyzer extends PhaseAnalyzer {
  async analyze(
    sessionId: string,
    phase: ResearchPhase,
    context: ResearchContext
  ): Promise<AnalysisResult> {
    const researchTopic = `Business model analysis and monetization strategies for ${context.ideaName} SaaS in ${context.industry}`;
    const searchQueries = this.getSearchQueries(context);

    // Use research-based analysis for better business model insights
    return this.conductResearchAnalysis(
      sessionId,
      phase,
      context,
      researchTopic,
      searchQueries,
      BusinessModelSchema
    );
  }

  protected getSearchQueries(context: ResearchContext): string[] {
    const industry = context.industry.toLowerCase();
    const ideaName = context.ideaName.toLowerCase();

    return [
      `${industry} SaaS business models 2024`,
      `${industry} software pricing strategies`,
      `SaaS revenue streams ${industry}`,
      `${industry} customer acquisition cost CAC`,
      `${industry} SaaS unit economics metrics`,
      `${ideaName} monetization strategies`,
      `${industry} subscription pricing models`,
      `SaaS cost structure ${industry}`,
      `${industry} software scalability challenges`,
      `${industry} SaaS profitability analysis`,
    ];
  }

  protected generateFollowUpPrompt(
    currentFindings: any,
    context: ResearchContext,
    iteration: number
  ): string {
    const gaps = this.identifyGaps(currentFindings);

    return `
Based on the previous business model analysis, please provide more detailed information on:

${gaps.map((gap) => `- ${gap}`).join("\n")}

Current analysis status:
- Revenue streams identified: ${currentFindings.revenueStreams?.length || 0}
- Cost structure: ${currentFindings.costStructure ? "Available" : "Missing"}
- Key metrics: ${currentFindings.keyMetrics ? "Available" : "Missing"}
- Unit economics: ${currentFindings.unitEconomics ? "Available" : "Missing"}
- Scalability analysis: ${currentFindings.scalabilityAnalysis ? "Available" : "Missing"}

Iteration ${iteration} - focus on specific financial projections, realistic metrics, and detailed cost breakdowns.
Provide more granular analysis of unit economics and scalability factors.
`;
  }

  protected calculateConfidence(findings: any, iteration: number): number {
    let confidence = this.getBaseConfidence(findings, iteration);

    const requiredFields = [
      "revenueStreams",
      "costStructure",
      "keyMetrics",
      "unitEconomics",
    ];

    if (this.hasRequiredFields(findings, requiredFields)) {
      confidence += 20;
    }

    // Revenue streams analysis
    const revenueCount = findings.revenueStreams?.length || 0;
    if (revenueCount >= 2) confidence += 10;
    if (revenueCount >= 3) confidence += 5;

    // Detailed revenue projections
    const hasProjections = findings.revenueStreams?.some(
      (r: any) => r.revenueProjection?.year1 && r.revenueProjection?.year2
    );
    if (hasProjections) confidence += 10;

    // Cost structure completeness
    const hasFixedCosts = findings.costStructure?.fixedCosts?.length > 0;
    const hasVariableCosts = findings.costStructure?.variableCosts?.length > 0;
    if (hasFixedCosts && hasVariableCosts) confidence += 10;

    // Key metrics availability
    const metricsCount = findings.keyMetrics
      ? Object.keys(findings.keyMetrics).length
      : 0;
    if (metricsCount >= 4) confidence += 8;

    // Unit economics analysis
    if (
      findings.unitEconomics?.contributionMargin &&
      findings.unitEconomics?.breakEvenPoint
    ) {
      confidence += 8;
    }

    // Business model canvas
    if (
      findings.businessModelCanvas &&
      Object.keys(findings.businessModelCanvas).length >= 4
    ) {
      confidence += 5;
    }

    // Scalability analysis
    if (findings.scalabilityAnalysis?.scalingStrategy) confidence += 5;

    // Risk analysis
    if (findings.riskFactors?.length >= 3) confidence += 5;

    return Math.min(confidence, 100);
  }

  protected mergeFindings(existing: any, newFindings: any): any {
    return {
      revenueStreams: this.mergeRevenueStreams(
        existing.revenueStreams,
        newFindings.revenueStreams
      ),
      costStructure: this.mergeCostStructure(
        existing.costStructure,
        newFindings.costStructure
      ),
      keyMetrics: this.mergeObjects(
        existing.keyMetrics,
        newFindings.keyMetrics
      ),
      unitEconomics: this.mergeObjects(
        existing.unitEconomics,
        newFindings.unitEconomics
      ),
      scalabilityAnalysis: this.mergeObjects(
        existing.scalabilityAnalysis,
        newFindings.scalabilityAnalysis
      ),
      monetizationStrategy: this.mergeObjects(
        existing.monetizationStrategy,
        newFindings.monetizationStrategy
      ),
      businessModelCanvas: this.mergeBusinessModelCanvas(
        existing.businessModelCanvas,
        newFindings.businessModelCanvas
      ),
      riskFactors: this.mergeArrays(
        existing.riskFactors,
        newFindings.riskFactors,
        "risk"
      ),
      sources: this.mergeArrays(existing.sources, newFindings.sources),
    };
  }

  private identifyGaps(findings: any): string[] {
    const gaps: string[] = [];

    const revenueCount = findings.revenueStreams?.length || 0;
    if (revenueCount < 2) {
      gaps.push("More revenue streams identification (need at least 2-3)");
    }

    // Check for revenue projections
    const hasProjections = findings.revenueStreams?.some(
      (r: any) => r.revenueProjection?.year1
    );
    if (!hasProjections) {
      gaps.push("Revenue projections for each stream");
    }

    // Cost structure analysis
    if (
      !findings.costStructure?.fixedCosts ||
      findings.costStructure.fixedCosts.length < 3
    ) {
      gaps.push("Detailed fixed costs analysis");
    }
    if (
      !findings.costStructure?.variableCosts ||
      findings.costStructure.variableCosts.length < 2
    ) {
      gaps.push("Variable costs identification and analysis");
    }

    // Key metrics
    const requiredMetrics = [
      "customerAcquisitionCost",
      "customerLifetimeValue",
      "churnRate",
      "grossMargin",
    ];
    const missingMetrics = requiredMetrics.filter(
      (metric) => !findings.keyMetrics?.[metric]
    );
    if (missingMetrics.length > 0) {
      gaps.push(`Key metrics calculation: ${missingMetrics.join(", ")}`);
    }

    // Unit economics
    if (!findings.unitEconomics?.contributionMargin) {
      gaps.push("Unit economics and contribution margin analysis");
    }
    if (!findings.unitEconomics?.breakEvenPoint) {
      gaps.push("Break-even point analysis");
    }

    // Scalability analysis
    if (!findings.scalabilityAnalysis?.scalingStrategy) {
      gaps.push("Scalability strategy and growth constraints analysis");
    }

    // Business model canvas
    if (
      !findings.businessModelCanvas ||
      Object.keys(findings.businessModelCanvas).length < 4
    ) {
      gaps.push("Complete business model canvas");
    }

    // Risk analysis
    if (!findings.riskFactors || findings.riskFactors.length < 3) {
      gaps.push("Business model risk assessment");
    }

    return gaps;
  }

  private mergeRevenueStreams(
    existing: any[] = [],
    newStreams: any[] = []
  ): any[] {
    if (!newStreams) return existing;
    if (!existing) return newStreams;

    const existingNames = new Set(existing.map((s) => s.name.toLowerCase()));
    const uniqueNew = newStreams.filter(
      (s) => !existingNames.has(s.name.toLowerCase())
    );

    // Merge existing streams with additional details
    const merged = existing.map((existingStream) => {
      const newStream = newStreams.find(
        (s) => s.name.toLowerCase() === existingStream.name.toLowerCase()
      );

      if (newStream) {
        return {
          ...existingStream,
          ...newStream,
          revenueProjection: {
            ...existingStream.revenueProjection,
            ...newStream.revenueProjection,
          },
        };
      }

      return existingStream;
    });

    return [...merged, ...uniqueNew];
  }

  private mergeCostStructure(existing: any, newCostStructure: any): any {
    if (!existing) return newCostStructure;
    if (!newCostStructure) return existing;

    return {
      ...existing,
      ...newCostStructure,
      fixedCosts: this.mergeArrays(
        existing.fixedCosts,
        newCostStructure.fixedCosts,
        "category"
      ),
      variableCosts: this.mergeArrays(
        existing.variableCosts,
        newCostStructure.variableCosts,
        "category"
      ),
      totalCostProjection: {
        ...existing.totalCostProjection,
        ...newCostStructure.totalCostProjection,
      },
    };
  }

  private mergeBusinessModelCanvas(existing: any, newCanvas: any): any {
    if (!existing) return newCanvas;
    if (!newCanvas) return existing;

    return {
      valuePropositions: this.mergeArrays(
        existing.valuePropositions,
        newCanvas.valuePropositions
      ),
      keyPartners: this.mergeArrays(
        existing.keyPartners,
        newCanvas.keyPartners
      ),
      keyActivities: this.mergeArrays(
        existing.keyActivities,
        newCanvas.keyActivities
      ),
      keyResources: this.mergeArrays(
        existing.keyResources,
        newCanvas.keyResources
      ),
      channels: this.mergeArrays(existing.channels, newCanvas.channels),
      customerRelationships: this.mergeArrays(
        existing.customerRelationships,
        newCanvas.customerRelationships
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
