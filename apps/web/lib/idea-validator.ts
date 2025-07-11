"use server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// Individual validation schemas for structured output
const MarketSizeSchema = z.object({
  score: z.number().min(0).max(100),
  analysis: z.string(),
  potential: z.string(),
  marketSizeUSD: z.number().optional(),
  growthRate: z.number().optional(),
  targetSegments: z.array(z.string()).optional(),
});

const CompetitorAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  competitors: z.array(z.string()),
  differentiators: z.array(z.string()),
  analysis: z.string(),
  competitiveAdvantage: z.string().optional(),
});

const CustomerFitSchema = z.object({
  score: z.number().min(0).max(100),
  painPoints: z.array(z.string()),
  willingness: z.string(),
  analysis: z.string(),
  customerAcquisitionCost: z.number().optional(),
});

const FeasibilitySchema = z.object({
  score: z.number().min(0).max(100),
  technicalChallenges: z.array(z.string()),
  timeToMarket: z.string(),
  analysis: z.string(),
  riskFactors: z.array(z.string()).optional(),
});

const FinancialsSchema = z.object({
  score: z.number().min(0).max(100),
  analysis: z.string(),
  estimatedRevenue: z.object({
    year1: z.number(),
    year2: z.number(),
    year3: z.number(),
  }),
  estimatedCosts: z.object({
    year1: z.number(),
    year2: z.number(),
    year3: z.number(),
  }),
  breakEvenPoint: z.string(),
  fundingRequirements: z.number().optional(),
});

const UserStorySchema = z.object({
  persona: z.string(),
  story: z.string(),
  acceptanceCriteria: z.array(z.string()),
});

const KeyFindingSchema = z.object({
  content: z.string(),
  importance: z.enum(["low", "medium", "high"]),
  category: z.enum([
    "market",
    "competition",
    "technical",
    "financial",
    "customer",
  ]),
  order: z.number(),
});

const NextStepSchema = z.object({
  content: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  category: z.enum([
    "research",
    "development",
    "marketing",
    "validation",
    "planning",
  ]),
  order: z.number(),
});

const AdopterProfileSchema = z.object({
  name: z.string(),
  description: z.string(),
  techSavviness: z.enum(["low", "medium", "high"]),
  innovativeness: z.enum(["low", "medium", "high"]),
  riskTolerance: z.enum(["low", "medium", "high"]),
  socialInfluence: z.enum(["low", "medium", "high"]),
  needRecognition: z.enum(["low", "medium", "high"]),
  financialResources: z.enum(["limited", "moderate", "substantial"]),
  channelsWhereToFind: z.string().optional(),
  problemSolvingMotivation: z.string().optional(),
  statusSeekingMotivation: z.string().optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
});

const CompetitorSchema = z.object({
  name: z.string(),
  description: z.string(),
  industry: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  revenue: z.number().optional(),
  marketShare: z.number().optional(),
});

const SwotAnalysisSchema = z.object({
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  opportunities: z.array(z.string()),
  threats: z.array(z.string()),
});

export interface IdeaValidationInput {
  name: string;
  description: string;
  industry: string;
  problemSolved?: string;
  solutionOffered?: string;
  internal?: boolean;
  openSource?: boolean;
}

export interface ValidationResults {
  marketSize: z.infer<typeof MarketSizeSchema>;
  competitorAnalysis: z.infer<typeof CompetitorAnalysisSchema>;
  customerFit: z.infer<typeof CustomerFitSchema>;
  feasibility: z.infer<typeof FeasibilitySchema>;
  financials: z.infer<typeof FinancialsSchema>;
  userStories: z.infer<typeof UserStorySchema>[];
  keyFindings: z.infer<typeof KeyFindingSchema>[];
  nextSteps: z.infer<typeof NextStepSchema>[];
  adopterProfiles: z.infer<typeof AdopterProfileSchema>[];
  competitors: z.infer<typeof CompetitorSchema>[];
  swotAnalysis: z.infer<typeof SwotAnalysisSchema>;
  overallScore: number;
  recommendation: string;
}

function createBasePrompt(idea: IdeaValidationInput): string {
  return `
## SaaS Idea Details
- Name: ${idea.name}
- Description: ${idea.description}
- Industry: ${idea.industry}
- Problem Solved: ${idea.problemSolved || "Not specified"}
- Solution Offered: ${idea.solutionOffered || "Not specified"}
- Type: ${idea.internal ? "Internal project" : "External/commercial product"}
- License: ${idea.openSource ? "Open Source" : "Proprietary"}
`;
}

