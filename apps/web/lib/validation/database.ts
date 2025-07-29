import { prisma } from "@workspace/backend";
import { z } from "zod";
import {
  CompetitiveLandscapeOptionalDefaultsSchema,
  CompetitorOptionalDefaultsSchema,
  CompetitorPricingOptionalDefaultsSchema,
  CompetitiveMoveOptionalDefaultsSchema,
  FeatureComparisonOptionalDefaultsSchema,
  CustomerNeedOptionalDefaultsSchema,
  MarketTrendOptionalDefaultsSchema,
  MarketSignalOptionalDefaultsSchema,
  TargetAudienceOptionalDefaultsSchema,
  ValidationInsightOptionalDefaultsSchema,
  ValidationScorecardOptionalDefaultsSchema,
  ValidationScoreBreakdownOptionalDefaultsSchema,
  FinancialProjectionOptionalDefaultsSchema,
  FundingRoundOptionalDefaultsSchema,
  TechnologyAssessmentOptionalDefaultsSchema,
  RegulatoryComplianceOptionalDefaultsSchema,
} from "@workspace/backend/prisma/generated/zod";

// ============================================================================
// COMPETITIVE LANDSCAPE OPERATIONS
// ============================================================================

export const competitiveLandscapeDB = {
  save: async (
    data: z.infer<typeof CompetitiveLandscapeOptionalDefaultsSchema>,
    researchId: string
  ) => {
    return prisma.competitiveLandscape.upsert({
      where: { marketResearchId: researchId },
      update: data as any,
      create: { ...(data as any), marketResearchId: researchId },
    });
  },

  get: async (researchId: string) => {
    return prisma.competitiveLandscape.findUnique({
      where: { marketResearchId: researchId },
      include: {
        competitors: true,
        competitiveMoves: true,
      },
    });
  },

  exists: async (researchId: string) => {
    const existing = await prisma.competitiveLandscape.findUnique({
      where: { marketResearchId: researchId },
    });
    return { exists: !!existing, landscape: existing };
  },
};

// ============================================================================
// COMPETITOR OPERATIONS
// ============================================================================

export const competitorDB = {
  save: async (
    data: z.infer<typeof CompetitorOptionalDefaultsSchema>,
    competitiveLandscapeId: string
  ) => {
    return prisma.competitor.create({
      data: { ...(data as any), competitiveLandscapeId },
    });
  },

  savePricing: async (
    data: z.infer<typeof CompetitorPricingOptionalDefaultsSchema>,
    competitorId: string
  ) => {
    return prisma.competitorPricing.create({
      data: { ...(data as any), competitorId },
    });
  },

  saveCompetitiveMove: async (
    data: z.infer<typeof CompetitiveMoveOptionalDefaultsSchema>,
    competitiveLandscapeId: string
  ) => {
    return prisma.competitiveMove.create({
      data: { ...(data as any), competitiveLandscapeId },
    });
  },

  saveFeatureComparison: async (
    data: z.infer<typeof FeatureComparisonOptionalDefaultsSchema>,
    competitorId: string
  ) => {
    return prisma.featureComparison.create({
      data: { ...(data as any), competitorId },
    });
  },

  get: async (id: string) => {
    return prisma.competitor.findUnique({
      where: { id },
      include: {
        pricingPlans: true,
        competitiveMoves: true,
        featureComparisons: true,
      },
    });
  },

  getByLandscape: async (competitiveLandscapeId: string) => {
    return prisma.competitor.findMany({
      where: { competitiveLandscapeId },
      include: {
        pricingPlans: true,
        competitiveMoves: true,
        featureComparisons: true,
      },
    });
  },
};

// ============================================================================
// CUSTOMER NEEDS OPERATIONS
// ============================================================================

export const customerNeedsDB = {
  save: async (
    data: z.infer<typeof CustomerNeedOptionalDefaultsSchema>,
    researchId: string
  ) => {
    return prisma.customerNeed.create({
      data: { ...(data as any), marketResearchId: researchId },
    });
  },

  get: async (researchId: string) => {
    return prisma.customerNeed.findMany({
      where: { marketResearchId: researchId },
    });
  },
};

// ============================================================================
// MARKET TRENDS OPERATIONS
// ============================================================================

export const marketTrendsDB = {
  save: async (
    data: z.infer<typeof MarketTrendOptionalDefaultsSchema>,
    researchId: string
  ) => {
    return prisma.marketTrend.create({
      data: { ...(data as any), marketResearchId: researchId },
    });
  },

  get: async (researchId: string) => {
    return prisma.marketTrend.findMany({
      where: { marketResearchId: researchId },
    });
  },
};

// ============================================================================
// MARKET SIGNALS OPERATIONS
// ============================================================================

export const marketSignalsDB = {
  save: async (
    data: z.infer<typeof MarketSignalOptionalDefaultsSchema>,
    researchId: string
  ) => {
    return prisma.marketSignal.create({
      data: { ...(data as any), marketResearchId: researchId },
    });
  },

  get: async (researchId: string) => {
    return prisma.marketSignal.findMany({
      where: { marketResearchId: researchId },
    });
  },
};

