import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";
import { SAAS_VALIDATION_PROMPT } from "../../prompts";
import { allTools } from "../tools";

// ============================================================================
// VALIDATION SCORECARD RESEARCH PROMPT (FOR TOOLS)
// ============================================================================

const VALIDATION_SCORECARD_RESEARCH_PROMPT = `You are an expert SaaS validation analyst with 15+ years of experience in startup validation and business strategy. Your task is to conduct comprehensive research to validate a specific SaaS idea using available research tools.

## RESEARCH OBJECTIVES

### PRIMARY RESEARCH AREAS
1. **Market Validation Research**
   - Search for market size data, growth trends, and industry reports
   - Research customer pain points and demand validation
   - Analyze market maturity and adoption patterns
   - Investigate market barriers and entry challenges

2. **Competitive Landscape Research**
   - Identify direct and indirect competitors
   - Research competitor positioning, features, and pricing
   - Analyze competitive advantages and differentiation opportunities
   - Investigate competitive threats and market dynamics

3. **Technical Feasibility Research**
   - Research technology trends and implementation approaches
   - Investigate technical requirements and complexity
   - Analyze technical risks and challenges
   - Research technical advantages and innovation opportunities

4. **Financial Viability Research**
   - Research pricing models and revenue strategies
   - Analyze cost structures and operational requirements
   - Investigate funding requirements and unit economics
   - Research financial projections and growth potential

5. **Risk Assessment Research**
   - Research market risks and uncertainties
   - Analyze competitive risks and threats
   - Investigate technical risks and implementation challenges
   - Research financial risks and viability concerns

### RESEARCH METHODOLOGY
- Use search tools to find relevant market data and industry reports
- Scrape competitor websites to understand their positioning and features
- Research technology trends and implementation approaches
- Analyze financial data and pricing strategies
- Investigate risk factors and mitigation strategies

### TOOL USAGE GUIDELINES
- Use search tools to find comprehensive market and competitive data
- Scrape relevant websites for detailed competitor analysis
- Research technology trends and implementation approaches
- Analyze financial viability and pricing strategies
- Investigate risk factors and market dynamics

## RESEARCH REQUIREMENTS
- Focus on SaaS-specific validation factors and metrics
- Consider product-led growth vs. sales-led validation
- Analyze unit economics and customer lifetime value
- Evaluate technical feasibility and scalability
- Assess competitive positioning and market entry
- Consider risk factors and mitigation strategies

## OUTPUT FORMAT
Provide comprehensive research findings with:
- Market validation insights and data
- Competitive landscape analysis
- Technical feasibility assessment
- Financial viability analysis
- Risk assessment and mitigation strategies
- Strategic recommendations based on research

Use the available tools to gather comprehensive data for SaaS validation analysis.`;

// ============================================================================
// VALIDATION SCORECARD PROMPT (FOR STRUCTURED OUTPUT)
// ============================================================================

