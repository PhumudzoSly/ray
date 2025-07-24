import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";
import { SAAS_VALIDATION_PROMPT } from "../../prompts";

// ============================================================================
// CUSTOMER SEGMENTS ANALYSIS PROMPT
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

  // STEP 1: GENERATE STRUCTURED CUSTOMER SEGMENTS DATA
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

IMPORTANT: Return a valid JSON object with the exact structure specified in the schema. Do not return a string representation of JSON.

Generate ONLY customer segmentation analysis with detailed profiles, segment validation, and prioritization. Focus on SaaS-specific customer insights and actionable intelligence for validation of this specific idea.`,
    });

    console.log(
      "✅ Customer Segments Agent: Completed customer segmentation analysis"
    );

    return {
      segmentsData,
      researchText:
        "AI-based customer segmentation analysis completed using industry knowledge and SaaS customer dynamics",
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
        "Customer segmentation analysis failed - fallback data provided",
      agentType: "customer-segments",
      timestamp: new Date(),
      originalIdeaId: idea.id,
    };
  }
};
