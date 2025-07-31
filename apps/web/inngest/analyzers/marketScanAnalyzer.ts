import { z } from "zod";
import { PhaseAnalyzer } from "./baseAnalyzer";
import type {
  ResearchPhase,
  AnalysisResult,
  ResearchContext,
} from "@/types/research";

const MarketScanSchema = z.object({
  marketSize: z.object({
    total: z.string().describe("Total addressable market size"),
    serviceable: z.string().describe("Serviceable addressable market"),
    obtainable: z.string().describe("Serviceable obtainable market"),
    confidence: z.number().min(0).max(100),
  }),
  marketTrends: z.array(
    z.object({
      trend: z.string(),
      impact: z.enum(["positive", "negative", "neutral"]),
      timeframe: z.string(),
      confidence: z.number().min(0).max(100),
    })
  ),
  marketOpportunities: z.array(
    z.object({
      opportunity: z.string(),
      potential: z.enum(["high", "medium", "low"]),
      timeToMarket: z.string(),
      requirements: z.array(z.string()),
    })
  ),
  industryGrowthRate: z.object({
    annual: z.string(),
    projected: z.string(),
    drivers: z.array(z.string()),
  }),
  keyMarketSegments: z.array(
    z.object({
      segment: z.string(),
      size: z.string(),
      growthRate: z.string(),
      attractiveness: z.enum(["high", "medium", "low"]),
    })
  ),
  regulatoryEnvironment: z.object({
    currentRegulations: z.array(z.string()),
    upcomingChanges: z.array(z.string()),
    complianceRequirements: z.array(z.string()),
    impact: z.enum(["favorable", "neutral", "challenging"]),
  }),
  marketBarriers: z.array(
    z.object({
      barrier: z.string(),
      severity: z.enum(["high", "medium", "low"]),
      mitigation: z.string(),
    })
  ),
  sources: z.array(z.string()).describe("Sources used for this analysis"),
});

export class MarketScanAnalyzer extends PhaseAnalyzer {
  async analyze(
    sessionId: string,
    phase: ResearchPhase,
    context: ResearchContext
  ): Promise<AnalysisResult> {
    const researchTopic = `Market analysis for ${context.ideaName} in ${context.industry} industry`;
    const searchQueries = this.getSearchQueries(context);

    // Use research-based analysis for better insights
    return this.conductResearchAnalysis(
      sessionId,
      phase,
      context,
      researchTopic,
      searchQueries,
      MarketScanSchema
    );
  }

  protected getSearchQueries(context: ResearchContext): string[] {
    const industry = context.industry.toLowerCase();
    const ideaName = context.ideaName.toLowerCase();

    return [
      `${industry} market size 2024 TAM SAM SOM`,
      `${industry} industry growth rate trends 2024`,
      `${industry} SaaS market opportunities 2024`,
      `${ideaName} ${industry} competitors market share`,
      `${industry} software regulatory requirements compliance`,
      `${industry} market barriers entry challenges`,
      `${industry} digital transformation trends 2024`,
      `${context.targetAudience || industry} software spending trends`,
    ];
  }

  protected generateFollowUpPrompt(
    currentFindings: any,
    context: ResearchContext,
    iteration: number
  ): string {
    const gaps = this.identifyGaps(currentFindings);

    return `
Based on the previous market scan analysis, please provide more detailed information on:

${gaps.map((gap) => `- ${gap}`).join("\n")}

Current findings summary:
- Market size data: ${currentFindings.marketSize ? "Available" : "Missing"}
- Trends identified: ${currentFindings.marketTrends?.length || 0}
- Opportunities found: ${currentFindings.marketOpportunities?.length || 0}
- Regulatory analysis: ${currentFindings.regulatoryEnvironment ? "Available" : "Missing"}

Please focus on filling the gaps and providing more specific, quantitative data where possible.
Iteration ${iteration} - be more specific and detailed than previous responses.
`;
  }

  protected calculateConfidence(findings: any, iteration: number): number {
    let confidence = this.getBaseConfidence(findings, iteration);

    // Required fields for market scan
    const requiredFields = [
      "marketSize",
      "marketTrends",
      "marketOpportunities",
      "industryGrowthRate",
      "keyMarketSegments",
    ];

    if (this.hasRequiredFields(findings, requiredFields)) {
      confidence += 20;
    }

    // Bonus for detailed market size analysis
    if (
      findings.marketSize?.total &&
      findings.marketSize?.serviceable &&
      findings.marketSize?.obtainable
    ) {
      confidence += 10;
    }

    // Bonus for multiple trends and opportunities
    if (findings.marketTrends?.length >= 3) confidence += 5;
    if (findings.marketOpportunities?.length >= 2) confidence += 5;

    // Bonus for regulatory analysis
    if (findings.regulatoryEnvironment?.currentRegulations?.length > 0) {
      confidence += 5;
    }

    return Math.min(confidence, 100);
  }

  protected mergeFindings(existing: any, newFindings: any): any {
    return {
      marketSize: newFindings.marketSize || existing.marketSize,
      marketTrends: this.mergeArrays(
        existing.marketTrends,
        newFindings.marketTrends,
        "trend"
      ),
      marketOpportunities: this.mergeArrays(
        existing.marketOpportunities,
        newFindings.marketOpportunities,
        "opportunity"
      ),
      industryGrowthRate:
        newFindings.industryGrowthRate || existing.industryGrowthRate,
      keyMarketSegments: this.mergeArrays(
        existing.keyMarketSegments,
        newFindings.keyMarketSegments,
        "segment"
      ),
      regulatoryEnvironment:
        newFindings.regulatoryEnvironment || existing.regulatoryEnvironment,
      marketBarriers: this.mergeArrays(
        existing.marketBarriers,
        newFindings.marketBarriers,
        "barrier"
      ),
      sources: this.mergeArrays(existing.sources, newFindings.sources),
    };
  }

  private identifyGaps(findings: any): string[] {
    const gaps: string[] = [];

    if (!findings.marketSize?.total) {
      gaps.push("Total Addressable Market (TAM) calculation");
    }
    if (!findings.marketSize?.serviceable) {
      gaps.push("Serviceable Addressable Market (SAM) estimation");
    }
    if (!findings.marketTrends || findings.marketTrends.length < 3) {
      gaps.push("More comprehensive market trends analysis");
    }
    if (
      !findings.marketOpportunities ||
      findings.marketOpportunities.length < 2
    ) {
      gaps.push("Additional market opportunities identification");
    }
    if (!findings.industryGrowthRate?.annual) {
      gaps.push("Industry growth rate data");
    }
    if (!findings.keyMarketSegments || findings.keyMarketSegments.length < 2) {
      gaps.push("Market segmentation analysis");
    }
    if (!findings.regulatoryEnvironment) {
      gaps.push("Regulatory environment assessment");
    }

    return gaps;
  }

  private mergeArrays(
    existing: any[] = [],
    newItems: any[] = [],
    uniqueKey?: string
  ): any[] {
    if (!newItems) return existing;
    if (!existing) return newItems;

    if (uniqueKey) {
      const existingKeys = new Set(existing.map((item) => item[uniqueKey]));
      const uniqueNewItems = newItems.filter(
        (item) => !existingKeys.has(item[uniqueKey])
      );
      return [...existing, ...uniqueNewItems];
    }

    // For simple arrays (like sources), remove duplicates
    const combined = [...existing, ...newItems];
    return Array.from(new Set(combined));
  }
}
