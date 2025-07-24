import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";
import { SAAS_VALIDATION_PROMPT } from "../../prompts";
import { allTools } from "../tools";

// ============================================================================
// CUSTOMER SEGMENTS RESEARCH PROMPT (FOR GENERATETEXT WITH TOOLS)
// ============================================================================

const CUSTOMER_SEGMENTS_RESEARCH_PROMPT = `You are an expert customer segmentation analyst with 15+ years of experience in SaaS customer research and market segmentation. Your task is to conduct comprehensive research to identify and analyze customer segments for a specific SaaS idea.

## RESEARCH OBJECTIVES
1. **Identify Target Customer Segments**: Find the most promising customer segments for this SaaS idea
2. **Analyze Customer Pain Points**: Understand what problems these customers face
3. **Research Customer Behavior**: Learn how these customers make decisions and use technology
4. **Validate Market Demand**: Confirm there's real demand for this solution
5. **Analyze Competitive Landscape**: Understand how competitors serve these segments

## RESEARCH STRATEGY

### STEP 1: INITIAL MARKET RESEARCH
- Search for the target market and industry trends
- Research similar products and their customer bases
- Look for market reports and industry analysis
- Find customer testimonials and reviews

### STEP 2: CUSTOMER SEGMENT RESEARCH
- Search for customer profiles and personas in this space
- Research customer pain points and challenges
- Look for customer behavior patterns and preferences
- Find information about customer budgets and decision-making

### STEP 3: COMPETITIVE ANALYSIS
- Research competitors and their customer segments
- Analyze how competitors position themselves
- Look for gaps in competitor offerings
- Research customer satisfaction with existing solutions

### STEP 4: VALIDATION RESEARCH
- Search for market validation data
- Look for customer acquisition costs and conversion rates
- Research customer lifetime value in this market
- Find information about churn rates and retention

## TOOL USAGE GUIDELINES

### SEARCH TOOLS
- Use \`search\` for broad market research and initial exploration
- Use \`searchDetailed\` for comprehensive analysis of specific topics
- Focus on recent information (last 2-3 years) for accuracy

### SCRAPING TOOLS
- Use \`scrapeUrl\` to extract detailed content from relevant websites
- Focus on competitor websites, customer review sites, and industry reports
- Extract customer testimonials, case studies, and pricing information

### RESEARCH TOOLS
- Use \`research\` for comprehensive topic analysis
- Use \`competitorResearch\` to analyze specific competitors
- Use \`trendResearch\` to understand market trends and customer behavior

### ANALYSIS TOOLS
- Use \`sentimentAnalysis\` to understand customer satisfaction
- Use \`multiQueryResearch\` to compare different customer segments

## RESEARCH FOCUS AREAS

### Customer Demographics
- Age ranges, locations, company sizes, industries
- Technology adoption patterns and preferences
- Budget ranges and spending behaviors

### Customer Pain Points
- Primary challenges and problems they face
- Current solutions and their limitations
- Unmet needs and opportunities

### Customer Behavior
- How they make purchasing decisions
- What influences their choices
- Their technology stack and integration needs

### Market Dynamics
- Customer acquisition channels and costs
- Conversion rates and customer lifecycle
- Retention strategies and churn factors

## OUTPUT REQUIREMENTS
Provide comprehensive research findings including:
- Detailed customer segment profiles
- Pain points and challenges for each segment
- Decision-making factors and preferences
- Market size estimates and accessibility
- Competitive landscape analysis
- Customer acquisition and retention insights
- Specific data points and sources for validation

Focus on actionable insights that can inform customer segmentation strategy.`;

// ============================================================================
// CUSTOMER SEGMENTS ANALYSIS PROMPT (FOR GENERATEOBJECT)
// ============================================================================