const VALIDATION_SCORECARD_PROMPT = `You are an expert SaaS validation analyst with 15+ years of experience in startup validation and business strategy. Your ONLY task is to create a comprehensive validation scorecard for a specific SaaS idea using the comprehensive SaaS validation framework and research data provided.

## SAAS VALIDATION EXPERTISE

### UNDERSTANDING SAAS VALIDATION DYNAMICS
You understand the unique characteristics of SaaS validation, including:
- Product-market fit and customer validation in SaaS
- Unit economics and SaaS business model validation
- Technical feasibility and scalability validation
- Competitive positioning and market entry validation
- Risk assessment and mitigation strategies for SaaS

### VALIDATION SCORECARD METHODOLOGY

#### 1. MARKET OPPORTUNITY VALIDATION
- **Market Size**: TAM/SAM/SOM analysis and validation
- **Market Growth**: Growth rate and trend validation
- **Market Maturity**: Market stage and adoption validation
- **Market Barriers**: Entry barriers and competitive validation
- **Market Timing**: Market readiness and timing validation

#### 2. COMPETITIVE POSITIONING VALIDATION
- **Competitive Landscape**: Competitor analysis and positioning
- **Competitive Advantages**: Differentiation and moat validation
- **Competitive Threats**: Threat assessment and mitigation
- **Competitive Moves**: Strategic positioning and response
- **Competitive Intensity**: Market concentration and dynamics

#### 3. TECHNICAL FEASIBILITY VALIDATION
- **Technical Complexity**: Implementation complexity assessment
- **Technical Requirements**: Resource and skill requirements
- **Technical Risks**: Risk assessment and mitigation
- **Technical Advantages**: Technology differentiation validation
- **Technical Scalability**: Growth and performance validation

#### 4. FINANCIAL VIABILITY VALIDATION
- **Revenue Model**: Pricing and monetization validation
- **Cost Structure**: Development and operational costs
- **Unit Economics**: CAC, LTV, and profitability validation
- **Funding Requirements**: Capital needs and runway validation
- **Financial Projections**: Revenue and growth projections

#### 5. RISK ASSESSMENT VALIDATION
- **Market Risks**: Market-related risk factors
- **Competitive Risks**: Competitive threat assessment
- **Technical Risks**: Technical implementation risks
- **Financial Risks**: Financial viability risks
- **Operational Risks**: Execution and operational risks

### SAAS-SPECIFIC VALIDATION FACTORS

#### Product-Market Fit Validation
- **Customer Pain Points**: Problem validation and intensity
- **Solution Validation**: Solution effectiveness and adoption
- **Value Proposition**: Value delivery and customer satisfaction
- **Customer Acquisition**: Acquisition cost and channel validation
- **Customer Retention**: Retention rate and churn validation

#### Business Model Validation
- **Revenue Streams**: Revenue model and pricing validation
- **Cost Structure**: Cost efficiency and optimization
- **Unit Economics**: Customer economics and profitability
- **Scalability**: Growth potential and resource requirements
- **Sustainability**: Long-term viability and competitive moats

#### Go-to-Market Validation
- **Market Entry**: Entry strategy and timing validation
- **Customer Segments**: Target market and segment validation
- **Distribution Channels**: Channel effectiveness and cost
- **Marketing Strategy**: Marketing approach and ROI validation
- **Sales Strategy**: Sales process and conversion validation

## ANALYSIS REQUIREMENTS
- Focus on SaaS-specific validation factors and metrics
- Consider product-led growth vs. sales-led validation
- Analyze unit economics and customer lifetime value
- Evaluate technical feasibility and scalability
- Assess competitive positioning and market entry
- Consider risk factors and mitigation strategies

## OUTPUT FORMAT
Provide ONLY validation scorecard analysis with comprehensive scoring, risk assessment, and strategic recommendations. Do not include market research, competitor analysis, or other topics. Focus on validation insights that support comprehensive SaaS validation.`;