export async function validateMarketSize(idea: IdeaValidationInput) {
  const prompt = `
You are an expert market analyst. Analyze the market size and potential for this SaaS idea.

${createBasePrompt(idea)}

Please provide a comprehensive market size analysis including:
1. Total Addressable Market (TAM) evaluation
2. Market growth rate and potential assessment
3. Key market segments identification
4. Market size in USD (if estimable)
5. Target segments list
6. Overall market opportunity score (0-100)

Focus on data-driven insights and be specific about market potential.
`;

  const { object } = await generateObject({
    model: google("gemini-1.5-flash"),
    schema: MarketSizeSchema,
    prompt,
    temperature: 0.7,
    maxTokens: 1500,
  });

  return object;
}

export async function validateCompetitorAnalysis(idea: IdeaValidationInput) {
  const prompt = `
You are an expert competitive analyst. Analyze the competitive landscape for this SaaS idea.

${createBasePrompt(idea)}

Please provide a comprehensive competitor analysis including:
1. Identify 3-7 key competitors in this space
2. List 3-5 potential differentiators for this idea
3. Analyze competitive positioning and advantages
4. Assess competitive landscape score (0-100)

Be specific about actual competitors and realistic differentiators.
`;

  const { object } = await generateObject({
    model: google("gemini-1.5-flash"),
    schema: CompetitorAnalysisSchema,
    prompt,
    temperature: 0.7,
    maxTokens: 1500,
  });

  return object;
}

export async function validateCustomerFit(idea: IdeaValidationInput) {
  const prompt = `
You are an expert customer research analyst. Analyze the customer fit for this SaaS idea.

${createBasePrompt(idea)}

Please provide a comprehensive customer fit analysis including:
1. Identify 3-5 key pain points this solution addresses
2. Assess customer willingness to pay
3. Analyze product-market fit potential
4. Estimate customer acquisition cost if possible
5. Overall customer fit score (0-100)

Focus on real customer needs and pain points.
`;

  const { object } = await generateObject({
    model: google("gemini-1.5-flash"),
    schema: CustomerFitSchema,
    prompt,
    temperature: 0.7,
    maxTokens: 1500,
  });

  return object;
}

export async function validateFeasibility(idea: IdeaValidationInput) {
  const prompt = `
You are an expert technical and business feasibility analyst. Analyze the feasibility of this SaaS idea.

${createBasePrompt(idea)}

Please provide a comprehensive feasibility analysis including:
1. Identify 3-5 potential technical challenges
2. Estimate realistic time-to-market
3. Identify potential risk factors
4. Assess overall technical feasibility score (0-100)

Be realistic about technical complexity and implementation challenges.
`;

  const { object } = await generateObject({
    model: google("gemini-1.5-flash"),
    schema: FeasibilitySchema,
    prompt,
    temperature: 0.7,
    maxTokens: 1500,
  });

  return object;
}

export async function validateFinancials(idea: IdeaValidationInput) {
  const prompt = `
You are an expert financial analyst specializing in SaaS businesses. Analyze the financial viability of this idea.

${createBasePrompt(idea)}

Please provide a comprehensive financial analysis including:
1. Estimate revenue potential for years 1-3
2. Estimate costs for years 1-3
3. Determine break-even timeline
4. Estimate funding requirements if needed
5. Overall financial viability score (0-100)

Provide realistic financial projections based on similar SaaS businesses.
`;

  const { object } = await generateObject({
    model: google("gemini-1.5-flash"),
    schema: FinancialsSchema,
    prompt,
    temperature: 0.7,
    maxTokens: 1500,
  });

  return object;
}

export async function generateUserStories(idea: IdeaValidationInput) {
  const prompt = `
You are an expert product manager. Create user stories for this SaaS idea.

${createBasePrompt(idea)}

Please create 3-5 user stories that capture the core functionality and value proposition:
1. Each story should follow the format: "As a [persona], I want [goal] so that [benefit]"
2. Include specific acceptance criteria for each story
3. Focus on the most important user workflows

Make the stories specific and actionable for development.
`;

  const { object } = await generateObject({
    model: google("gemini-1.5-flash"),
    schema: z.array(UserStorySchema),
    prompt,
    temperature: 0.7,
    maxTokens: 2000,
  });

  return object;
}

export async function generateKeyFindings(idea: IdeaValidationInput) {
  const prompt = `
You are an expert business analyst. Generate key findings from analyzing this SaaS idea.

${createBasePrompt(idea)}

Please provide 5-8 key findings that summarize the most important insights about this idea:
1. Each finding should be a concise, actionable insight
2. Categorize each finding (market, competition, technical, financial, customer)
3. Assign importance level (low, medium, high)
4. Order them by relevance (1 being most important)

Focus on the most critical insights that would influence decision-making.
`;

  const { object } = await generateObject({
    model: google("gemini-1.5-flash"),
    schema: z.array(KeyFindingSchema),
    prompt,
    temperature: 0.7,
    maxTokens: 2000,
  });

  return object;
}