const CUSTOMER_SEGMENTS_PROMPT = `You are an expert customer segmentation analyst with 15+ years of experience in SaaS customer research and market segmentation. Your ONLY task is to identify and analyze customer segments for a specific SaaS idea using the comprehensive SaaS validation framework.

## SAAS CUSTOMER SEGMENTATION EXPERTISE

### UNDERSTANDING SAAS CUSTOMER DYNAMICS
You understand the unique characteristics of SaaS customers, including:
- Product-led growth vs. sales-led customer acquisition patterns
- Freemium conversion and customer lifecycle management
- Network effects and viral customer acquisition
- Customer lifetime value (CLV) and churn rate optimization
- Self-service onboarding and customer success strategies
- Expansion revenue and customer retention dynamics

### CUSTOMER SEGMENTATION METHODOLOGY

#### 1. SEGMENT IDENTIFICATION
- **Demographic Segmentation**: Age, location, company size, industry
- **Behavioral Segmentation**: Usage patterns, feature adoption, engagement levels
- **Psychographic Segmentation**: Values, attitudes, decision-making styles
- **Technographic Segmentation**: Technology stack, integration preferences
- **Value-Based Segmentation**: Revenue potential, customer lifetime value

#### 2. SEGMENT PROFILING
- **Pain Points**: Primary challenges and problems they face
- **Decision Factors**: What influences their purchasing decisions
- **Budget Range**: Typical spending capacity and willingness to pay
- **Tech Savviness**: Technology adoption and learning curve
- **Integration Needs**: Existing tools and workflow requirements

#### 3. SEGMENT VALIDATION
- **Market Size**: Number of potential customers in each segment
- **Accessibility**: How easily you can reach and acquire them
- **Willingness to Pay**: Price sensitivity and value perception
- **Growth Potential**: Segment growth and expansion opportunities
- **Competitive Position**: How competitors serve these segments

#### 4. SEGMENT PRIORITIZATION
- **Primary Segments**: High-value, accessible, underserved customers
- **Secondary Segments**: Good potential but lower priority
- **Tertiary Segments**: Future expansion opportunities
- **Excluded Segments**: Poor fit or low potential

### SAAS-SPECIFIC CUSTOMER FACTORS

#### Product-Led Growth Segments
- **Self-Service Users**: Prefer to try before buying
- **Viral Adopters**: Likely to share and recommend
- **Power Users**: High engagement and feature usage
- **Casual Users**: Basic usage, low engagement

#### Customer Lifecycle Stages
- **Prospects**: Aware but not yet customers
- **Trials**: Testing the product
- **New Customers**: Recently converted
- **Active Users**: Regular usage
- **At-Risk**: Declining usage
- **Churned**: No longer using

#### Revenue-Based Segments
- **Freemium Users**: Free tier, conversion potential
- **SMB Customers**: Small to medium business budgets
- **Enterprise Customers**: Large organizations, complex needs
- **Expansion Revenue**: Upsell and cross-sell opportunities

## ANALYSIS REQUIREMENTS
- Focus on SaaS-specific customer behaviors and preferences
- Consider product-led growth vs. sales-led customer acquisition
- Analyze freemium conversion and customer lifecycle
- Evaluate network effects and viral mechanics
- Assess customer lifetime value and retention strategies
- Consider international and localization requirements

## OUTPUT FORMAT
Provide ONLY customer segmentation analysis with detailed profiles, segment validation, and prioritization. Do not include market size analysis, competitor research, or other topics. Focus on customer insights that support comprehensive SaaS validation.`;