export const generateValidationScorecard = async (
  idea: any,
  marketSizeData: any,
  competitorData: any,
  segmentsData: any,
  technologyData: any,
  additionalContext?: any
) => {
  console.log("🔍 Validation Scorecard Agent: Starting validation analysis...");

  // Build comprehensive context from all research data
  const researchContext = {
    originalIdea: idea,
    marketSizeData: marketSizeData || {},
    competitorData: competitorData || {},
    segmentsData: segmentsData || {},
    technologyData: technologyData || {},
    additionalContext: additionalContext || {},
    currentFocus: "validation-scorecard",
  };

  // STEP 1: CONDUCT COMPREHENSIVE RESEARCH USING TOOLS
  console.log(
    "🔍 Validation Scorecard Agent: Conducting research with tools..."
  );

  let researchData = "";

  try {
    const { text: researchResults } = await generateText({
      model: google("gemini-2.0-flash", {
        useSearchGrounding: true,
      }),
      tools: allTools,
      maxSteps: 100,
      toolChoice: "required",
      prompt: `${VALIDATION_SCORECARD_RESEARCH_PROMPT}

IDEA CONTEXT:
${JSON.stringify(idea, null, 2)}

RESEARCH CONTEXT:
${JSON.stringify(researchContext, null, 2)}

EXISTING RESEARCH DATA:
- Market Size Data: ${JSON.stringify(marketSizeData, null, 2)}
- Competitor Data: ${JSON.stringify(competitorData, null, 2)}
- Customer Segments Data: ${JSON.stringify(segmentsData, null, 2)}
- Technology Data: ${JSON.stringify(technologyData, null, 2)}

RESEARCH INSTRUCTIONS:
1. Use search tools to find additional market data, competitor information, and industry trends
2. Scrape competitor websites to understand their positioning, features, and pricing
3. Research technology trends and implementation approaches for this SaaS idea
4. Analyze financial viability, pricing strategies, and unit economics
5. Investigate risk factors and market dynamics
6. Synthesize all research findings into comprehensive validation insights

Use the available tools to gather comprehensive data for SaaS validation analysis. Focus on finding concrete data points, competitor insights, market trends, and risk factors that will inform the validation scorecard.`,
    });

    researchData = researchResults;
    console.log("✅ Validation Scorecard Agent: Completed research phase");
  } catch (error) {
    console.error(
      "❌ Validation Scorecard Agent research phase failed:",
      error
    );
    researchData = "Research phase failed - proceeding with existing data only";
  }

  // STEP 2: GENERATE STRUCTURED VALIDATION SCORECARD DATA
  console.log("🔍 Validation Scorecard Agent: Generating structured data...");

  try {
    const { object: scorecardData } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: z.object({
        overallScore: z.number().min(0).max(100),
        validationStatus: z.enum([
          "VALIDATED",
          "NEEDS_VALIDATION",
          "NOT_VALIDATED",
        ]),

        // Dimension Scores
        dimensionScores: z.object({
          marketOpportunity: z.object({
            score: z.number().min(0).max(100),
            confidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
            factors: z.array(z.string()),
            risks: z.array(z.string()),
          }),
          competitivePositioning: z.object({
            score: z.number().min(0).max(100),
            confidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
            factors: z.array(z.string()),
            risks: z.array(z.string()),
          }),
          technicalFeasibility: z.object({
            score: z.number().min(0).max(100),
            confidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
            factors: z.array(z.string()),
            risks: z.array(z.string()),
          }),
          financialViability: z.object({
            score: z.number().min(0).max(100),
            confidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
            factors: z.array(z.string()),
            risks: z.array(z.string()),
          }),
          riskAssessment: z.object({
            score: z.number().min(0).max(100),
            confidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
            factors: z.array(z.string()),
            risks: z.array(z.string()),
          }),
        }),

        // Strategic Recommendations
        strategicRecommendations: z.object({
          primary: z.string(),
          secondary: z.array(z.string()),
          immediate: z.array(z.string()),
          longTerm: z.array(z.string()),
        }),

        // Risk Analysis
        riskAnalysis: z.object({
          highRisks: z.array(z.string()),
          mediumRisks: z.array(z.string()),
          lowRisks: z.array(z.string()),
          mitigationStrategies: z.array(z.string()),
          riskScore: z.number().min(0).max(100),
        }),

        // Validation Metrics
        validationMetrics: z.object({
          productMarketFit: z.number().min(0).max(100),
          marketSize: z.number().min(0).max(100),
          competitiveAdvantage: z.number().min(0).max(100),
          technicalFeasibility: z.number().min(0).max(100),
          financialViability: z.number().min(0).max(100),
          executionRisk: z.number().min(0).max(100),
        }),

        // Next Steps
        nextSteps: z.object({
          immediate: z.array(z.string()),
          shortTerm: z.array(z.string()),
          mediumTerm: z.array(z.string()),
          longTerm: z.array(z.string()),
        }),

        // Timeline
        nextReviewDate: z.string().optional(),
        validationTimeline: z.string().optional(),

        // Confidence and Quality
        overallConfidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
        dataQuality: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
        recommendations: z.array(z.string()),
      }),
      prompt: `${VALIDATION_SCORECARD_PROMPT}

IDEA CONTEXT:
${JSON.stringify(idea, null, 2)}

EXISTING RESEARCH DATA:
${JSON.stringify(researchContext, null, 2)}

COMPREHENSIVE RESEARCH FINDINGS:
${researchData}

IMPORTANT: Return a valid JSON object with the exact structure specified in the schema. Do not return a string representation of JSON.

Generate ONLY validation scorecard analysis with comprehensive scoring, risk assessment, and strategic recommendations. Focus on SaaS-specific validation insights and actionable intelligence for this specific idea. Use the research findings to inform your analysis and scoring.`,
    });

    console.log("✅ Validation Scorecard Agent: Completed validation analysis");

    return {
      scorecardData,
      researchText: researchData,
      agentType: "validation-scorecard",
      timestamp: new Date(),
      originalIdeaId: idea.id,
    };
  } catch (error) {
    console.error("❌ Validation Scorecard Agent failed:", error);

    // Return fallback validation scorecard data
    const fallbackData = {
      overallScore: 50,
      validationStatus: "NEEDS_VALIDATION" as const,
      dimensionScores: {
        marketOpportunity: {
          score: 50,
          confidence: "LOW" as const,
          factors: ["Market analysis needed"],
          risks: ["Market size unknown"],
        },
        competitivePositioning: {
          score: 50,
          confidence: "LOW" as const,
          factors: ["Competitive analysis needed"],
          risks: ["Competitive landscape unknown"],
        },
        technicalFeasibility: {
          score: 50,
          confidence: "LOW" as const,
          factors: ["Technical analysis needed"],
          risks: ["Technical complexity unknown"],
        },
        financialViability: {
          score: 50,
          confidence: "LOW" as const,
          factors: ["Financial analysis needed"],
          risks: ["Financial projections unknown"],
        },
        riskAssessment: {
          score: 50,
          confidence: "LOW" as const,
          factors: ["Risk analysis needed"],
          risks: ["Risk factors unknown"],
        },
      },
      strategicRecommendations: {
        primary: "Conduct comprehensive validation research",
        secondary: [
          "Complete market analysis",
          "Analyze competitive landscape",
          "Assess technical feasibility",
        ],
        immediate: [
          "Gather market data",
          "Research competitors",
          "Evaluate technical requirements",
        ],
        longTerm: [
          "Build MVP",
          "Validate with customers",
          "Iterate based on feedback",
        ],
      },
      riskAnalysis: {
        highRisks: [
          "Insufficient market data",
          "Unknown competitive landscape",
          "Unclear technical requirements",
        ],
        mediumRisks: [
          "Limited customer insights",
          "Uncertain financial projections",
          "Unclear go-to-market strategy",
        ],
        lowRisks: [
          "Basic validation framework",
          "General market trends",
          "Standard technical approaches",
        ],
        mitigationStrategies: [
          "Conduct comprehensive research",
          "Validate with customers",
          "Build MVP",
        ],
        riskScore: 70,
      },
      validationMetrics: {
        productMarketFit: 50,
        marketSize: 50,
        competitiveAdvantage: 50,
        technicalFeasibility: 50,
        financialViability: 50,
        executionRisk: 70,
      },
      nextSteps: {
        immediate: [
          "Complete market research",
          "Analyze competitors",
          "Assess technical requirements",
        ],
        shortTerm: [
          "Build MVP",
          "Validate with customers",
          "Refine value proposition",
        ],
        mediumTerm: ["Launch beta", "Gather feedback", "Iterate product"],
        longTerm: [
          "Scale operations",
          "Expand market",
          "Build competitive moats",
        ],
      },
      nextReviewDate: "3 months",
      validationTimeline: "6-12 months",
      overallConfidence: "LOW" as const,
      dataQuality: "LOW" as const,
      recommendations: [
        "Complete comprehensive validation research",
        "Build MVP for customer validation",
        "Conduct competitive analysis",
      ],
    };

    return {
      scorecardData: fallbackData,
      researchText:
        researchData ||
        "Validation scorecard analysis failed - fallback data provided",
      agentType: "validation-scorecard",
      timestamp: new Date(),
      originalIdeaId: idea.id,
    };
  }
};
