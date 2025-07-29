import {
  analyzeCompetitiveLandscape,
  analyzeCompetitors,
  analyzeCustomerNeeds,
  analyzeMarketTrends,
  analyzeMarketSignals,
  analyzeTargetAudience,
  analyzeValidationInsights,
  createValidationScorecard,
  createFinancialProjection,
  analyzeTechnologyAssessment,
  analyzeRegulatoryCompliance,
} from "./functions";

export interface ValidationOrchestratorParams {
  ideaId: string;
  researchId: string;
  ideaDescription: string;
  targetMarket: string;
  targetAudience?: string;
  options?: {
    skipCompetitiveLandscape?: boolean;
    skipCompetitors?: boolean;
    skipCustomerNeeds?: boolean;
    skipMarketTrends?: boolean;
    skipMarketSignals?: boolean;
    skipTargetAudience?: boolean;
    skipValidationInsights?: boolean;
    skipValidationScorecard?: boolean;
    skipFinancialProjection?: boolean;
    skipTechnologyAssessment?: boolean;
    skipRegulatoryCompliance?: boolean;
  };
}

export interface ValidationOrchestratorResult {
  success: boolean;
  results: {
    competitiveLandscape?: any;
    competitors?: any[];
    customerNeeds?: any[];
    marketTrends?: any[];
    marketSignals?: any[];
    targetAudiences?: any[];
    validationInsights?: any[];
    validationScorecard?: any;
    financialProjection?: any;
    technologyAssessment?: any;
    regulatoryCompliance?: any;
  };
  errors: string[];
  researchData?: any;
}