// ============================================================================
// TARGET AUDIENCE OPERATIONS
// ============================================================================

export const targetAudienceDB = {
  save: async (
    data: z.infer<typeof TargetAudienceOptionalDefaultsSchema>,
    researchId: string
  ) => {
    return prisma.targetAudience.create({
      data: { ...(data as any), marketResearchId: researchId },
    });
  },

  get: async (researchId: string) => {
    return prisma.targetAudience.findMany({
      where: { marketResearchId: researchId },
    });
  },
};

// ============================================================================
// VALIDATION INSIGHTS OPERATIONS
// ============================================================================

export const validationInsightsDB = {
  save: async (
    data: z.infer<typeof ValidationInsightOptionalDefaultsSchema>,
    researchId: string
  ) => {
    return prisma.validationInsight.create({
      data: { ...(data as any), marketResearchId: researchId },
    });
  },

  get: async (researchId: string) => {
    return prisma.validationInsight.findMany({
      where: { marketResearchId: researchId },
    });
  },
};

// ============================================================================
// VALIDATION SCORECARD OPERATIONS
// ============================================================================

export const validationScorecardDB = {
  save: async (
    data: z.infer<typeof ValidationScorecardOptionalDefaultsSchema>,
    researchId: string
  ) => {
    return prisma.validationScorecard.upsert({
      where: { marketResearchId: researchId },
      update: data as any,
      create: { ...(data as any), marketResearchId: researchId },
    });
  },

  saveScoreBreakdown: async (
    data: z.infer<typeof ValidationScoreBreakdownOptionalDefaultsSchema>,
    scorecardId: string
  ) => {
    return prisma.validationScoreBreakdown.create({
      data: { ...(data as any), validationScorecardId: scorecardId },
    });
  },

  get: async (researchId: string) => {
    return prisma.validationScorecard.findUnique({
      where: { marketResearchId: researchId },
      include: {
        scoreBreakdown: true,
      },
    });
  },
};

// ============================================================================
// FINANCIAL PROJECTION OPERATIONS
// ============================================================================

export const financialProjectionDB = {
  save: async (
    data: z.infer<typeof FinancialProjectionOptionalDefaultsSchema>,
    researchId: string
  ) => {
    return prisma.financialProjection.upsert({
      where: { marketResearchId: researchId },
      update: data as any,
      create: { ...(data as any), marketResearchId: researchId },
    });
  },

  saveFundingRound: async (
    data: z.infer<typeof FundingRoundOptionalDefaultsSchema>,
    financialProjectionId: string
  ) => {
    return prisma.fundingRound.create({
      data: { ...(data as any), financialProjectionId },
    });
  },

  get: async (researchId: string) => {
    return prisma.financialProjection.findUnique({
      where: { marketResearchId: researchId },
      include: {
        fundingRounds: true,
      },
    });
  },

  exists: async (researchId: string) => {
    const existing = await prisma.financialProjection.findUnique({
      where: { marketResearchId: researchId },
      include: {
        fundingRounds: true,
      },
    });
    return { exists: !!existing, projection: existing };
  },
};

// ============================================================================
// TECHNOLOGY ASSESSMENT OPERATIONS
// ============================================================================

export const technologyAssessmentDB = {
  save: async (
    data: z.infer<typeof TechnologyAssessmentOptionalDefaultsSchema>,
    researchId: string
  ) => {
    return prisma.technologyAssessment.upsert({
      where: { marketResearchId: researchId },
      update: data as any,
      create: { ...(data as any), marketResearchId: researchId },
    });
  },

  get: async (researchId: string) => {
    return prisma.technologyAssessment.findUnique({
      where: { marketResearchId: researchId },
    });
  },
};

// ============================================================================
// REGULATORY COMPLIANCE OPERATIONS
// ============================================================================

export const regulatoryComplianceDB = {
  save: async (
    data: z.infer<typeof RegulatoryComplianceOptionalDefaultsSchema>,
    researchId: string
  ) => {
    return prisma.regulatoryCompliance.upsert({
      where: { marketResearchId: researchId },
      update: data as any,
      create: { ...(data as any), marketResearchId: researchId },
    });
  },

  get: async (researchId: string) => {
    return prisma.regulatoryCompliance.findUnique({
      where: { marketResearchId: researchId },
    });
  },
};

// ============================================================================
// DATA VALIDATION OPERATIONS
// ============================================================================

