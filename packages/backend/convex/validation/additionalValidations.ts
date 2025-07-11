import { v } from "convex/values";
import { action } from "../_generated/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

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

// User Stories Generation
export const generateUserStories = action({
  args: {
    idea: v.object({
      name: v.string(),
      description: v.string(),
      industry: v.string(),
      problemSolved: v.optional(v.string()),
      solutionOffered: v.optional(v.string()),
      internal: v.optional(v.boolean()),
      openSource: v.optional(v.boolean()),
    }),
    validationData: v.optional(v.object({
      customerFit: v.optional(v.object({
        painPoints: v.array(v.string()),
        willingness: v.string(),
      })),
    })),
  },
  handler: async (ctx, { idea, validationData }) => {
    let prompt = `
You are an expert product manager. Create user stories for this SaaS idea.

## SaaS Idea Details
- Name: ${idea.name}
- Description: ${idea.description}
- Industry: ${idea.industry}
- Problem Solved: ${idea.problemSolved || "Not specified"}
- Solution Offered: ${idea.solutionOffered || "Not specified"}
`;

    if (validationData?.customerFit) {
      prompt += `
## Customer Insights
Key Pain Points: ${validationData.customerFit.painPoints.join(", ")}
Customer Willingness: ${validationData.customerFit.willingness}
`;
    }

    prompt += `
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
  },
});

// Key Findings Generation
export const generateKeyFindings = action({
  args: {
    idea: v.object({
      name: v.string(),
      description: v.string(),
      industry: v.string(),
      problemSolved: v.optional(v.string()),
      solutionOffered: v.optional(v.string()),
      internal: v.optional(v.boolean()),
      openSource: v.optional(v.boolean()),
    }),
    allValidationData: v.optional(v.object({
      marketSize: v.optional(v.object({ score: v.number() })),
      competitorAnalysis: v.optional(v.object({ score: v.number() })),
      customerFit: v.optional(v.object({ score: v.number() })),
      feasibility: v.optional(v.object({ score: v.number() })),
      financials: v.optional(v.object({ score: v.number() })),
    })),
  },
  handler: async (ctx, { idea, allValidationData }) => {
    let prompt = `
You are an expert business analyst. Generate key findings from analyzing this SaaS idea.

## SaaS Idea Details
- Name: ${idea.name}
- Description: ${idea.description}
- Industry: ${idea.industry}
`;

    if (allValidationData) {
      prompt += `
## Validation Scores
- Market Size: ${allValidationData.marketSize?.score || "N/A"}/100
- Competition: ${allValidationData.competitorAnalysis?.score || "N/A"}/100
- Customer Fit: ${allValidationData.customerFit?.score || "N/A"}/100
- Feasibility: ${allValidationData.feasibility?.score || "N/A"}/100
- Financials: ${allValidationData.financials?.score || "N/A"}/100
`;
    }

    prompt += `
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
  },
});

// Next Steps Generation
export const generateNextSteps = action({
  args: {
    idea: v.object({
      name: v.string(),
      description: v.string(),
      industry: v.string(),
      problemSolved: v.optional(v.string()),
      solutionOffered: v.optional(v.string()),
      internal: v.optional(v.boolean()),
      openSource: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { idea }) => {
    const prompt = `
You are an expert startup advisor. Generate actionable next steps for this SaaS idea.

## SaaS Idea Details
- Name: ${idea.name}
- Description: ${idea.description}
- Industry: ${idea.industry}
- Problem Solved: ${idea.problemSolved || "Not specified"}
- Solution Offered: ${idea.solutionOffered || "Not specified"}

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
  },
});

// Adopter Profiles Generation
export const generateAdopterProfiles = action({
  args: {
    idea: v.object({
      name: v.string(),
      description: v.string(),
      industry: v.string(),
      problemSolved: v.optional(v.string()),
      solutionOffered: v.optional(v.string()),
      internal: v.optional(v.boolean()),
      openSource: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { idea }) => {
    const prompt = `
You are an expert customer segmentation analyst. Create early adopter profiles for this SaaS idea.

## SaaS Idea Details
- Name: ${idea.name}
- Description: ${idea.description}
- Industry: ${idea.industry}
- Problem Solved: ${idea.problemSolved || "Not specified"}
- Solution Offered: ${idea.solutionOffered || "Not specified"}

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
  },
});

// Competitor Details Generation
export const generateCompetitorDetails = action({
  args: {
    idea: v.object({
      name: v.string(),
      description: v.string(),
      industry: v.string(),
      problemSolved: v.optional(v.string()),
      solutionOffered: v.optional(v.string()),
      internal: v.optional(v.boolean()),
      openSource: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { idea }) => {
    const prompt = `
You are an expert competitive intelligence analyst. Provide detailed competitor information for this SaaS idea.

## SaaS Idea Details
- Name: ${idea.name}
- Description: ${idea.description}
- Industry: ${idea.industry}
- Problem Solved: ${idea.problemSolved || "Not specified"}
- Solution Offered: ${idea.solutionOffered || "Not specified"}

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
  },
});

// SWOT Analysis Generation
export const generateSwotAnalysis = action({
  args: {
    idea: v.object({
      name: v.string(),
      description: v.string(),
      industry: v.string(),
      problemSolved: v.optional(v.string()),
      solutionOffered: v.optional(v.string()),
      internal: v.optional(v.boolean()),
      openSource: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { idea }) => {
    const prompt = `
You are an expert strategic analyst. Perform a SWOT analysis for this SaaS idea.

## SaaS Idea Details
- Name: ${idea.name}
- Description: ${idea.description}
- Industry: ${idea.industry}
- Problem Solved: ${idea.problemSolved || "Not specified"}
- Solution Offered: ${idea.solutionOffered || "Not specified"}

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
  },
});