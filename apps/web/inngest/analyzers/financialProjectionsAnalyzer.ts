import { z } from "zod";
import { PhaseAnalyzer } from "./baseAnalyzer";
import type {
  ResearchPhase,
  AnalysisResult,
  ResearchContext,
} from "@/types/research";

const FinancialProjectionsSchema = z.object({
  revenueProjections: z.object({
    year1: z.object({
      q1: z.string(),
      q2: z.string(),
      q3: z.string(),
      q4: z.string(),
      total: z.string(),
      customers: z.string(),
      averageRevenuePerUser: z.string(),
    }),
    year2: z.object({
      total: z.string(),
      customers: z.string(),
      averageRevenuePerUser: z.string(),
      growthRate: z.string(),
    }),
    year3: z.object({
      total: z.string(),
      customers: z.string(),
      averageRevenuePerUser: z.string(),
      growthRate: z.string(),
    }),
    assumptions: z.array(z.string()),
  }),
  costProjections: z.object({
    year1: z.object({
      costOfGoodsSold: z.string(),
      salesAndMarketing: z.string(),
      researchAndDevelopment: z.string(),
      generalAndAdministrative: z.string(),
      total: z.string(),
    }),
    year2: z.object({
      costOfGoodsSold: z.string(),
      salesAndMarketing: z.string(),
      researchAndDevelopment: z.string(),
      generalAndAdministrative: z.string(),
      total: z.string(),
    }),
    year3: z.object({
      costOfGoodsSold: z.string(),
      salesAndMarketing: z.string(),
      researchAndDevelopment: z.string(),
      generalAndAdministrative: z.string(),
      total: z.string(),
    }),
    assumptions: z.array(z.string()),
  }),
  profitabilityAnalysis: z.object({
    year1: z.object({
      grossProfit: z.string(),
      grossMargin: z.string(),
      operatingProfit: z.string(),
      operatingMargin: z.string(),
      netProfit: z.string(),
      netMargin: z.string(),
    }),
    year2: z.object({
      grossProfit: z.string(),
      grossMargin: z.string(),
      operatingProfit: z.string(),
      operatingMargin: z.string(),
      netProfit: z.string(),
      netMargin: z.string(),
    }),
    year3: z.object({
      grossProfit: z.string(),
      grossMargin: z.string(),
      operatingProfit: z.string(),
      operatingMargin: z.string(),
      netProfit: z.string(),
      netMargin: z.string(),
    }),
    breakEvenAnalysis: z.object({
      breakEvenMonth: z.string(),
      breakEvenRevenue: z.string(),
      breakEvenCustomers: z.string(),
    }),
  }),
  cashFlowProjections: z.object({
    year1: z.object({
      operatingCashFlow: z.string(),
      investingCashFlow: z.string(),
      financingCashFlow: z.string(),
      netCashFlow: z.string(),
      endingCashBalance: z.string(),
    }),
    year2: z.object({
      operatingCashFlow: z.string(),
      netCashFlow: z.string(),
      endingCashBalance: z.string(),
    }),
    year3: z.object({
      operatingCashFlow: z.string(),
      netCashFlow: z.string(),
      endingCashBalance: z.string(),
    }),
    cashBurnRate: z.string(),
    runwayMonths: z.string(),
  }),
  keyFinancialMetrics: z.object({
    customerAcquisitionCost: z.object({
      year1: z.string(),
      year2: z.string(),
      year3: z.string(),
    }),
    customerLifetimeValue: z.object({
      year1: z.string(),
      year2: z.string(),
      year3: z.string(),
    }),
    ltvcacRatio: z.object({
      year1: z.string(),
      year2: z.string(),
      year3: z.string(),
    }),
    monthlyRecurringRevenue: z.object({
      year1End: z.string(),
      year2End: z.string(),
      year3End: z.string(),
    }),
    churnRate: z.object({
      year1: z.string(),
      year2: z.string(),
      year3: z.string(),
    }),
  }),
  fundingRequirements: z.object({
    totalFundingNeeded: z.string(),
    fundingStages: z.array(
      z.object({
        stage: z.string(),
        amount: z.string(),
        timeline: z.string(),
        purpose: z.string(),
        milestones: z.array(z.string()),
      })
    ),
    useOfFunds: z.array(
      z.object({
        category: z.string(),
        amount: z.string(),
        percentage: z.string(),
        justification: z.string(),
      })
    ),
  }),
  scenarioAnalysis: z.object({
    baseCase: z.object({
      description: z.string(),
      year3Revenue: z.string(),
      probability: z.string(),
    }),
    optimisticCase: z.object({
      description: z.string(),
      year3Revenue: z.string(),
      probability: z.string(),
      keyDrivers: z.array(z.string()),
    }),
    pessimisticCase: z.object({
      description: z.string(),
      year3Revenue: z.string(),
      probability: z.string(),
      riskFactors: z.array(z.string()),
    }),
  }),
  sensitivityAnalysis: z.array(
    z.object({
      variable: z.string(),
      impact: z.string(),
      range: z.string(),
      revenueImpact: z.string(),
    })
  ),
  sources: z.array(z.string()),
});

