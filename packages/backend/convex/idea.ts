import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { ideaStatus } from "../schemas/enums";
import { Id } from "./_generated/dataModel";
import { ConvexSession } from "./betterAuth";
import { ValidationResultSchema } from "../schemas/validationSchema";

// Helper function to map validation categories to database categories
function mapValidationCategoryToDbCategory(
  category:
    | "market"
    | "competition"
    | "technical"
    | "financial"
    | "customer"
    | "research"
    | "development"
    | "marketing"
    | "validation"
    | "planning"
): "PRODUCT" | "MARKETING" | "FINANCIAL" | "LEGAL" | "OTHER" {
  switch (category) {
    case "market":
    case "customer":
      return "MARKETING";
    case "financial":
      return "FINANCIAL";
    case "technical":
    case "development":
    case "research":
    case "validation":
    case "planning":
      return "PRODUCT";
    case "competition":
    case "marketing":
      return "MARKETING";
    default:
      return "OTHER";
  }
}

// Helper function to map importance levels
function mapImportanceLevel(
  level: "low" | "medium" | "high"
): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" {
  switch (level) {
    case "high":
      return "HIGH";
    case "medium":
      return "MEDIUM";
    case "low":
      return "LOW";
    default:
      return "LOW";
  }
}

// Helper function to map financial resources
function mapFinancialResources(
  resources: "limited" | "moderate" | "substantial"
): "LIMITED" | "ADEQUATE" | "ABUNDANT" {
  switch (resources) {
    case "limited":
      return "LIMITED";
    case "moderate":
      return "ADEQUATE";
    case "substantial":
      return "ABUNDANT";
    default:
      return "LIMITED";
  }
}

export const addIdea = mutation({
  args: {
    token: v.string(),
    idea: v.object({
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
        })
      ),
      problemSolved: v.optional(v.string()),
      solutionOffered: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { token, idea }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session || idea.organizationId !== session.activeOrganizationId) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("idea", { ...idea, status: "INVALIDATED" });
  },
});

export const getIdeas = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      return [];
    }

    return await ctx.db
      .query("idea")
      .withIndex("byOrg", (q) =>
        q.eq("organizationId", session.activeOrganizationId as Id<any>)
      )
      .collect();
  },
});

export const sidebarIdeas = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      return null;
    }

    return await ctx.db
      .query("idea")
      .withIndex("byOrg", (q) =>
        q.eq("organizationId", session.activeOrganizationId as Id<any>)
      )
      .collect();
  },
});

export const getSingleIdea = query({
  args: { id: v.id("idea"), token: v.string() },
  handler: async (ctx, { id, token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw new Error("Not authenticated");
    }

    const idea = await ctx.db.get(id);

    if (session.activeOrganizationId !== idea?.organizationId) {
      throw new Error("Unauthorized");
    }

    return idea;
  },
});

export const changeStatus = mutation({
  args: { token: v.string(), status: ideaStatus, id: v.id("idea") },
  handler: async (ctx, { token, status, id }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(id, {
      status,
    });
  },
});