export const generateCustomerSegmentsData = async (
  idea: any,
  previousResearch?: any,
  additionalContext?: any
) => {
  console.log(
    "🔍 Customer Segments Agent: Starting customer segmentation analysis..."
  );

  // Build comprehensive context from previous research and additional data
  const researchContext = {
    originalIdea: idea,
    previousResearch: previousResearch || {},
    additionalContext: additionalContext || {},
    currentFocus: "customer-segmentation",
  };

  // STEP 1: CONDUCT RESEARCH USING GENERATETEXT WITH TOOLS
  console.log("🔍 Customer Segments Agent: Conducting research with tools...");

  let researchData = "";

  try {
    const { text: researchResults } = await generateText({
      model: google("gemini-2.0-flash", {
        useSearchGrounding: true,
      }),
      tools: allTools,
      maxSteps: 100,
      toolChoice: "required",
      prompt: `${CUSTOMER_SEGMENTS_RESEARCH_PROMPT}

IDEA CONTEXT:
${JSON.stringify(idea, null, 2)}

RESEARCH CONTEXT:
${JSON.stringify(researchContext, null, 2)}

CONDUCT COMPREHENSIVE RESEARCH:
1. Start with broad market research to understand the target market
2. Research customer segments and their characteristics
3. Analyze customer pain points and decision factors
4. Research competitive landscape and customer satisfaction
5. Gather data on customer acquisition, retention, and lifetime value
6. Validate market demand and segment accessibility

Use the available tools to gather comprehensive data about customer segments for this SaaS idea. Focus on actionable insights that can inform segmentation strategy.`,
    });

    researchData = researchResults;
    console.log("✅ Customer Segments Agent: Research phase completed");
  } catch (error) {
    console.error("❌ Customer Segments Agent research phase failed:", error);
    researchData = "Research phase failed - proceeding with limited data";
  }

  // STEP 2: GENERATE STRUCTURED CUSTOMER SEGMENTS DATA
  console.log("🔍 Customer Segments Agent: Generating structured data...");

  try {
    const { object: segmentsData } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: z.object({
        segments: z.array(
          z.object({
            segmentName: z.string(),
            segmentType: z.enum(["PRIMARY", "SECONDARY", "TERTIARY"]),
            priority: z.number().min(1).max(10),

            // Demographics
            ageRange: z.string().optional(),
            location: z.string().optional(),
            companySize: z.string().optional(),
            industry: z.string().optional(),

            // Behavioral Characteristics
            primaryPainPoints: z.array(z.string()),
            decisionFactors: z.array(z.string()),
            budgetRange: z.string().optional(),
            techSavviness: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),

            // Market Metrics
            estimatedSize: z.number().optional(),
            averageSpend: z.number().optional(),
            segmentValue: z.number().optional(),

            // SaaS-Specific Metrics
            freemiumConversion: z.number().optional(), // Percentage
            customerLifetimeValue: z.number().optional(),
            churnRate: z.number().optional(), // Percentage
            expansionRevenue: z.number().optional(), // Percentage

            // Customer Journey
            acquisitionChannels: z.array(z.string()),
            onboardingTime: z.string().optional(),
            timeToValue: z.string().optional(),
            successMetrics: z.array(z.string()),

            // Competitive Position
            currentSolutions: z.array(z.string()),
            switchingCosts: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
            satisfactionLevel: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),

            // Strategic Insights
            opportunities: z.array(z.string()),
            challenges: z.array(z.string()),
            recommendations: z.array(z.string()),

            // Data Quality
            dataConfidence: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
            dataSources: z.array(z.string()),
          })
        ),

        // Segment Analysis
        totalAddressableCustomers: z.number().optional(),
        primarySegmentSize: z.number().optional(),
        secondarySegmentSize: z.number().optional(),

        // Customer Insights
        commonPainPoints: z.array(z.string()),
        keyDecisionFactors: z.array(z.string()),
        budgetPreferences: z.array(z.string()),
        technologyPreferences: z.array(z.string()),

        // SaaS Customer Dynamics
        freemiumAdoption: z.number().optional(), // Percentage
        averageCustomerLifetimeValue: z.number().optional(),
        averageChurnRate: z.number().optional(), // Percentage
        expansionRevenuePotential: z.number().optional(), // Percentage

        // Customer Acquisition
        preferredChannels: z.array(z.string()),
        acquisitionCosts: z.array(z.string()),
        conversionRates: z.array(z.string()),

        // Customer Success
        onboardingChallenges: z.array(z.string()),
        successFactors: z.array(z.string()),
        retentionStrategies: z.array(z.string()),

        // Strategic Recommendations
        segmentPriorities: z.array(z.string()),
        goToMarketStrategy: z.array(z.string()),
        customerSuccessStrategy: z.array(z.string()),

        dataQuality: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
        dataGaps: z.array(z.string()),
        confidenceLevel: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
      }),
      prompt: `${CUSTOMER_SEGMENTS_PROMPT}

IDEA CONTEXT:
${JSON.stringify(idea, null, 2)}

RESEARCH CONTEXT:
${JSON.stringify(researchContext, null, 2)}

RESEARCH DATA:
${researchData}

IMPORTANT: Return a valid JSON object with the exact structure specified in the schema. Do not return a string representation of JSON.

Generate ONLY customer segmentation analysis with detailed profiles, segment validation, and prioritization. Focus on SaaS-specific customer insights and actionable intelligence for validation of this specific idea.

Use the research data provided to inform your analysis and ensure all insights are grounded in real market data.`,
    });

    console.log(
      "✅ Customer Segments Agent: Completed customer segmentation analysis"
    );

    return {
      segmentsData,
      researchText: researchData,
      agentType: "customer-segments",
      timestamp: new Date(),
      originalIdeaId: idea.id,
    };
  } catch (error) {
    console.error("❌ Customer Segments Agent failed:", error);

    // Return fallback customer segments data
    const fallbackData = {
      segments: [],
      totalAddressableCustomers: undefined,
      primarySegmentSize: undefined,
      secondarySegmentSize: undefined,
      commonPainPoints: ["Customer research needed"],
      keyDecisionFactors: ["Decision factor analysis required"],
      budgetPreferences: ["Budget analysis needed"],
      technologyPreferences: ["Technology preference analysis required"],
      freemiumAdoption: undefined,
      averageCustomerLifetimeValue: undefined,
      averageChurnRate: undefined,
      expansionRevenuePotential: undefined,
      preferredChannels: ["Channel analysis needed"],
      acquisitionCosts: ["Cost analysis required"],
      conversionRates: ["Conversion analysis needed"],
      onboardingChallenges: ["Onboarding analysis required"],
      successFactors: ["Success factor analysis needed"],
      retentionStrategies: ["Retention strategy analysis required"],
      segmentPriorities: ["Conduct comprehensive customer research"],
      goToMarketStrategy: ["Develop customer acquisition strategy"],
      customerSuccessStrategy: ["Design customer success program"],
      dataQuality: "LOW" as const,
      dataGaps: ["Customer profiles", "Segment data", "Customer insights"],
      confidenceLevel: "LOW" as const,
    };

    return {
      segmentsData: fallbackData,
      researchText:
        researchData ||
        "Customer segmentation analysis failed - fallback data provided",
      agentType: "customer-segments",
      timestamp: new Date(),
      originalIdeaId: idea.id,
    };
  }
};
