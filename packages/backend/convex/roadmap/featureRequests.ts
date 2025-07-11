import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { ConvexSession } from "../betterAuth";

// Submit a feature request - NO AUTH REQUIRED (public feature requests)
export const submitFeatureRequest = mutation({
  args: {
    roadmapId: v.id("publicRoadmaps"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    ipAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if same IP has submitted a request in the last 5 minutes
    const recentRequest = await ctx.db
      .query("featureRequests")
      .withIndex("by_roadmap", (q) => q.eq("roadmapId", args.roadmapId))
      .filter((q) =>
        q.and(
          q.eq(q.field("ipAddress"), args.ipAddress),
          q.gt(q.field("createdAt"), now - 5 * 60 * 1000) // 5 minutes ago
        )
      )
      .first();

    if (recentRequest) {
      throw new Error(
        "Please wait 5 minutes before submitting another request"
      );
    }

    // Create the feature request
    const requestId = await ctx.db.insert("featureRequests", {
      roadmapId: args.roadmapId,
      title: args.title,
      description: args.description,
      category: args.category,
      email: args.email,
      name: args.name,
      ipAddress: args.ipAddress,
      status: "pending",
      priority: "medium",
      upvotes: 0,
      isPublic: false, // Admin needs to approve before making public
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, requestId };
  },
});

// Get feature requests for a roadmap
export const getFeatureRequests = query({
  args: {
    token: v.optional(v.string()),
    roadmapId: v.id("publicRoadmaps"),
    onlyPublic: v.optional(v.boolean()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // If requesting private feature requests, require auth
    if (args.onlyPublic === false) {
      if (!args.token) {
        throw Error("Authentication required for private feature requests");
      }

      const session: ConvexSession = await ctx.runQuery(
        internal.betterAuth.getSession,
        { sessionToken: args.token }
      );

      if (!session) {
        throw Error("Unauthorized");
      }
    }

    let q = ctx.db
      .query("featureRequests")
      .withIndex("by_roadmap", (q) => q.eq("roadmapId", args.roadmapId));

    if (args.onlyPublic) {
      q = q.filter((q) => q.eq(q.field("isPublic"), true));
    }

    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }

    return await q.order("desc").collect();
  },
});

// Update feature request status
export const updateFeatureRequestStatus = mutation({
  args: {
    token: v.string(),
    requestId: v.id("featureRequests"),
    status: v.union(
      v.literal("pending"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("implemented")
    ),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    isPublic: v.optional(v.boolean()),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const { token, requestId, ...updates } = args;
    await ctx.db.patch(requestId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Upvote a feature request - NO AUTH REQUIRED (public voting)
export const upvoteFeatureRequest = mutation({
  args: {
    requestId: v.id("featureRequests"),
    ipAddress: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, just increment upvotes without tracking individual votes
    // This could be enhanced with a separate votes table if needed
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Feature request not found");
    }

    await ctx.db.patch(args.requestId, {
      upvotes: request.upvotes + 1,
      updatedAt: Date.now(),
    });
  },
});