// Updated validation mutation with split tables
export const updateValidation = mutation({
  args: {
    token: v.string(),
    id: v.id("idea"),
    validationResults: v.object({
      marketSize: v.object({
        score: v.number(),
        analysis: v.string(),
        potential: v.string(),
        marketSizeUSD: v.optional(v.number()),
        growthRate: v.optional(v.number()),
        targetSegments: v.optional(v.array(v.string())),
      }),
      competitorAnalysis: v.object({
        score: v.number(),
        competitors: v.array(v.string()),
        differentiators: v.array(v.string()),
        analysis: v.string(),
        competitiveAdvantage: v.optional(v.string()),
      }),
      customerFit: v.object({
        score: v.number(),
        painPoints: v.array(v.string()),
        willingness: v.string(),
        analysis: v.string(),
        customerAcquisitionCost: v.optional(v.number()),
      }),
      feasibility: v.object({
        score: v.number(),
        technicalChallenges: v.array(v.string()),
        timeToMarket: v.string(),
        analysis: v.string(),
        riskFactors: v.optional(v.array(v.string())),
      }),
      financials: v.object({
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
      }),
      userStories: v.array(
        v.object({
          persona: v.string(),
          story: v.string(),
          acceptanceCriteria: v.array(v.string()),
        })
      ),
      keyFindings: v.array(
        v.object({
          content: v.string(),
          importance: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
          ),
          category: v.union(
            v.literal("market"),
            v.literal("competition"),
            v.literal("technical"),
            v.literal("financial"),
            v.literal("customer")
          ),
          order: v.number(),
        })
      ),
      nextSteps: v.array(
        v.object({
          content: v.string(),
          priority: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
          ),
          category: v.union(
            v.literal("research"),
            v.literal("development"),
            v.literal("marketing"),
            v.literal("validation"),
            v.literal("planning")
          ),
          order: v.number(),
        })
      ),
      adopterProfiles: v.array(
        v.object({
          name: v.string(),
          description: v.string(),
          techSavviness: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
          ),
          innovativeness: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
          ),
          riskTolerance: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
          ),
          socialInfluence: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
          ),
          needRecognition: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
          ),
          financialResources: v.union(
            v.literal("limited"),
            v.literal("moderate"),
            v.literal("substantial")
          ),
          channelsWhereToFind: v.optional(v.string()),
          problemSolvingMotivation: v.optional(v.string()),
          statusSeekingMotivation: v.optional(v.string()),
          location: v.optional(v.string()),
          industry: v.optional(v.string()),
        })
      ),
      competitors: v.array(
        v.object({
          name: v.string(),
          description: v.string(),
          industry: v.optional(v.string()),
          location: v.optional(v.string()),
          website: v.optional(v.string()),
          revenue: v.optional(v.number()),
          marketShare: v.optional(v.number()),
        })
      ),
      swotAnalysis: v.object({
        strengths: v.array(v.string()),
        weaknesses: v.array(v.string()),
        opportunities: v.array(v.string()),
        threats: v.array(v.string()),
      }),
      overallScore: v.number(),
      recommendation: v.string(),
    }),
  },
  handler: async (ctx, { token, id, validationResults }): Promise<any> => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw new Error("Not authenticated");
    }

    // Get idea to check ownership
    const idea = await ctx.db.get(id);
    if (!idea) {
      throw new Error("Idea not found");
    }

    if (idea.organizationId !== session.activeOrganizationId) {
      throw new Error("Unauthorized");
    }

    // 1. Create main validation result record
    const validationId = await ctx.db.insert("validationResults", {
      ideaId: id,
      overallScore: validationResults.overallScore,
      recommendation: validationResults.recommendation,
      validatedAt: Date.now(),
      validatedBy: session.userId as Id<"user">,
    });

    // 2. Store detailed results in separate tables
    await ctx.db.insert("marketSizeValidation", {
      validationResultId: validationId,
      score: validationResults.marketSize.score,
      analysis: validationResults.marketSize.analysis,
      potential: validationResults.marketSize.potential,
      marketSizeUSD: validationResults.marketSize.marketSizeUSD,
      growthRate: validationResults.marketSize.growthRate,
      targetSegments: validationResults.marketSize.targetSegments,
    });

    await ctx.db.insert("competitorValidation", {
      validationResultId: validationId,
      score: validationResults.competitorAnalysis.score,
      analysis: validationResults.competitorAnalysis.analysis,
      competitors: validationResults.competitorAnalysis.competitors,
      differentiators: validationResults.competitorAnalysis.differentiators,
      competitiveAdvantage:
        validationResults.competitorAnalysis.competitiveAdvantage,
    });

    await ctx.db.insert("customerFitValidation", {
      validationResultId: validationId,
      score: validationResults.customerFit.score,
      analysis: validationResults.customerFit.analysis,
      painPoints: validationResults.customerFit.painPoints,
      willingness: validationResults.customerFit.willingness,
      customerAcquisitionCost:
        validationResults.customerFit.customerAcquisitionCost,
    });

    await ctx.db.insert("feasibilityValidation", {
      validationResultId: validationId,
      score: validationResults.feasibility.score,
      analysis: validationResults.feasibility.analysis,
      technicalChallenges: validationResults.feasibility.technicalChallenges,
      timeToMarket: validationResults.feasibility.timeToMarket,
      riskFactors: validationResults.feasibility.riskFactors,
    });

    // Store financial validation
    await ctx.db.insert("financialValidation", {
      validationResultId: validationId,
      score: validationResults.financials.score,
      analysis: validationResults.financials.analysis,
      estimatedRevenue: validationResults.financials.estimatedRevenue,
      estimatedCosts: validationResults.financials.estimatedCosts,
      breakEvenPoint: validationResults.financials.breakEvenPoint,
      fundingRequirements: validationResults.financials.fundingRequirements,
    });

    // Store user stories
    for (const userStory of validationResults.userStories) {
      await ctx.db.insert("userStoryValidation", {
        validationResultId: validationId,
        persona: userStory.persona,
        story: userStory.story,
        acceptanceCriteria: userStory.acceptanceCriteria,
      });
    }

    // Store key findings
    for (const finding of validationResults.keyFindings) {
      await ctx.db.insert("keyFinding", {
        content: finding.content,
        importance: finding.importance.toUpperCase() as
          | "CRITICAL"
          | "HIGH"
          | "MEDIUM"
          | "LOW",
        category: mapValidationCategoryToDbCategory(finding.category),
        order: finding.order,
        ideaId: id,
      });
    }

    // Store next steps
    for (const step of validationResults.nextSteps) {
      await ctx.db.insert("nextStep", {
        content: step.content,
        priority: step.priority.toUpperCase() as
          | "CRITICAL"
          | "HIGH"
          | "MEDIUM"
          | "LOW",
        category: mapValidationCategoryToDbCategory(step.category),
        order: step.order,
        ideaId: id,
      });
    }

    // Store adopter profiles
    for (const profile of validationResults.adopterProfiles) {
      await ctx.db.insert("adopterProfile", {
        ideaId: id,
        name: profile.name,
        description: profile.description,
        techSavviness: mapImportanceLevel(profile.techSavviness),
        innovativeness: mapImportanceLevel(profile.innovativeness),
        riskTolerance: mapImportanceLevel(profile.riskTolerance),
        socialInfluence: mapImportanceLevel(profile.socialInfluence),
        needRecognition: mapImportanceLevel(profile.needRecognition),
        financialResources: mapFinancialResources(profile.financialResources),
        channelsWhereToFind: profile.channelsWhereToFind,
        problemSolvingMotivation: profile.problemSolvingMotivation,
        statusSeekingMotivation: profile.statusSeekingMotivation,
        location: profile.location,
        industry: profile.industry,
      });
    }

    // Store competitors
    for (const competitor of validationResults.competitors) {
      await ctx.db.insert("competitor", {
        ideaId: id,
        name: competitor.name,
        description: competitor.description,
        industry: competitor.industry,
        location: competitor.location,
        website: competitor.website,
        revenue: competitor.revenue,
        marketShare: competitor.marketShare,
      });
    }

    // Store SWOT analysis
    for (const strength of validationResults.swotAnalysis.strengths) {
      await ctx.db.insert("competitorSwot", {
        ideaId: id,
        type: "strength",
        description: strength,
      });
    }
    for (const weakness of validationResults.swotAnalysis.weaknesses) {
      await ctx.db.insert("competitorSwot", {
        ideaId: id,
        type: "weakness",
        description: weakness,
      });
    }
    for (const opportunity of validationResults.swotAnalysis.opportunities) {
      await ctx.db.insert("competitorSwot", {
        ideaId: id,
        type: "opportunity",
        description: opportunity,
      });
    }
    for (const threat of validationResults.swotAnalysis.threats) {
      await ctx.db.insert("competitorSwot", {
        ideaId: id,
        type: "threat",
        description: threat,
      });
    }

    // 3. Update idea table with summary only
    await ctx.db.patch(id, {
      aiOverallValidation: {
        overallRating: validationResults.overallScore,
        overallComment: validationResults.recommendation,
        lastValidated: Date.now(),
        validationCount: (idea.aiOverallValidation?.validationCount || 0) + 1,
      },
      status:
        validationResults.overallScore >= 70
          ? "VALIDATED"
          : validationResults.overallScore >= 50
            ? "IN_PROGRESS"
            : validationResults.overallScore >= 40
              ? "INVALIDATED"
              : "FAILED",
    });

    return validationResults;
  },
});

