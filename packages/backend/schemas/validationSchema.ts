import { z } from "zod";

export const ValidationResultSchema = z.object({
  marketSize: z.object({
    score: z.number(),
    analysis: z.string(),
    potential: z.string(),
    marketSizeUSD: z.number().optional(),
    growthRate: z.number().optional(),
    targetSegments: z.array(z.string()).optional(),
  }),
  competitorAnalysis: z.object({
    score: z.number(),
    competitors: z.array(z.string()),
    differentiators: z.array(z.string()),
    analysis: z.string(),
    marketShare: z.record(z.string(), z.number()).optional(),
    competitiveAdvantage: z.string().optional(),
  }),
  customerFit: z.object({
    score: z.number(),
    painPoints: z.array(z.string()),
    willingness: z.string(),
    analysis: z.string(),
    userPersonas: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          goals: z.array(z.string()),
          frustrations: z.array(z.string()),
        })
      )
      .optional(),
    customerAcquisitionCost: z.number().optional(),
  }),
  feasibility: z.object({
    score: z.number(),
    technicalChallenges: z.array(z.string()),
    timeToMarket: z.string(),
    analysis: z.string(),
    resourceRequirements: z
      .object({
        development: z.number().optional(),
        marketing: z.number().optional(),
        operations: z.number().optional(),
      })
      .optional(),
    riskFactors: z.array(z.string()).optional(),
  }),
  financials: z
    .object({
      score: z.number(),
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
    })
    .optional(),
  userStories: z
    .array(
      z.object({
        persona: z.string(),
        story: z.string(),
        acceptanceCriteria: z.array(z.string()),
      })
    )
    .optional(),
  overallScore: z.number(),
  recommendation: z.string(),
});
