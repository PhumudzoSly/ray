import { v } from "convex/values";
import { action } from "../_generated/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const CustomerFitSchema = z.object({
  score: z.number().min(0).max(100),
  painPoints: z.array(z.string()),
  willingness: z.string(),
  analysis: z.string(),
  customerAcquisitionCost: z.number().optional(),
});

function createEnhancedPrompt(
  idea: {
    name: string;
    description: string;
    industry: string;
    problemSolved?: string;
    solutionOffered?: string;
    internal?: boolean;
    openSource?: boolean;
  },
  previousData?: {
    marketSize?: any;
    competitorAnalysis?: any;
  }
): string {
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

  if (previousData?.marketSize) {
    prompt += `
## Market Size Analysis Context (Score: ${previousData.marketSize.score}/100)
${previousData.marketSize.analysis}
Target Segments: ${previousData.marketSize.targetSegments?.join(", ") || "Not specified"}
`;
  }

  if (previousData?.competitorAnalysis) {
    prompt += `
## Competitor Analysis Context (Score: ${previousData.competitorAnalysis.score}/100)
Key Competitors: ${previousData.competitorAnalysis.competitors.join(", ")}
Differentiators: ${previousData.competitorAnalysis.differentiators.join(", ")}
`;
  }

  if (previousData?.marketSize || previousData?.competitorAnalysis) {
    prompt += `\nPlease use these insights to enhance your customer fit analysis.\n`;
  }

  return prompt;
}

export const validateCustomerFit = action({
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
    })),
  },
  handler: async (ctx, { idea, previousData }) => {
    const prompt = `
You are an expert customer research analyst. Analyze the customer fit for this SaaS idea.

${createEnhancedPrompt(idea, previousData)}

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
  },
});