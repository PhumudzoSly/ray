import { v } from "convex/values";
import { action } from "../_generated/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const MarketSizeSchema = z.object({
  score: z.number().min(0).max(100),
  analysis: z.string(),
  potential: z.string(),
  marketSizeUSD: z.number().optional(),
  growthRate: z.number().optional(),
  targetSegments: z.array(z.string()).optional(),
});

function createBasePrompt(idea: {
  name: string;
  description: string;
  industry: string;
  problemSolved?: string;
  solutionOffered?: string;
  internal?: boolean;
  openSource?: boolean;
}): string {
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

export const validateMarketSize = action({
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
  },
});