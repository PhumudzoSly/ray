import { v } from "convex/values";
import { action } from "../_generated/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const FeasibilitySchema = z.object({
  score: z.number().min(0).max(100),
  technicalChallenges: z.array(z.string()),
  timeToMarket: z.string(),
  analysis: z.string(),
  riskFactors: z.array(z.string()).optional(),
});

export const validateFeasibility = action({
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
    previousData: v.optional(v.object({
      marketSize: v.optional(v.object({
        score: v.number(),
        analysis: v.string(),
        potential: v.string(),
        marketSizeUSD: v.optional(v.number()),
        growthRate: v.optional(v.number()),
        targetSegments: v.optional(v.array(v.string())),
      })),
      competitorAnalysis: v.optional(v.object({
        score: v.number(),
        competitors: v.array(v.string()),
        differentiators: v.array(v.string()),
        analysis: v.string(),
        competitiveAdvantage: v.optional(v.string()),
      })),
      customerFit: v.optional(v.object({
        score: v.number(),
        painPoints: v.array(v.string()),
        willingness: v.string(),
        analysis: v.string(),
        customerAcquisitionCost: v.optional(v.number()),
      })),
    })),
  },
  handler: async (ctx, { idea, previousData }) => {
    let prompt = `
You are an expert technical and business feasibility analyst. Analyze the feasibility of this SaaS idea.

## SaaS Idea Details
- Name: ${idea.name}
- Description: ${idea.description}
- Industry: ${idea.industry}
- Problem Solved: ${idea.problemSolved || "Not specified"}
- Solution Offered: ${idea.solutionOffered || "Not specified"}
- Type: ${idea.internal ? "Internal project" : "External/commercial product"}
- License: ${idea.openSource ? "Open Source" : "Proprietary"}
`;

    if (previousData) {
      prompt += "\n## Previous Analysis Context\n";
      
      if (previousData.marketSize) {
        prompt += `Market Size Score: ${previousData.marketSize.score}/100\n`;
      }
      
      if (previousData.competitorAnalysis) {
        prompt += `Competition Score: ${previousData.competitorAnalysis.score}/100\n`;
        prompt += `Key Competitors: ${previousData.competitorAnalysis.competitors.join(", ")}\n`;
      }
      
      if (previousData.customerFit) {
        prompt += `Customer Fit Score: ${previousData.customerFit.score}/100\n`;
        prompt += `Key Pain Points: ${previousData.customerFit.painPoints.join(", ")}\n`;
      }
      
      prompt += "\nPlease consider these insights in your feasibility analysis.\n";
    }

    prompt += `
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
  },
});