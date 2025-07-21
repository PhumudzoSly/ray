import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";
import { SAAS_VALIDATION_PROMPT } from "../../prompts";
import { UnifiedCrawlerService } from "../crawler";

// ============================================================================
// VALIDATION SCORECARD AGENT
// ============================================================================

const VALIDATION_SCORECARD_PROMPT = `You are an expert SaaS validation analyst with 15+ years of experience in comprehensive validation scorecards and strategic business analysis. Your ONLY task is to generate validation scores and strategic recommendations based on all available research data using the comprehensive SaaS validation framework.

## SAAS VALIDATION EXPERTISE

### UNDERSTANDING SAAS SUCCESS FACTORS
You understand the critical success factors for SaaS companies, including:
- Product-market fit validation and customer success metrics
- Unit economics optimization (LTV/CAC, gross margins, payback periods)
- Competitive advantage development through network effects and data moats
- Customer acquisition optimization through product-led growth
- Retention and expansion strategies for sustainable growth
- Scalability and operational excellence in SaaS operations

### VALIDATION SCORECARD METHODOLOGY

#### 1. MULTI-DIMENSIONAL SCORING FRAMEWORK
- **Market Opportunity Score (0-100)**: Market size, growth rate, accessibility, maturity
- **Competitive Positioning Score (0-100)**: Competitive intensity, differentiation, barriers, network effects
- **Customer Validation Score (0-100)**: Pain points, willingness to pay, adoption barriers, product-led growth
- **Technical Feasibility Score (0-100)**: Implementation complexity, technology readiness, scalability
- **Financial Viability Score (0-100)**: Unit economics, funding requirements, profitability potential
- **Risk Assessment Score (0-100)**: Market risks, technical risks, competitive risks, execution risks

#### 2. SAAS-SPECIFIC SCORING CRITERIA

##### Market Opportunity Assessment
- **Market size and growth**: TAM, SAM, SOM with confidence levels
- **Market maturity**: Adoption rates, competitive landscape, growth drivers
- **Accessibility**: Customer acquisition channels, go-to-market complexity
- **Geographic expansion**: International potential, regulatory considerations

##### Competitive Positioning Analysis
- **Competitive intensity**: Market concentration, entry barriers, switching costs
- **Differentiation potential**: Unique value propositions, competitive moats
- **Network effects**: Direct, indirect, and data network effects
- **Platform dynamics**: Ecosystem value, integration opportunities

##### Customer Validation Metrics
- **Pain point intensity**: Frequency, severity, willingness to pay
- **Product-market fit indicators**: Customer retention, NPS, organic growth
- **Adoption barriers**: Technical complexity, budget constraints, change management
- **Product-led growth potential**: Self-service capability, viral mechanics

##### Technical Feasibility Evaluation
- **Implementation complexity**: Development timeline, resource requirements
- **Technology readiness**: Maturity, adoption rates, community support
- **Scalability considerations**: Performance, cost structure, growth accommodation
- **Security and compliance**: Data protection, regulatory requirements

##### Financial Viability Assessment
- **Unit economics**: LTV/CAC ratio, gross margins, payback periods
- **Funding requirements**: Capital needs, runway, funding environment
- **Profitability potential**: Revenue model, cost structure, margin expansion
- **Exit potential**: Acquisition interest, IPO readiness, strategic value

##### Risk Assessment Framework
- **Market risks**: Economic cycles, regulatory changes, technology disruption
- **Competitive risks**: New entrants, incumbent responses, pricing pressure
- **Technical risks**: Implementation challenges, security vulnerabilities, scalability issues
- **Execution risks**: Team capabilities, operational challenges, market timing

#### 3. WEIGHTED SCORING ALGORITHM
- Apply industry-specific weights based on market maturity and competitive landscape
- Consider technology complexity and implementation challenges
- Factor in customer acquisition and retention dynamics
- Account for regulatory and compliance considerations
- Include market timing and economic environment factors

#### 4. STRATEGIC RECOMMENDATIONS FRAMEWORK
- **Primary strategic recommendations**: Core positioning and go-to-market strategy
- **Secondary tactical recommendations**: Implementation priorities and milestones
- **Risk mitigation strategies**: Specific actions to address identified risks
- **Timeline and milestone recommendations**: Development and launch roadmap
- **Validation status and next steps**: Current validation level and required actions

#### 5. CONFIDENCE ASSESSMENT METHODOLOGY
- **Data quality evaluation**: Source reliability, completeness, recency
- **Research completeness**: Coverage of all validation dimensions
- **Source credibility**: Authoritative sources, expert validation, peer review
- **Gap analysis**: Missing information and research recommendations
- **Confidence levels**: Quantitative assessment of validation reliability

### SCORING FRAMEWORK STANDARDS
- **90-100**: Exceptional opportunity with minimal risks, strong competitive advantages
- **80-89**: Strong opportunity with manageable risks, clear path to success
- **70-79**: Good opportunity with moderate risks, requires strategic focus
- **60-69**: Moderate opportunity with significant risks, needs major improvements
- **Below 60**: High-risk opportunity requiring fundamental changes or reconsideration

## OUTPUT FORMAT
Provide ONLY validation scorecard with detailed scoring rationale and strategic recommendations. Do not include new research or analysis. Focus on comprehensive SaaS validation insights that support strategic decision-making.`;

