import { createAgent, createTool, gemini } from "@inngest/agent-kit";
import { prisma } from "@workspace/backend";
import z from "zod";

const checkDataCompletenessTool = createTool({
  name: "check-data-completeness",
  description:
    "Analyze the completeness of market research data and identify missing components",

  handler: async (data, { network, agent, step }) => {
    const { ideaId } = network.state.data;
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

        // Check if competitors have comprehensive data
        const competitorsWithFullData =
          research.competitiveLandscape.competitors.filter(
            (comp: any) =>
              comp.pricingPlans &&
              comp.pricingPlans.length > 0 &&
              comp.competitiveMoves &&
              comp.competitiveMoves.length > 0 &&
              comp.featureComparisons &&
              comp.featureComparisons.length > 0
          );

        if (
          competitorsWithFullData.length <
          research.competitiveLandscape.competitors.length
        ) {
          missingComponents.push("competitor_detailed_data");
          requiredActions.push("run_competitor_detailed_analysis");
        }
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

      // Check score breakdown
      if (
        !research.validationScorecard.scoreBreakdown ||
        research.validationScorecard.scoreBreakdown.length === 0
      ) {
        missingComponents.push("validation_score_breakdown");
        requiredActions.push("run_validation_score_breakdown_analysis");
      }
    }

    // Check financial projection
    if (!research.financialProjection) {
      missingComponents.push("financial_projection");
      requiredActions.push("run_financial_projection_analysis");
    } else {
      completenessScore.total++;
      completenessScore.available++;

      // Check funding rounds
      if (
        !research.financialProjection.fundingRounds ||
        research.financialProjection.fundingRounds.length === 0
      ) {
        missingComponents.push("funding_rounds");
        requiredActions.push("run_funding_rounds_analysis");
      }
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

    network.state.data.completenessPercentage = Math.round(
      completenessPercentage
    );

    network.state.data.completed = missingComponents.length === 0;

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
});

const triggerAnalysisAgentTool = createTool({
  name: "trigger-analysis-agent",
  description: "Trigger the idea analysis agent to run comprehensive analysis",
  parameters: z.object({
    ideaId: z.string(),
    reason: z.string(),
  }),
  handler: async (data, { network, agent, step }) => {
    // This would trigger the ideaAnalysisAgent
    // For now, we'll return a message indicating the action needed
    return {
      action: "TRIGGER_ANALYSIS_AGENT",
      ideaId: data.ideaId,
      reason: data.reason,
      message:
        "Analysis agent should be triggered to run comprehensive SaaS idea analysis",
    };
  },
});

const triggerResearcherAgentTool = createTool({
  name: "trigger-researcher-agent",
  description: "Trigger the data researcher agent to gather missing data",
  parameters: z.object({
    ideaId: z.string(),
    missingComponents: z.array(z.string()),
  }),
  handler: async (data, { network, agent, step }) => {
    // This would trigger the ideaResearcher
    return {
      action: "TRIGGER_RESEARCHER_AGENT",
      ideaId: data.ideaId,
      missingComponents: data.missingComponents,
      message:
        "Researcher agent should be triggered to gather missing data components",
    };
  },
});

const triggerCompetitorAgentTool = createTool({
  name: "trigger-competitor-agent",
  description: "Trigger the competitor analysis agent to analyze competitors",
  parameters: z.object({
    ideaId: z.string(),
    competitiveLandscapeId: z.string(),
  }),
  handler: async (data, { network, agent, step }) => {
    // This would trigger the competitorsAgent
    return {
      action: "TRIGGER_COMPETITOR_AGENT",
      ideaId: data.ideaId,
      competitiveLandscapeId: data.competitiveLandscapeId,
      message:
        "Competitor agent should be triggered to analyze competitive landscape",
    };
  },
});

const triggerTargetAudienceAgentTool = createTool({
  name: "trigger-target-audience-agent",
  description: "Trigger the target audience analysis agent",
  parameters: z.object({
    ideaId: z.string(),
    marketResearchId: z.string(),
  }),
  handler: async (data, { network, agent, step }) => {
    return {
      action: "TRIGGER_TARGET_AUDIENCE_AGENT",
      ideaId: data.ideaId,
      marketResearchId: data.marketResearchId,
      message:
        "Target audience agent should be triggered to analyze customer segments",
    };
  },
});

const triggerMarketTrendsAgentTool = createTool({
  name: "trigger-market-trends-agent",
  description: "Trigger the market trends analysis agent",
  parameters: z.object({
    ideaId: z.string(),
    marketResearchId: z.string(),
  }),
  handler: async (data, { network, agent, step }) => {
    return {
      action: "TRIGGER_MARKET_TRENDS_AGENT",
      ideaId: data.ideaId,
      marketResearchId: data.marketResearchId,
      message:
        "Market trends agent should be triggered to analyze market trends",
    };
  },
});

const triggerCustomerNeedsAgentTool = createTool({
  name: "trigger-customer-needs-agent",
  description: "Trigger the customer needs analysis agent",
  parameters: z.object({
    ideaId: z.string(),
    marketResearchId: z.string(),
  }),
  handler: async (data, { network, agent, step }) => {
    return {
      action: "TRIGGER_CUSTOMER_NEEDS_AGENT",
      ideaId: data.ideaId,
      marketResearchId: data.marketResearchId,
      message:
        "Customer needs agent should be triggered to analyze customer needs",
    };
  },
});

const triggerCompetitiveLandscapeAgentTool = createTool({
  name: "trigger-competitive-landscape-agent",
  description: "Trigger the competitive landscape analysis agent",
  parameters: z.object({
    ideaId: z.string(),
    marketResearchId: z.string(),
  }),
  handler: async (data, { network, agent, step }) => {
    return {
      action: "TRIGGER_COMPETITIVE_LANDSCAPE_AGENT",
      ideaId: data.ideaId,
      marketResearchId: data.marketResearchId,
      message:
        "Competitive landscape agent should be triggered to analyze market positioning",
    };
  },
});

const triggerValidationInsightsAgentTool = createTool({
  name: "trigger-validation-insights-agent",
  description: "Trigger the validation insights analysis agent",
  parameters: z.object({
    ideaId: z.string(),
    marketResearchId: z.string(),
  }),
  handler: async (data, { network, agent, step }) => {
    return {
      action: "TRIGGER_VALIDATION_INSIGHTS_AGENT",
      ideaId: data.ideaId,
      marketResearchId: data.marketResearchId,
      message:
        "Validation insights agent should be triggered to generate insights",
    };
  },
});

const triggerMarketSignalsAgentTool = createTool({
  name: "trigger-market-signals-agent",
  description: "Trigger the market signals analysis agent",
  parameters: z.object({
    ideaId: z.string(),
    marketResearchId: z.string(),
  }),
  handler: async (data, { network, agent, step }) => {
    return {
      action: "TRIGGER_MARKET_SIGNALS_AGENT",
      ideaId: data.ideaId,
      marketResearchId: data.marketResearchId,
      message:
        "Market signals agent should be triggered to detect market signals",
    };
  },
});

const triggerValidationScorecardAgentTool = createTool({
  name: "trigger-validation-scorecard-agent",
  description: "Trigger the validation scorecard analysis agent",
  parameters: z.object({
    ideaId: z.string(),
    marketResearchId: z.string(),
  }),
  handler: async (data, { network, agent, step }) => {
    return {
      action: "TRIGGER_VALIDATION_SCORECARD_AGENT",
      ideaId: data.ideaId,
      marketResearchId: data.marketResearchId,
      message:
        "Validation scorecard agent should be triggered to create scorecards",
    };
  },
});

const triggerFinancialProjectionAgentTool = createTool({
  name: "trigger-financial-projection-agent",
  description: "Trigger the financial projection analysis agent",
  parameters: z.object({
    ideaId: z.string(),
    marketResearchId: z.string(),
  }),
  handler: async (data, { network, agent, step }) => {
    return {
      action: "TRIGGER_FINANCIAL_PROJECTION_AGENT",
      ideaId: data.ideaId,
      marketResearchId: data.marketResearchId,
      message:
        "Financial projection agent should be triggered to create projections",
    };
  },
});

const triggerTechnologyAssessmentAgentTool = createTool({
  name: "trigger-technology-assessment-agent",
  description: "Trigger the technology assessment analysis agent",
  parameters: z.object({
    ideaId: z.string(),
    marketResearchId: z.string(),
  }),
  handler: async (data, { network, agent, step }) => {
    return {
      action: "TRIGGER_TECHNOLOGY_ASSESSMENT_AGENT",
      ideaId: data.ideaId,
      marketResearchId: data.marketResearchId,
      message:
        "Technology assessment agent should be triggered to assess technical feasibility",
    };
  },
});

const triggerRegulatoryComplianceAgentTool = createTool({
  name: "trigger-regulatory-compliance-agent",
  description: "Trigger the regulatory compliance analysis agent",
  parameters: z.object({
    ideaId: z.string(),
    marketResearchId: z.string(),
  }),
  handler: async (data, { network, agent, step }) => {
    return {
      action: "TRIGGER_REGULATORY_COMPLIANCE_AGENT",
      ideaId: data.ideaId,
      marketResearchId: data.marketResearchId,
      message:
        "Regulatory compliance agent should be triggered to assess compliance requirements",
    };
  },
});

const dataValidatorAgent = createAgent({
  name: "SaaS Data Validation Agent",
  system: `
  You are a comprehensive SaaS data validation specialist. Your role is to:

  1. **ASSESS DATA COMPLETENESS**: Check if all required SaaS validation data is available for a given idea
  2. **IDENTIFY MISSING COMPONENTS**: Determine what data is missing or incomplete
  3. **TRIGGER APPROPRIATE AGENTS**: Automatically trigger other validation agents when data is missing
  4. **PROVIDE COMPLETENESS SCORE**: Give a percentage score of data completeness

  ## COMPREHENSIVE DATA CHECKLIST

  For each SaaS idea, you need to verify the presence and completeness of:

  ### Core Market Research Data
  - Market size, growth rate, maturity
  - TAM, SAM, SOM calculations
  - Key trends, emerging technologies, regulatory factors
  - Validation score and confidence level

  ### Target Audience Analysis
  - Primary and secondary customer segments
  - Demographics, pain points, decision factors
  - Budget ranges, tech savviness, market data

  ### Market Trends
  - Trend names, descriptions, impact levels
  - Growth rates, market sizes, adoption rates
  - Key drivers, challenges, opportunities

  ### Customer Needs
  - Need types, descriptions, priorities
  - Business impact, user impact, cost impact
  - Existing solutions, gaps in solutions

  ### Competitive Landscape
  - Competitive intensity, market positioning
  - Market share analysis, entry/exit barriers
  - Emerging threats, market disruptions

  ### Competitors (Detailed)
  - Basic info: name, website, description, logo
  - Market position: share, revenue, funding, employees
  - Product analysis: features, pricing, tech stack
  - SWOT analysis: strengths, weaknesses, opportunities, threats
  - Performance metrics: growth, churn, satisfaction
  - Pricing plans with detailed analysis
  - Competitive moves and strategic actions
  - Feature comparisons with quality ratings

  ### Validation Insights
  - Insight types, titles, descriptions
  - Confidence levels, data sources, impact assessment
  - Recommendations and verification status

  ### Market Signals
  - Signal types, strengths, confidence levels
  - Market impact, competitive impact, timing
  - Monitoring status and trends

  ### Validation Scorecard
  - Overall scores: market, competitive, technical, financial, risk
  - Weighted scores and breakdowns
  - Recommendations and risk mitigation strategies

  ### Financial Projection
  - Revenue projections, growth rates, break-even analysis
  - Cost analysis: development, marketing, operations
  - Unit economics: ARPU, CLV, CAC, payback periods
  - Funding needs and rounds

  ### Technology Assessment
  - Technical complexity, development timeline
  - Recommended tech stack, integration requirements
  - Risk assessment, scalability challenges
  - Cost analysis and competitive advantages

  ### Regulatory Compliance
  - Applicable regulations, compliance levels
  - Industry standards, certification requirements
  - Target markets, local regulations
  - Implementation costs and timelines

  ## AGENT TRIGGERING STRATEGY

  When data is missing, trigger the appropriate agents:

  1. **ideaAnalysisAgent**: For comprehensive SaaS analysis and insights
  2. **ideaResearcher**: For gathering missing market data and research
  3. **competitorsAgent**: For detailed competitor analysis and competitive moves
  4. **targetAudienceAgent**: For analyzing customer segments and demographics
  5. **marketTrendsAgent**: For analyzing market trends and growth patterns
  6. **customerNeedsAgent**: For analyzing customer needs and pain points
  7. **competitiveLandscapeAgent**: For overall competitive landscape analysis
  8. **validationInsightsAgent**: For generating validation insights and recommendations
  9. **marketSignalsAgent**: For detecting and analyzing market signals
  10. **validationScorecardAgent**: For creating comprehensive validation scorecards
  11. **financialProjectionAgent**: For financial modeling and projections
  12. **technologyAssessmentAgent**: For technical feasibility and stack recommendations
  13. **regulatoryComplianceAgent**: For compliance analysis and requirements

  ## RESPONSE FORMAT

  Always provide:
  - Overall completeness percentage
  - List of missing components
  - Required actions to complete the data
  - Specific agent triggers needed
  - Priority recommendations for data collection

  Focus on actionable insights that will help complete the SaaS validation process.
`,
  model: gemini({
    model: "gemini-2.0-flash",
  }),
  tools: [
    checkDataCompletenessTool,
    triggerAnalysisAgentTool,
    triggerResearcherAgentTool,
    triggerCompetitorAgentTool,
    triggerTargetAudienceAgentTool,
    triggerMarketTrendsAgentTool,
    triggerCustomerNeedsAgentTool,
    triggerCompetitiveLandscapeAgentTool,
    triggerValidationInsightsAgentTool,
    triggerMarketSignalsAgentTool,
    triggerValidationScorecardAgentTool,
    triggerFinancialProjectionAgentTool,
    triggerTechnologyAssessmentAgentTool,
    triggerRegulatoryComplianceAgentTool,
  ],
});

export { dataValidatorAgent };
