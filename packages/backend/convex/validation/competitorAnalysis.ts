import { v } from "convex/values";
import { action } from "../_generated/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const CompetitorAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  competitors: z.array(z.string()),
  differentiators: z.array(z.string()),
  analysis: z.string(),
  competitiveAdvantage: z.string().optional(),
});

function createEnhancedPrompt(idea: {
  name: string;
  description: string;
  industry: string;
  problemSolved?: string;
  solutionOffered?: string;
  internal?: boolean;
  openSource?: boolean;
}, marketSizeData?: any): string {
  let prompt = `
## SaaS Idea Details
- Name: ${idea.name}
- Description: ${idea.description}
- Industry: ${idea.industry}
- Problem Solved: ${idea.problemSolved || "Not specified"}
- Solution Offered: ${idea.solutionOffered || "Not specified"}
- Type: ${idea.internal ? "Internal project" : "External/commercial product"}
- License: ${idea.openSource ? "Open Source" : "Proprietary"}
`;

  if (marketSizeData) {
    prompt += `
## Market Size Analysis Context (Score: ${marketSizeData.score}/100)
${marketSizeData.analysis}
Market Potential: ${marketSizeData.potential}
Target Segments: ${marketSizeData.targetSegments?.join(", ") || "Not specified"}

Please use these market insights to enhance your competitive analysis.
`;
  }

  return prompt;
}

export const validateCompetitorAnalysis = action({
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
    marketSizeData: v.optional(v.object({
      score: v.number(),
      analysis: v.string(),
      potential: v.string(),
      marketSizeUSD: v.optional(v.number()),
      growthRate: v.optional(v.number()),
      targetSegments: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, { idea, marketSizeData }) => {
    const prompt = `
You are an expert competitive analyst. Analyze the competitive landscape for this SaaS idea.

${createEnhancedPrompt(idea, marketSizeData)}

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
  },
});