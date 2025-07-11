import { v } from "convex/values";
import { action } from "../_generated/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

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

export const validateFinancials = action({
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
      feasibility: v.optional(v.object({
        score: v.number(),
        technicalChallenges: v.array(v.string()),
        timeToMarket: v.string(),
        analysis: v.string(),
        riskFactors: v.optional(v.array(v.string())),
      })),
    })),
  },
  handler: async (ctx, { idea, previousData }) => {
    let prompt = `
You are an expert financial analyst specializing in SaaS businesses. Analyze the financial viability of this idea.

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
        prompt += `Market Size: $${previousData.marketSize.marketSizeUSD || "Unknown"} USD (Score: ${previousData.marketSize.score}/100)\n`;
        prompt += `Growth Rate: ${previousData.marketSize.growthRate || "Unknown"}%\n`;
      }
      
      if (previousData.customerFit) {
        prompt += `Customer Acquisition Cost: $${previousData.customerFit.customerAcquisitionCost || "Unknown"}\n`;
        prompt += `Customer Willingness to Pay: ${previousData.customerFit.willingness}\n`;
      }
      
      if (previousData.feasibility) {
        prompt += `Time to Market: ${previousData.feasibility.timeToMarket}\n`;
        prompt += `Technical Challenges: ${previousData.feasibility.technicalChallenges.join(", ")}\n`;
      }
      
      prompt += "\nPlease use these insights to create realistic financial projections.\n";
    }

    prompt += `
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
  },
});