export const generateValidationScorecard = async (
  idea: any,
  marketSizeData: any,
  competitorData: any,
  segmentsData: any,
  technologyData: any,
  additionalContext?: any,
  crawlerService?: UnifiedCrawlerService
) => {
  console.log("🔍 Validation Scorecard Agent: Starting validation analysis...");

  // Initialize crawler service if not provided
  const shouldDestroyCrawler = !crawlerService;
  if (!crawlerService) {
    crawlerService = new UnifiedCrawlerService();
  }

  // STEP 1: GATHER ADDITIONAL VALIDATION DATA
  console.log(
    "🔍 Validation Scorecard Agent: Gathering additional validation data..."
  );
  let additionalValidationData = "";

  try {
    // Search for validation-specific information
    const validationQueries = [
      `${idea.industry} SaaS validation success factors 2024`,
      `${idea.industry} SaaS failure reasons analysis`,
      `${idea.industry} SaaS market validation indicators`,
      `${idea.industry} SaaS product-market fit validation`,
      `${idea.industry} SaaS validation metrics KPIs`,
      `${idea.industry} SaaS validation case studies success stories`,
      `${idea.industry} SaaS validation best practices`,
      `${idea.industry} SaaS validation red flags warning signs`,
    ];

    for (const query of validationQueries) {
      try {
        const searchResults = await crawlerService.search(query);
        for (const result of searchResults.slice(0, 2)) {
          // Limit to top 2 results per query
          additionalValidationData += `\n\nVALIDATION DATA:\n`;
          additionalValidationData += `Query: ${query}\nSource: ${result.source}\nTitle: ${result.title}\nContent: ${result.content}\n`;
        }
      } catch (error) {
        console.warn(`Failed to search for validation data "${query}":`, error);
      }
    }

    // Search for industry-specific validation insights
    const industryValidationQueries = [
      `${idea.industry} market validation 2024`,
      `${idea.industry} customer validation feedback`,
      `${idea.industry} technical validation requirements`,
      `${idea.industry} financial validation metrics`,
      `${idea.industry} competitive validation analysis`,
    ];

    for (const query of industryValidationQueries) {
      try {
        const searchResults = await crawlerService.search(query);
        for (const result of searchResults.slice(0, 1)) {
          // Limit to top 1 result per query
          additionalValidationData += `\n\nINDUSTRY VALIDATION DATA:\n`;
          additionalValidationData += `Query: ${query}\nSource: ${result.source}\nTitle: ${result.title}\nContent: ${result.content}\n`;
        }
      } catch (error) {
        console.warn(
          `Failed to search for industry validation data "${query}":`,
          error
        );
      }
    }

    // Search for recent SaaS success/failure stories
    const successFailureQueries = [
      `${idea.industry} SaaS success stories 2024`,
      `${idea.industry} SaaS startup failures lessons learned`,
      `${idea.industry} SaaS validation mistakes common errors`,
      `${idea.industry} SaaS validation success patterns`,
    ];

    for (const query of successFailureQueries) {
      try {
        const searchResults = await crawlerService.search(query);
        for (const result of searchResults.slice(0, 1)) {
          // Limit to top 1 result per query
          additionalValidationData += `\n\nSUCCESS/FAILURE ANALYSIS:\n`;
          additionalValidationData += `Query: ${query}\nSource: ${result.source}\nTitle: ${result.title}\nContent: ${result.content}\n`;
        }
      } catch (error) {
        console.warn(
          `Failed to search for success/failure data "${query}":`,
          error
        );
      }
    }
  } catch (error) {
    console.warn("Failed to gather additional validation data:", error);
  }

  // STEP 2: GENERATE COMPREHENSIVE VALIDATION SCORECARD
  console.log(
    "🔍 Validation Scorecard Agent: Generating validation scorecard..."
  );
  const { object: scorecardData } = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: z.object({
      overallScore: z.number().min(0).max(100),
      overallConfidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
      validationStatus: z.enum([
        "VALIDATED",
        "PARTIALLY_VALIDATED",
        "NEEDS_VALIDATION",
        "NOT_VALIDATED",
      ]),

      dimensionScores: z.object({
        marketOpportunity: z.object({
          score: z.number().min(0).max(100),
          confidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
          reasoning: z.string(),
          keyFactors: z.array(z.string()),
        }),
        competitivePositioning: z.object({
          score: z.number().min(0).max(100),
          confidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
          reasoning: z.string(),
          keyFactors: z.array(z.string()),
        }),
        customerValidation: z.object({
          score: z.number().min(0).max(100),
          confidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
          reasoning: z.string(),
          keyFactors: z.array(z.string()),
        }),
        technicalFeasibility: z.object({
          score: z.number().min(0).max(100),
          confidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
          reasoning: z.string(),
          keyFactors: z.array(z.string()),
        }),
        financialViability: z.object({
          score: z.number().min(0).max(100),
          confidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
          reasoning: z.string(),
          keyFactors: z.array(z.string()),
        }),
        riskAssessment: z.object({
          score: z.number().min(0).max(100),
          confidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
          reasoning: z.string(),
          keyFactors: z.array(z.string()),
        }),
      }),

      strategicRecommendations: z.object({
        primary: z.string(),
        secondary: z.array(z.string()),
        timeline: z.string(),
        priorities: z.array(z.string()),
      }),

      riskAnalysis: z.object({
        highRisks: z.array(z.string()),
        mediumRisks: z.array(z.string()),
        lowRisks: z.array(z.string()),
        mitigationStrategies: z.array(z.string()),
      }),

      dataQuality: z.object({
        overallQuality: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
        completeness: z.number().min(0).max(100),
        recency: z.number().min(0).max(100),
        sourceCredibility: z.number().min(0).max(100),
        gaps: z.array(z.string()),
      }),

      nextReviewDate: z.string().optional(),
    }),
    prompt: `Based on all available research data and additional validation insights, generate a comprehensive validation scorecard.

RESEARCH DATA:
Market Size Data: ${JSON.stringify(marketSizeData, null, 2)}
Competitor Data: ${JSON.stringify(competitorData, null, 2)}
Customer Segments Data: ${JSON.stringify(segmentsData, null, 2)}
Technology Data: ${JSON.stringify(technologyData, null, 2)}

ADDITIONAL VALIDATION DATA:
${additionalValidationData}

ORIGINAL IDEA CONTEXT:
${JSON.stringify(idea, null, 2)}

ADDITIONAL CONTEXT:
${JSON.stringify(additionalContext, null, 2)}

Generate ONLY validation scorecard with detailed scoring rationale and strategic recommendations. Focus on comprehensive SaaS validation insights that support strategic decision-making.`,
  });

  console.log("✅ Validation Scorecard Agent: Completed validation analysis");

  // Cleanup crawler service if it was initialized
  if (shouldDestroyCrawler && crawlerService) {
    crawlerService.destroy();
  }

  return {
    scorecardData,
    agentType: "validation-scorecard",
    timestamp: new Date(),
    originalIdeaId: idea.id,
  };
};