// New query to get full validation details
export const getValidationDetails = query({
  args: {
    token: v.string(),
    ideaId: v.id("idea"),
  },
  handler: async (ctx, { token, ideaId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: token }
    );

    if (!session) {
      throw new Error("Not authenticated");
    }

    // Get the latest validation result for this idea
    const latestValidation = await ctx.db
      .query("validationResults")
      .withIndex("byIdea", (q) => q.eq("ideaId", ideaId))
      .order("desc")
      .first();

    if (!latestValidation) {
      return null;
    }

    // Get all validation details
    const [
      marketSize,
      competitors,
      customerFit,
      feasibility,
      financials,
      userStories,
      keyFindings,
      nextSteps,
      adopterProfiles,
      competitorDetails,
      swotAnalysis,
    ] = await Promise.all([
      ctx.db
        .query("marketSizeValidation")
        .withIndex("byValidation", (q) =>
          q.eq("validationResultId", latestValidation._id)
        )
        .first(),
      ctx.db
        .query("competitorValidation")
        .withIndex("byValidation", (q) =>
          q.eq("validationResultId", latestValidation._id)
        )
        .first(),
      ctx.db
        .query("customerFitValidation")
        .withIndex("byValidation", (q) =>
          q.eq("validationResultId", latestValidation._id)
        )
        .first(),
      ctx.db
        .query("feasibilityValidation")
        .withIndex("byValidation", (q) =>
          q.eq("validationResultId", latestValidation._id)
        )
        .first(),
      ctx.db
        .query("financialValidation")
        .withIndex("byValidation", (q) =>
          q.eq("validationResultId", latestValidation._id)
        )
        .first(),
      ctx.db
        .query("userStoryValidation")
        .withIndex("byValidation", (q) =>
          q.eq("validationResultId", latestValidation._id)
        )
        .collect(),
      ctx.db
        .query("keyFinding")
        .withIndex("byIdea", (q) => q.eq("ideaId", ideaId))
        .order("asc")
        .collect(),
      ctx.db
        .query("nextStep")
        .withIndex("byIdea", (q) => q.eq("ideaId", ideaId))
        .order("asc")
        .collect(),
      ctx.db
        .query("adopterProfile")
        .withIndex("byIdea", (q) => q.eq("ideaId", ideaId))
        .collect(),
      ctx.db
        .query("competitor")
        .withIndex("byIdea", (q) => q.eq("ideaId", ideaId))
        .collect(),
      ctx.db
        .query("competitorSwot")
        .withIndex("byIdea", (q) => q.eq("ideaId", ideaId))
        .collect(),
    ]);

    // Group SWOT analysis by type
    const swot = {
      strengths: swotAnalysis
        .filter((s) => s.type === "strength")
        .map((s) => s.description),
      weaknesses: swotAnalysis
        .filter((s) => s.type === "weakness")
        .map((s) => s.description),
      opportunities: swotAnalysis
        .filter((s) => s.type === "opportunity")
        .map((s) => s.description),
      threats: swotAnalysis
        .filter((s) => s.type === "threat")
        .map((s) => s.description),
    };

    return {
      validation: latestValidation,
      marketSize,
      competitorAnalysis: competitors,
      customerFit,
      feasibility,
      financials,
      userStories,
      keyFindings,
      nextSteps,
      adopterProfiles,
      competitors: competitorDetails,
      swotAnalysis: swot,
    };
  },
});