export async function generateNextSteps(idea: IdeaValidationInput) {
  const prompt = `
You are an expert startup advisor. Generate actionable next steps for this SaaS idea.

${createBasePrompt(idea)}

Please provide 5-8 specific next steps that should be taken to move this idea forward:
1. Each step should be concrete and actionable
2. Categorize each step (research, development, marketing, validation, planning)
3. Assign priority level (low, medium, high)
4. Order them by execution sequence (1 being first priority)

Focus on the most important actions to validate and develop this idea.
`;

  const { object } = await generateObject({
    model: google("gemini-1.5-flash"),
    schema: z.array(NextStepSchema),
    prompt,
    temperature: 0.7,
    maxTokens: 2000,
  });

  return object;
}

export async function generateAdopterProfiles(idea: IdeaValidationInput) {
  const prompt = `
You are an expert customer segmentation analyst. Create early adopter profiles for this SaaS idea.

${createBasePrompt(idea)}

Please create 2-3 detailed early adopter profiles:
1. Each profile should represent a distinct user segment
2. Include demographic and psychographic characteristics
3. Assess their tech-savviness, innovativeness, risk tolerance, etc.
4. Identify where to find these users and their motivations

Focus on realistic profiles of users who would be first to adopt this solution.
`;

  const { object } = await generateObject({
    model: google("gemini-1.5-flash"),
    schema: z.array(AdopterProfileSchema),
    prompt,
    temperature: 0.7,
    maxTokens: 2000,
  });

  return object;
}

export async function generateCompetitorDetails(idea: IdeaValidationInput) {
  const prompt = `
You are an expert competitive intelligence analyst. Provide detailed competitor information for this SaaS idea.

${createBasePrompt(idea)}

Please identify and analyze 3-5 key competitors:
1. Include both direct and indirect competitors
2. Provide company details, market position, and estimated metrics
3. Focus on realistic, existing companies in this space
4. Include revenue estimates and market share if available

Be specific about actual companies and their competitive positioning.
`;

  const { object } = await generateObject({
    model: google("gemini-1.5-flash"),
    schema: z.array(CompetitorSchema),
    prompt,
    temperature: 0.7,
    maxTokens: 2000,
  });

  return object;
}

export async function generateSwotAnalysis(idea: IdeaValidationInput) {
  const prompt = `
You are an expert strategic analyst. Perform a SWOT analysis for this SaaS idea.

${createBasePrompt(idea)}

Please provide a comprehensive SWOT analysis:
1. Strengths: Internal positive factors and advantages
2. Weaknesses: Internal negative factors and limitations
3. Opportunities: External positive factors and market opportunities
4. Threats: External negative factors and potential risks

Provide 3-5 points for each category, focusing on the most significant factors.
`;

  const { object } = await generateObject({
    model: google("gemini-1.5-flash"),
    schema: SwotAnalysisSchema,
    prompt,
    temperature: 0.7,
    maxTokens: 2000,
  });

  return object;
}

export async function validateIdea(
  idea: IdeaValidationInput
): Promise<ValidationResults> {
  try {
    // Run all validation stages in parallel for better performance
    const [
      marketSize,
      competitorAnalysis,
      customerFit,
      feasibility,
      financials,
      userStories,
      keyFindings,
      nextSteps,
      adopterProfiles,
      competitors,
      swotAnalysis,
    ] = await Promise.all([
      validateMarketSize(idea),
      validateCompetitorAnalysis(idea),
      validateCustomerFit(idea),
      validateFeasibility(idea),
      validateFinancials(idea),
      generateUserStories(idea),
      generateKeyFindings(idea),
      generateNextSteps(idea),
      generateAdopterProfiles(idea),
      generateCompetitorDetails(idea),
      generateSwotAnalysis(idea),
    ]);

    // Calculate overall score from component scores
    const componentScores = [
      marketSize.score,
      competitorAnalysis.score,
      customerFit.score,
      feasibility.score,
      financials.score,
    ];

    const overallScore = Math.round(
      componentScores.reduce((sum, score) => sum + score, 0) /
        componentScores.length
    );

    // Generate overall recommendation based on score
    let recommendation: string;
    if (overallScore >= 80) {
      recommendation =
        "Strongly recommended: This idea shows excellent potential across all key areas.";
    } else if (overallScore >= 65) {
      recommendation =
        "Recommended with conditions: This idea has good potential but requires attention to identified weaknesses.";
    } else if (overallScore >= 50) {
      recommendation =
        "Proceed with caution: This idea has moderate potential but faces significant challenges.";
    } else {
      recommendation =
        "Not recommended: This idea faces substantial challenges that may make it unviable.";
    }

    return {
      marketSize,
      competitorAnalysis,
      customerFit,
      feasibility,
      financials,
      userStories,
      keyFindings,
      nextSteps,
      adopterProfiles,
      competitors,
      swotAnalysis,
      overallScore,
      recommendation,
    };
  } catch (error) {
    console.error("Error validating idea:", error);
    throw new Error(
      `Failed to validate idea: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
