import { defineTable } from "convex/server";
import { v } from "convex/values";
import { ideaStatus, importance, category, financialResources } from "./enums";

export const idea = defineTable({
  name: v.string(),
  description: v.string(),
  industry: v.string(),
  ownerId: v.optional(v.id("user")),
  organizationId: v.id("organization"),
  internal: v.boolean(),
  openSource: v.boolean(),
  status: ideaStatus,
  aiOverallValidation: v.optional(
    v.object({
      overallRating: v.number(),
      overallComment: v.string(),
      lastValidated: v.optional(v.number()),
      validationCount: v.optional(v.number()),
    })
  ),
  problemSolved: v.optional(v.string()),
  solutionOffered: v.optional(v.string()),
})
  .index("byOrg", ["organizationId"])
  .index("byOwner", ["ownerId"]);

export const validationResults = defineTable({
  ideaId: v.id("idea"),
  overallScore: v.number(),
  recommendation: v.string(),
  validatedAt: v.number(),
  validatedBy: v.optional(v.id("user")),
})
  .index("byIdea", ["ideaId"])
  .index("byDate", ["validatedAt"]);

export const marketSizeValidation = defineTable({
  validationResultId: v.id("validationResults"),
  score: v.number(),
  analysis: v.string(),
  potential: v.string(),
  marketSizeUSD: v.optional(v.number()),
  growthRate: v.optional(v.number()),
  targetSegments: v.optional(v.array(v.string())),
}).index("byValidation", ["validationResultId"]);

export const competitorValidation = defineTable({
  validationResultId: v.id("validationResults"),
  score: v.number(),
  analysis: v.string(),
  competitors: v.array(v.string()),
  differentiators: v.array(v.string()),
  competitiveAdvantage: v.optional(v.string()),
}).index("byValidation", ["validationResultId"]);

export const customerFitValidation = defineTable({
  validationResultId: v.id("validationResults"),
  score: v.number(),
  analysis: v.string(),
  painPoints: v.array(v.string()),
  willingness: v.string(),
  customerAcquisitionCost: v.optional(v.number()),
}).index("byValidation", ["validationResultId"]);

export const feasibilityValidation = defineTable({
  validationResultId: v.id("validationResults"),
  score: v.number(),
  analysis: v.string(),
  technicalChallenges: v.array(v.string()),
  timeToMarket: v.string(),
  riskFactors: v.optional(v.array(v.string())),
}).index("byValidation", ["validationResultId"]);

export const financialValidation = defineTable({
  validationResultId: v.id("validationResults"),
  score: v.number(),
  analysis: v.string(),
  estimatedRevenue: v.object({
    year1: v.number(),
    year2: v.number(),
    year3: v.number(),
  }),
  estimatedCosts: v.object({
    year1: v.number(),
    year2: v.number(),
    year3: v.number(),
  }),
  breakEvenPoint: v.string(),
  fundingRequirements: v.optional(v.number()),
}).index("byValidation", ["validationResultId"]);

export const userStoryValidation = defineTable({
  validationResultId: v.id("validationResults"),
  persona: v.string(),
  story: v.string(),
  acceptanceCriteria: v.array(v.string()),
}).index("byValidation", ["validationResultId"]);

export const keyFinding = defineTable({
  content: v.string(),
  importance: importance,
  category: category,
  order: v.number(),
  ideaId: v.id("idea"),
}).index("byIdea", ["ideaId"]);

export const nextStep = defineTable({
  content: v.string(),
  priority: importance,
  category: category,
  order: v.number(),
  ideaId: v.id("idea"),
}).index("byIdea", ["ideaId"]);

export const adopterProfile = defineTable({
  ideaId: v.id("idea"),
  name: v.string(),
  description: v.string(),
  techSavviness: importance,
  innovativeness: importance,
  riskTolerance: importance,
  socialInfluence: importance,
  needRecognition: importance,
  financialResources: financialResources,
  channelsWhereToFind: v.optional(v.string()),
  problemSolvingMotivation: v.optional(v.string()),
  statusSeekingMotivation: v.optional(v.string()),
  location: v.optional(v.string()),
  industry: v.optional(v.string()),
}).index("byIdea", ["ideaId"]);

export const competitor = defineTable({
  ideaId: v.id("idea"),
  name: v.string(),
  description: v.string(),
  industry: v.optional(v.string()),
  location: v.optional(v.string()),
  website: v.optional(v.string()),
  revenue: v.optional(v.number()),
  marketShare: v.optional(v.number()),
}).index("byIdea", ["ideaId"]);

export const competitorSwot = defineTable({
  ideaId: v.id("idea"),
  type: v.union(
    v.literal("strength"),
    v.literal("weakness"),
    v.literal("opportunity"),
    v.literal("threat")
  ),
  description: v.string(),
}).index("byIdea", ["ideaId"]);