// Keep existing queries
export const getValidationResults = query({
  args: {
    token: v.string(),
    id: v.id("idea"),
  },
  handler: async (ctx, { token, id }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw new Error("Not authenticated");
    }

    // Get the idea with validation data
    const idea = await ctx.db.get(id);
    if (!idea) {
      throw new Error("Idea not found");
    }

    if (idea.organizationId !== session.activeOrganizationId) {
      throw new Error("Unauthorized");
    }

    return idea.aiOverallValidation || null;
  },
});

// Add missing internal functions
export const get = internalQuery({
  args: { id: v.id("idea"), token: v.string() },
  handler: async (ctx, { id, token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw new Error("Not authenticated");
    }

    const idea = await ctx.db.get(id);

    if (session.activeOrganizationId !== idea?.organizationId) {
      throw new Error("Unauthorized");
    }

    return idea;
  },
});

export const storeValidationResults: any = internalMutation({
  args: {
    token: v.string(),
    id: v.id("idea"),
    validationResults: v.object({
      marketSize: v.object({
        score: v.number(),
        analysis: v.string(),
        potential: v.string(),
        marketSizeUSD: v.optional(v.number()),
        growthRate: v.optional(v.number()),
        targetSegments: v.optional(v.array(v.string())),
      }),
      competitorAnalysis: v.object({
        score: v.number(),
        competitors: v.array(v.string()),
        differentiators: v.array(v.string()),
        analysis: v.string(),
        competitiveAdvantage: v.optional(v.string()),
      }),
      customerFit: v.object({
        score: v.number(),
        painPoints: v.array(v.string()),
        willingness: v.string(),
        analysis: v.string(),
        customerAcquisitionCost: v.optional(v.number()),
      }),
      feasibility: v.object({
        score: v.number(),
        technicalChallenges: v.array(v.string()),
        timeToMarket: v.string(),
        analysis: v.string(),
        riskFactors: v.optional(v.array(v.string())),
      }),
      financials: v.object({
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
      }),
      userStories: v.array(
        v.object({
          persona: v.string(),
          story: v.string(),
          acceptanceCriteria: v.array(v.string()),
        })
      ),
      keyFindings: v.array(
        v.object({
          content: v.string(),
          importance: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
          ),
          category: v.union(
            v.literal("market"),
            v.literal("competition"),
            v.literal("technical"),
            v.literal("financial"),
            v.literal("customer")
          ),
          order: v.number(),
        })
      ),
      nextSteps: v.array(
        v.object({
          content: v.string(),
          priority: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
          ),
          category: v.union(
            v.literal("research"),
            v.literal("development"),
            v.literal("marketing"),
            v.literal("validation"),
            v.literal("planning")
          ),
          order: v.number(),
        })
      ),
      adopterProfiles: v.array(
        v.object({
          name: v.string(),
          description: v.string(),
          techSavviness: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
          ),
          innovativeness: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
          ),
          riskTolerance: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
          ),
          socialInfluence: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
          ),
          needRecognition: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
          ),
          financialResources: v.union(
            v.literal("limited"),
            v.literal("moderate"),
            v.literal("substantial")
          ),
          channelsWhereToFind: v.optional(v.string()),
          problemSolvingMotivation: v.optional(v.string()),
          statusSeekingMotivation: v.optional(v.string()),
          location: v.optional(v.string()),
          industry: v.optional(v.string()),
        })
      ),
      competitors: v.array(
        v.object({
          name: v.string(),
          description: v.string(),
          industry: v.optional(v.string()),
          location: v.optional(v.string()),
          website: v.optional(v.string()),
          revenue: v.optional(v.number()),
          marketShare: v.optional(v.number()),
        })
      ),
      swotAnalysis: v.object({
        strengths: v.array(v.string()),
        weaknesses: v.array(v.string()),
        opportunities: v.array(v.string()),
        threats: v.array(v.string()),
      }),
      overallScore: v.number(),
      recommendation: v.string(),
    }),
  },
  handler: async (ctx, { token, id, validationResults }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw new Error("Not authenticated");
    }

    // Get idea to check ownership
    const idea = await ctx.db.get(id);
    if (!idea) {
      throw new Error("Idea not found");
    }

    if (idea.organizationId !== session.activeOrganizationId) {
      throw new Error("Unauthorized");
    }

    // Use the existing updateValidation logic
    return await ctx.runMutation(api.idea.updateValidation, {
      token,
      id,
      validationResults,
    });
  },
});

export const triggerValidation = action({
  args: {
    token: v.string(),
    ideaId: v.id("idea"),
  },
  handler: async (ctx, { token, ideaId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw new Error("Not authenticated");
    }

    // Get the idea details using the public API
    const idea = await ctx.runQuery(api.idea.getSingleIdea, {
      id: ideaId,
      token,
    });
    if (!idea) {
      throw new Error("Idea not found");
    }

    // Trigger the comprehensive validation using the correct function name
    const validationResult: any = await ctx.runAction(
      api.validation.orchestrator.validateIdea,
      {
        token,
        ideaId,
        idea: {
          name: idea.name,
          description: idea.description,
          industry: idea.industry,
          problemSolved: idea.problemSolved || "",
          solutionOffered: idea.solutionOffered || "",
          internal: idea.internal || false,
          openSource: idea.openSource || false,
        },
      }
    );

    if (!validationResult.success) {
      throw new Error("Validation failed");
    }

    return {
      success: true,
      results: validationResult.results,
    };
  },
});