export class FinancialProjectionsAnalyzer extends PhaseAnalyzer {
  async analyze(
    sessionId: string,
    phase: ResearchPhase,
    context: ResearchContext
  ): Promise<AnalysisResult> {
    const researchTopic = `Financial projections and business metrics for ${context.ideaName} SaaS in ${context.industry}`;
    const searchQueries = this.getSearchQueries(context);

    // Use research-based analysis for better financial insights
    return this.conductResearchAnalysis(
      sessionId,
      phase,
      context,
      researchTopic,
      searchQueries,
      FinancialProjectionsSchema
    );
  }

  protected generateFollowUpPrompt(
    currentFindings: any,
    context: ResearchContext,
    iteration: number
  ): string {
    const gaps = this.identifyGaps(currentFindings);

    return `
Based on the previous financial projections analysis, please provide more detailed information on:

${gaps.map((gap) => `- ${gap}`).join("\n")}

Current projections status:
- Revenue projections: ${currentFindings.revenueProjections ? "Available" : "Missing"}
- Cost projections: ${currentFindings.costProjections ? "Available" : "Missing"}
- Profitability analysis: ${currentFindings.profitabilityAnalysis ? "Available" : "Missing"}
- Cash flow projections: ${currentFindings.cashFlowProjections ? "Available" : "Missing"}
- Key metrics: ${currentFindings.keyFinancialMetrics ? "Available" : "Missing"}

Iteration ${iteration} - focus on realistic numbers, detailed assumptions, and comprehensive scenario analysis.
Ensure all financial projections are internally consistent and well-justified.
`;
  }

  protected calculateConfidence(findings: any, iteration: number): number {
    let confidence = this.getBaseConfidence(findings, iteration);

    const requiredFields = [
      "revenueProjections",
      "costProjections",
      "profitabilityAnalysis",
      "keyFinancialMetrics",
    ];

    if (this.hasRequiredFields(findings, requiredFields)) {
      confidence += 20;
    }

    // Revenue projections completeness
    if (
      findings.revenueProjections?.year1?.q1 &&
      findings.revenueProjections?.year1?.total
    ) {
      confidence += 10;
    }
    if (findings.revenueProjections?.assumptions?.length >= 3) {
      confidence += 5;
    }

    // Cost projections detail
    if (
      findings.costProjections?.year1?.total &&
      findings.costProjections?.year2?.total
    ) {
      confidence += 10;
    }

    // Profitability analysis
    if (findings.profitabilityAnalysis?.breakEvenAnalysis?.breakEvenMonth) {
      confidence += 8;
    }

    // Cash flow analysis
    if (
      findings.cashFlowProjections?.cashBurnRate &&
      findings.cashFlowProjections?.runwayMonths
    ) {
      confidence += 8;
    }

    // Key metrics completeness
    const metricsFields = [
      "customerAcquisitionCost",
      "customerLifetimeValue",
      "ltvcacRatio",
    ];
    const hasMetrics = metricsFields.every(
      (field) => findings.keyFinancialMetrics?.[field]
    );
    if (hasMetrics) confidence += 10;

    // Funding requirements
    if (findings.fundingRequirements?.totalFundingNeeded) confidence += 5;

    // Scenario analysis
    if (
      findings.scenarioAnalysis?.baseCase &&
      findings.scenarioAnalysis?.optimisticCase
    ) {
      confidence += 8;
    }

    // Sensitivity analysis
    if (findings.sensitivityAnalysis?.length >= 3) confidence += 5;

    return Math.min(confidence, 100);
  }

  protected mergeFindings(existing: any, newFindings: any): any {
    return {
      revenueProjections: this.mergeObjects(
        existing.revenueProjections,
        newFindings.revenueProjections
      ),
      costProjections: this.mergeObjects(
        existing.costProjections,
        newFindings.costProjections
      ),
      profitabilityAnalysis: this.mergeObjects(
        existing.profitabilityAnalysis,
        newFindings.profitabilityAnalysis
      ),
      cashFlowProjections: this.mergeObjects(
        existing.cashFlowProjections,
        newFindings.cashFlowProjections
      ),
      keyFinancialMetrics: this.mergeObjects(
        existing.keyFinancialMetrics,
        newFindings.keyFinancialMetrics
      ),
      fundingRequirements: this.mergeFundingRequirements(
        existing.fundingRequirements,
        newFindings.fundingRequirements
      ),
      scenarioAnalysis: this.mergeObjects(
        existing.scenarioAnalysis,
        newFindings.scenarioAnalysis
      ),
      sensitivityAnalysis: this.mergeArrays(
        existing.sensitivityAnalysis,
        newFindings.sensitivityAnalysis,
        "variable"
      ),
      sources: this.mergeArrays(existing.sources, newFindings.sources),
    };
  }