export const dataValidationDB = {
  checkCompleteness: async (ideaId: string) => {
    const research = await prisma.marketResearch.findUnique({
      where: { id: ideaId },
      include: {
        // Direct relationships
        targetAudiences: true,
        marketTrends: true,
        customerNeeds: true,
        validationInsights: true,
        marketSignals: true,

        // Optional relationships (one-to-one)
        competitiveLandscape: {
          include: {
            competitors: {
              include: {
                pricingPlans: true,
                competitiveMoves: true,
                featureComparisons: true,
              },
            },
            competitiveMoves: true,
          },
        },
        validationScorecard: {
          include: {
            scoreBreakdown: true,
          },
        },
        financialProjection: {
          include: {
            fundingRounds: true,
          },
        },
        technologyAssessment: true,
        regulatoryCompliance: true,
      },
    });

    if (!research) {
      return {
        status: "MISSING",
        message: "No market research data found for this idea",
        missingComponents: ["market_research"],
        requiredActions: ["run_market_research_analysis"],
        completenessPercentage: 0,
      };
    }

    const missingComponents = [];
    const requiredActions = [];
    const completenessScore = { total: 0, available: 0 };

    // Check core market research fields
    const coreFields = [
      "marketSize",
      "marketGrowthRate",
      "marketMaturity",
      "totalAddressableMarket",
      "serviceableAddressableMarket",
      "serviceableObtainableMarket",
      "keyTrends",
      "emergingTechnologies",
      "regulatoryFactors",
      "validationScore",
      "confidenceLevel",
    ];

    coreFields.forEach((field) => {
      completenessScore.total++;
      if (
        // @ts-ignore
        research[field as keyof typeof research] !== null &&
        // @ts-ignore
        research[field as keyof typeof research] !== undefined
      ) {
        completenessScore.available++;
      }
    });

    // Check target audiences
    if (!research.targetAudiences || research.targetAudiences.length === 0) {
      missingComponents.push("target_audiences");
      requiredActions.push("run_target_audience_analysis");
    } else {
      completenessScore.total++;
      completenessScore.available++;
    }

    // Check market trends
    if (!research.marketTrends || research.marketTrends.length === 0) {
      missingComponents.push("market_trends");
      requiredActions.push("run_market_trend_analysis");
    } else {
      completenessScore.total++;
      completenessScore.available++;
    }

    // Check customer needs
    if (!research.customerNeeds || research.customerNeeds.length === 0) {
      missingComponents.push("customer_needs");
      requiredActions.push("run_customer_needs_analysis");
    } else {
      completenessScore.total++;
      completenessScore.available++;
    }

    // Check competitive landscape
    if (!research.competitiveLandscape) {
      missingComponents.push("competitive_landscape");
      requiredActions.push("run_competitive_landscape_analysis");
    } else {
      completenessScore.total++;
      completenessScore.available++;

      // Check competitors within competitive landscape
      if (
        !research.competitiveLandscape.competitors ||
        research.competitiveLandscape.competitors.length === 0
      ) {
        missingComponents.push("competitors");
        requiredActions.push("run_competitor_analysis");
      } else {
        completenessScore.total++;
        completenessScore.available++;
      }

      // Check competitive moves
      if (
        !research.competitiveLandscape.competitiveMoves ||
        research.competitiveLandscape.competitiveMoves.length === 0
      ) {
        missingComponents.push("competitive_moves");
        requiredActions.push("run_competitive_moves_analysis");
      }
    }

    // Check validation insights
    if (
      !research.validationInsights ||
      research.validationInsights.length === 0
    ) {
      missingComponents.push("validation_insights");
      requiredActions.push("run_validation_insights_analysis");
    } else {
      completenessScore.total++;
      completenessScore.available++;
    }

    // Check market signals
    if (!research.marketSignals || research.marketSignals.length === 0) {
      missingComponents.push("market_signals");
      requiredActions.push("run_market_signals_analysis");
    } else {
      completenessScore.total++;
      completenessScore.available++;
    }

    // Check validation scorecard
    if (!research.validationScorecard) {
      missingComponents.push("validation_scorecard");
      requiredActions.push("run_validation_scorecard_analysis");
    } else {
      completenessScore.total++;
      completenessScore.available++;
    }

    // Check financial projection
    if (!research.financialProjection) {
      missingComponents.push("financial_projection");
      requiredActions.push("run_financial_projection_analysis");
    } else {
      completenessScore.total++;
      completenessScore.available++;
    }

    // Check technology assessment
    if (!research.technologyAssessment) {
      missingComponents.push("technology_assessment");
      requiredActions.push("run_technology_assessment_analysis");
    } else {
      completenessScore.total++;
      completenessScore.available++;
    }

    // Check regulatory compliance
    if (!research.regulatoryCompliance) {
      missingComponents.push("regulatory_compliance");
      requiredActions.push("run_regulatory_compliance_analysis");
    } else {
      completenessScore.total++;
      completenessScore.available++;
    }

    const completenessPercentage =
      (completenessScore.available / completenessScore.total) * 100;

    return {
      status: missingComponents.length === 0 ? "COMPLETE" : "INCOMPLETE",
      completenessPercentage: Math.round(completenessPercentage),
      missingComponents,
      requiredActions,
      ideaId,
      dataSummary: {
        totalComponents: completenessScore.total,
        availableComponents: completenessScore.available,
        missingCount: missingComponents.length,
      },
    };
  },
};
