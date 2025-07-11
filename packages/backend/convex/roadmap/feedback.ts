import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id, Doc } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { ConvexSession } from "../betterAuth";
import { featurePhase, importance, issueLabel } from "../../schemas/enums";

// Add feedback to a roadmap item - NO AUTH REQUIRED (public feedback)
export const addFeedback = mutation({
  args: {
    itemId: v.id("roadmapItems"),
    userId: v.optional(v.string()),
    ipAddress: v.string(),
    content: v.string(),
    sentiment: v.union(
      v.literal("positive"),
      v.literal("neutral"),
      v.literal("negative")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if user or IP has already provided feedback
    const existingFeedback = await ctx.db
      .query("roadmapFeedback")
      .withIndex("by_item_and_ip", (q) =>
        q.eq("roadmapItemId", args.itemId).eq("ipAddress", args.ipAddress)
      )
      .first();

    if (existingFeedback) {
      throw new Error("You have already provided feedback for this item");
    }

    // Create feedback
    await ctx.db.insert("roadmapFeedback", {
      roadmapItemId: args.itemId,
      userId: args.userId,
      ipAddress: args.ipAddress,
      content: args.content,
      sentiment: args.sentiment,
      isApproved: false, // Feedback requires approval by default
      createdAt: now,
    });

    // Update feedback count
    const item = await ctx.db.get(args.itemId);
    if (item) {
      await ctx.db.patch(args.itemId, {
        feedbackCount: (item.feedbackCount || 0) + 1,
        updatedAt: now,
      });
    }
  },
});

// Get feedback for a roadmap item - NO AUTH REQUIRED for public feedback
export const getFeedback = query({
  args: {
    itemId: v.id("roadmapItems"),
    onlyApproved: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("roadmapFeedback")
      .withIndex("by_item", (q) => q.eq("roadmapItemId", args.itemId));

    if (args.onlyApproved) {
      q = q.filter((q) => q.eq(q.field("isApproved"), true));
    }

    return await q.collect();
  },
});

// Get all feedback for a roadmap - REQUIRES AUTH
export const getRoadmapFeedback = query({
  args: {
    token: v.string(),
    roadmapId: v.id("publicRoadmaps"),
    onlyApproved: v.optional(v.boolean()),
    sentiment: v.optional(
      v.union(
        v.literal("positive"),
        v.literal("neutral"),
        v.literal("negative")
      )
    ),
    converted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Get all roadmap items for this roadmap
    const roadmapItems = await ctx.db
      .query("roadmapItems")
      .withIndex("by_roadmap", (q) => q.eq("roadmapId", args.roadmapId))
      .collect();

    const itemIds = roadmapItems.map((item) => item._id);

    // Get all feedback for these items
    const allFeedback = [];
    for (const itemId of itemIds) {
      let q = ctx.db
        .query("roadmapFeedback")
        .withIndex("by_item", (q) => q.eq("roadmapItemId", itemId));

      if (args.onlyApproved) {
        q = q.filter((q) => q.eq(q.field("isApproved"), true));
      }

      if (args.sentiment) {
        q = q.filter((q) => q.eq(q.field("sentiment"), args.sentiment));
      }

      if (args.converted !== undefined) {
        if (args.converted) {
          q = q.filter((q) =>
            q.or(
              q.neq(q.field("convertedToFeatureId"), undefined),
              q.neq(q.field("convertedToIssueId"), undefined)
            )
          );
        } else {
          q = q.filter((q) =>
            q.and(
              q.eq(q.field("convertedToFeatureId"), undefined),
              q.eq(q.field("convertedToIssueId"), undefined)
            )
          );
        }
      }

      const feedback = await q.collect();
      allFeedback.push(...feedback);
    }

    // Sort by creation date (newest first)
    allFeedback.sort((a, b) => b.createdAt - a.createdAt);

    // Enrich with roadmap item info and conversion details
    const enrichedFeedback = await Promise.all(
      allFeedback.map(async (feedback) => {
        const roadmapItem = roadmapItems.find(
          (item) => item._id === feedback.roadmapItemId
        );

        let convertedFeature = null;
        let convertedIssue = null;
        let convertedBy = null;

        if (feedback.convertedToFeatureId) {
          convertedFeature = await ctx.db.get(feedback.convertedToFeatureId);
        }

        if (feedback.convertedToIssueId) {
          convertedIssue = await ctx.db.get(feedback.convertedToIssueId);
        }

        if (feedback.convertedBy) {
          convertedBy = await ctx.db.get(feedback.convertedBy);
        }

        return {
          ...feedback,
          roadmapItem,
          convertedFeature,
          convertedIssue,
          convertedBy,
        };
      })
    );

    return enrichedFeedback;
  },
});

// Approve or reject feedback
export const moderateFeedback = mutation({
  args: {
    token: v.string(),
    id: v.id("roadmapFeedback"),
    isApproved: v.boolean(),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      isApproved: args.isApproved,
    });
  },
});