export async function runValidationOrchestrator({
  ideaId,
  researchId,
  ideaDescription,
  targetMarket,
  options = {},
}: ValidationOrchestratorParams): Promise<ValidationOrchestratorResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const results: any = {};

  console.log(
    `[Validation Orchestrator] Starting validation for idea: ${ideaId}`
  );

  try {
    // Step 1: Competitive Landscape Analysis
    if (!options.skipCompetitiveLandscape) {
      console.log(
        `[Validation Orchestrator] Running competitive landscape analysis`
      );
      try {
        const competitiveLandscapeResult = await analyzeCompetitiveLandscape({
          ideaId,
          researchId,
          ideaDescription,
          targetMarket,
        });

        if (competitiveLandscapeResult.success) {
          results.competitiveLandscape = competitiveLandscapeResult.landscape;
        } else {
          errors.push(
            `Competitive Landscape: ${competitiveLandscapeResult.error}`
          );
        }
      } catch (error) {
        errors.push(
          `Competitive Landscape: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Step 2: Competitors Analysis
    if (!options.skipCompetitors) {
      console.log(`[Validation Orchestrator] Running competitors analysis`);
      try {
        const competitorsResult = await analyzeCompetitors({
          ideaId,
          researchId,
          competitiveLandscapeId:
            results.competitiveLandscape?.id || researchId,
          ideaDescription,
          targetMarket,
        });

        if (competitorsResult.success) {
          results.competitors = competitorsResult.competitors;
        } else {
          errors.push(`Competitors: ${competitorsResult.error}`);
        }
      } catch (error) {
        errors.push(
          `Competitors: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Step 3: Customer Needs Analysis
    if (!options.skipCustomerNeeds) {
      console.log(`[Validation Orchestrator] Running customer needs analysis`);
      try {
        const customerNeedsResult = await analyzeCustomerNeeds({
          ideaId,
          researchId,
          ideaDescription,
          targetMarket,
        });

        if (customerNeedsResult.success) {
          results.customerNeeds = customerNeedsResult.needs;
        } else {
          errors.push(`Customer Needs: ${customerNeedsResult.error}`);
        }
      } catch (error) {
        errors.push(
          `Customer Needs: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Step 4: Market Trends Analysis
    if (!options.skipMarketTrends) {
      console.log(`[Validation Orchestrator] Running market trends analysis`);
      try {
        const marketTrendsResult = await analyzeMarketTrends({
          ideaId,
          researchId,
          ideaDescription,
          targetMarket,
        });

        if (marketTrendsResult.success) {
          results.marketTrends = marketTrendsResult.trends;
        } else {
          errors.push(`Market Trends: ${marketTrendsResult.error}`);
        }
      } catch (error) {
        errors.push(
          `Market Trends: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Step 5: Market Signals Analysis
    if (!options.skipMarketSignals) {
      console.log(`[Validation Orchestrator] Running market signals analysis`);
      try {
        const marketSignalsResult = await analyzeMarketSignals({
          ideaId,
          researchId,
          ideaDescription,
          targetMarket,
        });

        if (marketSignalsResult.success) {
          results.marketSignals = marketSignalsResult.signals;
        } else {
          errors.push(`Market Signals: ${marketSignalsResult.error}`);
        }
      } catch (error) {
        errors.push(
          `Market Signals: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Step 6: Target Audience Analysis
    if (!options.skipTargetAudience) {
      console.log(`[Validation Orchestrator] Running target audience analysis`);
      try {
        const targetAudienceResult = await analyzeTargetAudience({
          ideaId,
          researchId,
          ideaDescription,
          targetMarket,
        });

        if (targetAudienceResult.success) {
          results.targetAudiences = targetAudienceResult.audiences;
        } else {
          errors.push(`Target Audience: ${targetAudienceResult.error}`);
        }
      } catch (error) {
        errors.push(
          `Target Audience: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Step 7: Validation Insights Generation
    if (!options.skipValidationInsights) {
      console.log(
        `[Validation Orchestrator] Running validation insights generation`
      );
      try {
        const validationInsightsResult = await analyzeValidationInsights({
          ideaId,
          researchId,
          ideaDescription,
          targetMarket,
        });

        if (validationInsightsResult.success) {
          results.validationInsights = validationInsightsResult.insights;
        } else {
          errors.push(`Validation Insights: ${validationInsightsResult.error}`);
        }
      } catch (error) {
        errors.push(
          `Validation Insights: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Step 8: Validation Scorecard Creation
    if (!options.skipValidationScorecard) {
      console.log(
        `[Validation Orchestrator] Running validation scorecard creation`
      );
      try {
        const validationScorecardResult = await createValidationScorecard({
          ideaId,
          researchId,
          ideaDescription,
          targetMarket,
          existingData: {
            competitiveLandscape: results.competitiveLandscape,
            competitors: results.competitors,
            customerNeeds: results.customerNeeds,
            marketTrends: results.marketTrends,
            marketSignals: results.marketSignals,
            targetAudiences: results.targetAudiences,
            validationInsights: results.validationInsights,
          },
        });

        if (validationScorecardResult.success) {
          results.validationScorecard =
            validationScorecardResult.validationScorecard;
        } else {
          errors.push(
            `Validation Scorecard: ${validationScorecardResult.error}`
          );
        }
      } catch (error) {
        errors.push(
          `Validation Scorecard: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Step 9: Financial Projection Analysis
    if (!options.skipFinancialProjection) {
      console.log(
        `[Validation Orchestrator] Running financial projection analysis`
      );
      try {
        const financialProjectionResult = await createFinancialProjection({
          ideaId,
          researchId,
          ideaDescription,
          targetMarket,
          existingData: {
            competitiveLandscape: results.competitiveLandscape,
            competitors: results.competitors,
            customerNeeds: results.customerNeeds,
            marketTrends: results.marketTrends,
            targetAudiences: results.targetAudiences,
          },
        });

        if (financialProjectionResult.success) {
          results.financialProjection =
            financialProjectionResult.financialProjection;
        } else {
          errors.push(
            `Financial Projection: ${financialProjectionResult.error}`
          );
        }
      } catch (error) {
        errors.push(
          `Financial Projection: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Step 10: Technology Assessment Analysis
    if (!options.skipTechnologyAssessment) {
      console.log(
        `[Validation Orchestrator] Running technology assessment analysis`
      );
      try {
        const technologyAssessmentResult = await analyzeTechnologyAssessment({
          ideaId,
          researchId,
          ideaDescription,
          targetMarket,
          existingData: {
            competitiveLandscape: results.competitiveLandscape,
            competitors: results.competitors,
            customerNeeds: results.customerNeeds,
            marketTrends: results.marketTrends,
          },
        });

        if (technologyAssessmentResult.success) {
          results.technologyAssessment =
            technologyAssessmentResult.technologyAssessment;
        } else {
          errors.push(
            `Technology Assessment: ${technologyAssessmentResult.error}`
          );
        }
      } catch (error) {
        errors.push(
          `Technology Assessment: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Step 11: Regulatory Compliance Analysis
    if (!options.skipRegulatoryCompliance) {
      console.log(
        `[Validation Orchestrator] Running regulatory compliance analysis`
      );
      try {
        const regulatoryComplianceResult = await analyzeRegulatoryCompliance({
          ideaId,
          researchId,
          ideaDescription,
          targetMarket,
          existingData: {
            competitiveLandscape: results.competitiveLandscape,
            competitors: results.competitors,
            customerNeeds: results.customerNeeds,
            marketTrends: results.marketTrends,
          },
        });

        if (regulatoryComplianceResult.success) {
          results.regulatoryCompliance =
            regulatoryComplianceResult.regulatoryCompliance;
        } else {
          errors.push(
            `Regulatory Compliance: ${regulatoryComplianceResult.error}`
          );
        }
      } catch (error) {
        errors.push(
          `Regulatory Compliance: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(
      `[Validation Orchestrator] Validation completed for idea: ${ideaId} in ${duration}ms`
    );
    console.log(`[Validation Orchestrator] Errors: ${errors.length}`);

    return {
      success: errors.length === 0,
      results,
      errors,
    };
  } catch (error) {
    console.error(
      `[Validation Orchestrator] Orchestration failed for idea: ${ideaId}`,
      error
    );

    return {
      success: false,
      results,
      errors: [
        ...errors,
        `Orchestration: ${error instanceof Error ? error.message : "Unknown error"}`,
      ],
    };
  }
}