  private identifyGaps(findings: any): string[] {
    const gaps: string[] = [];

    // Revenue projections
    if (!findings.revenueProjections?.year1?.total) {
      gaps.push("Detailed Year 1 revenue projections with quarterly breakdown");
    }
    if (!findings.revenueProjections?.year3?.total) {
      gaps.push("Year 2 and Year 3 revenue projections");
    }
    if (
      !findings.revenueProjections?.assumptions ||
      findings.revenueProjections.assumptions.length < 3
    ) {
      gaps.push("Revenue projection assumptions and methodology");
    }

    // Cost projections
    if (!findings.costProjections?.year1?.total) {
      gaps.push("Detailed cost projections by category");
    }
    if (
      !findings.costProjections?.assumptions ||
      findings.costProjections.assumptions.length < 3
    ) {
      gaps.push("Cost projection assumptions and scaling factors");
    }

    // Profitability analysis
    if (!findings.profitabilityAnalysis?.breakEvenAnalysis?.breakEvenMonth) {
      gaps.push("Break-even analysis with timeline and metrics");
    }
    if (!findings.profitabilityAnalysis?.year3?.netMargin) {
      gaps.push("Complete profitability analysis for all three years");
    }

    // Cash flow projections
    if (!findings.cashFlowProjections?.cashBurnRate) {
      gaps.push("Cash burn rate and runway analysis");
    }
    if (!findings.cashFlowProjections?.year1?.operatingCashFlow) {
      gaps.push("Detailed cash flow projections by year");
    }

    // Key financial metrics
    const requiredMetrics = [
      "customerAcquisitionCost",
      "customerLifetimeValue",
      "ltvcacRatio",
    ];
    const missingMetrics = requiredMetrics.filter(
      (metric) => !findings.keyFinancialMetrics?.[metric]?.year1
    );
    if (missingMetrics.length > 0) {
      gaps.push(`Key financial metrics: ${missingMetrics.join(", ")}`);
    }

    // Funding requirements
    if (!findings.fundingRequirements?.totalFundingNeeded) {
      gaps.push("Funding requirements and use of funds analysis");
    }

    // Scenario analysis
    if (!findings.scenarioAnalysis?.baseCase) {
      gaps.push("Scenario analysis (base, optimistic, pessimistic cases)");
    }

    // Sensitivity analysis
    if (
      !findings.sensitivityAnalysis ||
      findings.sensitivityAnalysis.length < 3
    ) {
      gaps.push("Sensitivity analysis for key variables");
    }

    return gaps;
  }

  private mergeFundingRequirements(existing: any, newFunding: any): any {
    if (!existing) return newFunding;
    if (!newFunding) return existing;

    return {
      ...existing,
      ...newFunding,
      fundingStages: this.mergeArrays(
        existing.fundingStages,
        newFunding.fundingStages,
        "stage"
      ),
      useOfFunds: this.mergeArrays(
        existing.useOfFunds,
        newFunding.useOfFunds,
        "category"
      ),
    };
  }

  private mergeObjects(existing: any, newObj: any): any {
    if (!existing) return newObj;
    if (!newObj) return existing;

    // Deep merge for nested objects
    const merged = { ...existing };
    for (const key in newObj) {
      if (
        typeof newObj[key] === "object" &&
        !Array.isArray(newObj[key]) &&
        newObj[key] !== null
      ) {
        merged[key] = this.mergeObjects(existing[key], newObj[key]);
      } else {
        merged[key] = newObj[key];
      }
    }
    return merged;
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

  protected getSearchQueries(context: ResearchContext): string[] {
    const industry = context.industry.toLowerCase();
    const ideaName = context.ideaName.toLowerCase();

    return [
      `${industry} SaaS financial projections revenue benchmarks 2024`,
      `${industry} software pricing strategy market analysis`,
      `SaaS customer acquisition cost ${industry} benchmarks`,
      `${industry} SaaS churn rate industry average 2024`,
      `SaaS lifetime value calculations ${industry} metrics`,
      `${industry} software startup funding requirements Series A`,
      `${ideaName} ${industry} revenue model analysis`,
      `${industry} SaaS unit economics profitability`,
      `${industry} software cash flow projections startup`,
      `SaaS financial metrics ${industry} KPIs benchmarks`,
    ];
  }
}