// Convert feedback to feature
export const convertFeedbackToFeature = mutation({
  args: {
    token: v.string(),
    feedbackId: v.id("roadmapFeedback"),
    featureName: v.string(),
    featureDescription: v.optional(v.string()),
    priority: importance,
    phase: featurePhase,
    conversionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const now = Date.now();

    // Get the feedback
    const feedback = await ctx.db.get(args.feedbackId);
    if (!feedback) {
      throw new Error("Feedback not found");
    }

    // Check if already converted
    if (feedback.convertedToFeatureId || feedback.convertedToIssueId) {
      throw new Error("Feedback has already been converted");
    }

    // Get the roadmap item to get project info
    const roadmapItem = await ctx.db.get(feedback.roadmapItemId);
    if (!roadmapItem) {
      throw new Error("Roadmap item not found");
    }

    // Get the roadmap to get project info
    const roadmap = await ctx.db.get(roadmapItem.roadmapId);
    if (!roadmap) {
      throw new Error("Roadmap not found");
    }

    // Get the project to get organization info
    const project = await ctx.db.get(roadmap.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Create the feature
    const featureId = await ctx.db.insert("feature", {
      name: args.featureName,
      description: args.featureDescription || feedback.content,
      organizationId: project.organizationId as Id<"organization">,
      projectId: roadmap.projectId,
      priority: args.priority,
      phase: args.phase as any,
      sourceType: "feedback",
      sourceFeedbackId: args.feedbackId,
      isPublic: false,
    });

    // Update the feedback to track the conversion
    await ctx.db.patch(args.feedbackId, {
      convertedToFeatureId: featureId,
      convertedAt: now,
      convertedBy: session.userId as Id<"user">,
      conversionNotes: args.conversionNotes,
    });

    return { success: true, featureId };
  },
});

// Convert feedback to issue
export const convertFeedbackToIssue = mutation({
  args: {
    token: v.string(),
    feedbackId: v.id("roadmapFeedback"),
    issueTitle: v.string(),
    issueDescription: v.optional(v.string()),
    priority: importance,
    status: v.union(
      v.literal("BACKLOG"),
      v.literal("IN_PROGRESS"),
      v.literal("IN_REVIEW"),
      v.literal("DONE"),
      v.literal("CANCELLED")
    ),
    label: issueLabel,
    conversionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const now = Date.now();

    // Get the feedback
    const feedback = await ctx.db.get(args.feedbackId);
    if (!feedback) {
      throw new Error("Feedback not found");
    }

    // Check if already converted
    if (feedback.convertedToFeatureId || feedback.convertedToIssueId) {
      throw new Error("Feedback has already been converted");
    }

    // Get the roadmap item to get project info
    const roadmapItem = await ctx.db.get(feedback.roadmapItemId);
    if (!roadmapItem) {
      throw new Error("Roadmap item not found");
    }

    // Get the roadmap to get project info
    const roadmap = await ctx.db.get(roadmapItem.roadmapId);
    if (!roadmap) {
      throw new Error("Roadmap not found");
    }

    // Get the project to get organization info
    const project = await ctx.db.get(roadmap.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Create the issue
    const issueId = await ctx.db.insert("issues", {
      title: args.issueTitle,
      description: args.issueDescription || feedback.content,
      organizationId: project.organizationId as Id<"organization">,
      projectId: roadmap.projectId,
      status: args.status as any,
      priority: args.priority,
      label: args.label,
      sourceType: "feedback",
      sourceFeedbackId: args.feedbackId,
      isPublic: false,
    });

    // Update the feedback to track the conversion
    await ctx.db.patch(args.feedbackId, {
      convertedToIssueId: issueId,
      convertedAt: now,
      convertedBy: session.userId as Id<"user">,
      conversionNotes: args.conversionNotes,
    });

    return { success: true, issueId };
  },
});

// Get features created from feedback
export const getFeaturesFromFeedback = query({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Get features that originated from feedback
    const features = await ctx.db
      .query("feature")
      .withIndex("byProject", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("sourceType"), "feedback"))
      .collect();

    // Enrich with feedback data
    const enrichedFeatures = await Promise.all(
      features.map(async (feature) => {
        let sourceFeedback = null;
        if (feature.sourceFeedbackId) {
          sourceFeedback = await ctx.db.get(feature.sourceFeedbackId);
        }

        return {
          ...feature,
          sourceFeedback,
        };
      })
    );

    return enrichedFeatures;
  },
});

// Get issues created from feedback
export const getIssuesFromFeedback = query({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Get issues that originated from feedback
    const issues = await ctx.db
      .query("issues")
      .withIndex("byOrgProject", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("sourceType"), "feedback"))
      .collect();

    // Enrich with feedback data
    const enrichedIssues = await Promise.all(
      issues.map(async (issue) => {
        let sourceFeedback = null;
        if (issue.sourceFeedbackId) {
          sourceFeedback = await ctx.db.get(issue.sourceFeedbackId);
        }

        return {
          ...issue,
          sourceFeedback,
        };
      })
    );

    return enrichedIssues;
  },
});
