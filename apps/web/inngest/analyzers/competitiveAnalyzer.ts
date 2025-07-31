import { z } from "zod";
import { PhaseAnalyzer } from "./baseAnalyzer";
import type {
  ResearchPhase,
  AnalysisResult,
  ResearchContext,
} from "@/types/research";

const CompetitorSchema = z.object({
  name: z.string(),
  website: z.string().optional(),
  description: z.string(),
  marketShare: z.string().optional(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  pricing: z
    .object({
      model: z.string(),
      range: z.string(),
      freeTier: z.boolean(),
    })
    .optional(),
  targetAudience: z.string(),
  keyFeatures: z.array(z.string()),
  threatLevel: z.enum(["high", "medium", "low"]),
  differentiators: z.array(z.string()),
});

const CompetitiveAnalysisSchema = z.object({
  directCompetitors: z.array(CompetitorSchema),
  indirectCompetitors: z.array(CompetitorSchema),
  competitiveAdvantages: z.array(
    z.object({
      advantage: z.string(),
      strength: z.enum(["strong", "moderate", "weak"]),
      sustainability: z.enum(["high", "medium", "low"]),
    })
  ),
  marketPositioning: z.object({
    recommendedPosition: z.string(),
    differentiationStrategy: z.string(),
    valueProposition: z.string(),
    targetSegment: z.string(),
  }),
  competitiveGaps: z.array(
    z.object({
      gap: z.string(),
      opportunity: z.string(),
      difficulty: z.enum(["easy", "moderate", "hard"]),
      timeToCapture: z.string(),
    })
  ),
  pricingAnalysis: z.object({
    marketRange: z.string(),
    recommendedPricing: z.string(),
    pricingStrategy: z.string(),
    justification: z.string(),
  }),
  competitiveThreats: z.array(
    z.object({
      threat: z.string(),
      probability: z.enum(["high", "medium", "low"]),
      impact: z.enum(["high", "medium", "low"]),
      mitigation: z.string(),
    })
  ),
  sources: z.array(z.string()),
});

export class CompetitiveAnalyzer extends PhaseAnalyzer {
  private isDeepDive: boolean;

  constructor(isDeepDive: boolean = false) {
    super();
    this.isDeepDive = isDeepDive;
    this.maxIterations = isDeepDive ? 8 : 4;
  }

  async analyze(
    sessionId: string,
    phase: ResearchPhase,
    context: ResearchContext
  ): Promise<AnalysisResult> {
    const researchTopic = this.isDeepDive
      ? `Deep competitive analysis for ${context.ideaName} in ${context.industry} market`
      : `Competitive overview for ${context.ideaName} SaaS solution`;

    const searchQueries = this.getSearchQueries(context);

    // Use research-based analysis for better competitive insights
    return this.conductResearchAnalysis(
      sessionId,
      phase,
      context,
      researchTopic,
      searchQueries,
      CompetitiveAnalysisSchema
    );
  }

  protected getSearchQueries(context: ResearchContext): string[] {
    const industry = context.industry.toLowerCase();
    const ideaName = context.ideaName.toLowerCase();
    const problemSolved = context.problemSolved?.toLowerCase() || "";

    const baseQueries = [
      `${industry} SaaS competitors 2024`,
      `${ideaName} competitors alternatives`,
      `${industry} software market leaders`,
      `${problemSolved} ${industry} solutions`,
      `${industry} SaaS pricing models 2024`,
    ];

    if (this.isDeepDive) {
      return [
        ...baseQueries,
        `${industry} competitive landscape analysis`,
        `${industry} SaaS market share leaders`,
        `${ideaName} vs competitors comparison`,
        `${industry} software pricing strategies`,
        `${industry} SaaS funding acquisitions 2024`,
        `${problemSolved} enterprise solutions`,
        `${industry} digital transformation competitors`,
      ];
    }

    return baseQueries;
  }

  protected generateFollowUpPrompt(
    currentFindings: any,
    context: ResearchContext,
    iteration: number
  ): string {
    const gaps = this.identifyGaps(currentFindings);

    return `
Based on the previous competitive analysis, please provide more detailed information on:

${gaps.map((gap) => `- ${gap}`).join("\n")}

Current analysis status:
- Direct competitors identified: ${currentFindings.directCompetitors?.length || 0}
- Indirect competitors identified: ${currentFindings.indirectCompetitors?.length || 0}
- Competitive advantages: ${currentFindings.competitiveAdvantages?.length || 0}
- Market positioning: ${currentFindings.marketPositioning ? "Available" : "Missing"}
- Pricing analysis: ${currentFindings.pricingAnalysis ? "Available" : "Missing"}

Iteration ${iteration} - provide more specific details, pricing information, and strategic insights.
${this.isDeepDive ? "This is a deep dive analysis - be comprehensive and detailed." : ""}
`;
  }

  protected calculateConfidence(findings: any, iteration: number): number {
    let confidence = this.getBaseConfidence(findings, iteration);

    const requiredFields = [
      "directCompetitors",
      "competitiveAdvantages",
      "marketPositioning",
    ];

    if (this.hasRequiredFields(findings, requiredFields)) {
      confidence += 15;
    }

    // Competitor quantity bonuses
    const directCount = findings.directCompetitors?.length || 0;
    const indirectCount = findings.indirectCompetitors?.length || 0;

    if (this.isDeepDive) {
      if (directCount >= 5) confidence += 10;
      if (indirectCount >= 3) confidence += 5;
      if (findings.pricingAnalysis) confidence += 10;
      if (findings.competitiveThreats?.length >= 3) confidence += 5;
    } else {
      if (directCount >= 3) confidence += 10;
      if (indirectCount >= 2) confidence += 5;
    }

    // Quality bonuses
    if (findings.competitiveAdvantages?.length >= 3) confidence += 5;
    if (findings.competitiveGaps?.length >= 2) confidence += 5;

    // Deep analysis bonuses
    if (findings.directCompetitors?.some((c: any) => c.pricing))
      confidence += 5;
    if (findings.marketPositioning?.differentiationStrategy) confidence += 5;

    return Math.min(confidence, 100);
  }

  protected mergeFindings(existing: any, newFindings: any): any {
    return {
      directCompetitors: this.mergeCompetitors(
        existing.directCompetitors,
        newFindings.directCompetitors
      ),
      indirectCompetitors: this.mergeCompetitors(
        existing.indirectCompetitors,
        newFindings.indirectCompetitors
      ),
      competitiveAdvantages: this.mergeArrays(
        existing.competitiveAdvantages,
        newFindings.competitiveAdvantages,
        "advantage"
      ),
      marketPositioning:
        newFindings.marketPositioning || existing.marketPositioning,
      competitiveGaps: this.mergeArrays(
        existing.competitiveGaps,
        newFindings.competitiveGaps,
        "gap"
      ),
      pricingAnalysis: newFindings.pricingAnalysis || existing.pricingAnalysis,
      competitiveThreats: this.mergeArrays(
        existing.competitiveThreats,
        newFindings.competitiveThreats,
        "threat"
      ),
      sources: this.mergeArrays(existing.sources, newFindings.sources),
    };
  }

  private identifyGaps(findings: any): string[] {
    const gaps: string[] = [];

    const directCount = findings.directCompetitors?.length || 0;
    const indirectCount = findings.indirectCompetitors?.length || 0;

    if (this.isDeepDive) {
      if (directCount < 5)
        gaps.push("More direct competitors analysis (need 5-8)");
      if (indirectCount < 3)
        gaps.push("More indirect competitors analysis (need 3-5)");
      if (!findings.pricingAnalysis)
        gaps.push("Comprehensive pricing analysis");
      if (
        !findings.competitiveThreats ||
        findings.competitiveThreats.length < 3
      ) {
        gaps.push("Competitive threats assessment");
      }
    } else {
      if (directCount < 3)
        gaps.push("More direct competitors analysis (need 3-5)");
      if (indirectCount < 2)
        gaps.push("More indirect competitors analysis (need 2-3)");
    }

    if (!findings.marketPositioning?.differentiationStrategy) {
      gaps.push("Detailed differentiation strategy");
    }
    if (
      !findings.competitiveAdvantages ||
      findings.competitiveAdvantages.length < 3
    ) {
      gaps.push("More competitive advantages identification");
    }
    if (!findings.competitiveGaps || findings.competitiveGaps.length < 2) {
      gaps.push("Market gaps and opportunities analysis");
    }

    // Check for pricing information in competitors
    const hasDetailedPricing = findings.directCompetitors?.some(
      (c: any) => c.pricing
    );
    if (!hasDetailedPricing) {
      gaps.push("Competitor pricing information");
    }

    return gaps;
  }

  private mergeCompetitors(
    existing: any[] = [],
    newCompetitors: any[] = []
  ): any[] {
    if (!newCompetitors) return existing;
    if (!existing) return newCompetitors;

    const existingNames = new Set(existing.map((c) => c.name.toLowerCase()));
    const uniqueNew = newCompetitors.filter(
      (c) => !existingNames.has(c.name.toLowerCase())
    );

    // Merge existing competitors with additional details from new analysis
    const merged = existing.map((existingComp) => {
      const newComp = newCompetitors.find(
        (c) => c.name.toLowerCase() === existingComp.name.toLowerCase()
      );

      if (newComp) {
        return {
          ...existingComp,
          ...newComp,
          strengths: Array.from(
            new Set([
              ...(existingComp.strengths || []),
              ...(newComp.strengths || []),
            ])
          ),
          weaknesses: Array.from(
            new Set([
              ...(existingComp.weaknesses || []),
              ...(newComp.weaknesses || []),
            ])
          ),
          keyFeatures: Array.from(
            new Set([
              ...(existingComp.keyFeatures || []),
              ...(newComp.keyFeatures || []),
            ])
          ),
        };
      }

      return existingComp;
    });

    return [...merged, ...uniqueNew];
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

// Factory functions for different competitive analysis types
export class CompetitiveOverviewAnalyzer extends CompetitiveAnalyzer {
  constructor() {
    super(false); // Overview mode
  }
}

export class CompetitiveDeepDiveAnalyzer extends CompetitiveAnalyzer {
  constructor() {
    super(true); // Deep dive mode
  }
}
