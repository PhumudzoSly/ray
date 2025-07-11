import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { Id, Doc } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";
import { ConvexSession } from "./betterAuth";
import {
  featurePhase,
  importance,
  issueLabel,
  issueStatus,
} from "../schemas/enums";

// Create a new public roadmap
export const createRoadmap = mutation({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    isPublic: v.boolean(),
    customDomain: v.optional(v.string()),
    theme: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    allowVoting: v.boolean(),
    allowFeedback: v.boolean(),
    showChangelog: v.boolean(),
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

    // Check if slug is already taken
    const existingRoadmap = await ctx.db
      .query("publicRoadmaps")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existingRoadmap) {
      throw new Error("Slug is already taken");
    }

    const { token, ...roadmapData } = args;
    return await ctx.db.insert("publicRoadmaps", {
      ...roadmapData,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update an existing roadmap
export const updateRoadmap = mutation({
  args: {
    token: v.string(),
    id: v.id("publicRoadmaps"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    customDomain: v.optional(v.string()),
    theme: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    allowVoting: v.optional(v.boolean()),
    allowFeedback: v.optional(v.boolean()),
    showChangelog: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const { token, id, ...updates } = args;

    // Check if slug is already taken (if updating slug)
    if (updates.slug) {
      const existingRoadmap = await ctx.db
        .query("publicRoadmaps")
        .withIndex("by_slug", (q) => q.eq("slug", updates?.slug || ""))
        .filter((q) => q.neq(q.field("_id"), id))
        .first();

      if (existingRoadmap) {
        throw new Error("Slug is already taken");
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Get a roadmap by ID
export const getRoadmap = query({
  args: {
    token: v.string(),
    id: v.id("publicRoadmaps"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    return await ctx.db.get(args.id);
  },
});

// Get a roadmap by slug (for public access) - NO AUTH REQUIRED
export const getRoadmapBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const roadmap = await ctx.db
      .query("publicRoadmaps")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("isPublic"), true))
      .first();

    if (!roadmap) return null;

    return roadmap;
  },
});

// Check if a slug is available
export const checkSlugAvailability = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const existingRoadmap = await ctx.db
      .query("publicRoadmaps")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return {
      available: !existingRoadmap,
      exists: !!existingRoadmap,
    };
  },
});

// Get roadmaps for a project
export const getRoadmapsByProject = query({
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

    return await ctx.db
      .query("publicRoadmaps")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

// Get all roadmaps for all user projects with stats
export const getAllRoadmaps = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const roadmaps = await ctx.db.query("publicRoadmaps").collect();

    // Get all roadmap items for all roadmaps
    const allItems = await ctx.db.query("roadmapItems").collect();

    // Group items by roadmap ID
    const itemsByRoadmap = new Map();
    allItems.forEach((item) => {
      if (!itemsByRoadmap.has(item.roadmapId)) {
        itemsByRoadmap.set(item.roadmapId, []);
      }
      itemsByRoadmap.get(item.roadmapId).push(item);
    });

    // Calculate stats for each roadmap
    const roadmapsWithStats = roadmaps.map((roadmap) => {
      const items: Doc<"roadmapItems">[] =
        itemsByRoadmap.get(roadmap._id) || [];

      // Count by status
      const statusCounts: Record<string, number> = {};
      items.forEach((item) => {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
      });

      // Count by category
      const categoryCounts: Record<string, number> = {};
      items.forEach((item) => {
        categoryCounts[item.category] =
          (categoryCounts[item.category] || 0) + 1;
      });

      // Count public vs private
      const publicCount = items.filter((item) => item.isPublic).length;
      const privateCount = items.length - publicCount;

      // Count votes
      const totalVotes = items.reduce(
        (sum, item) => sum + (item.voteCount || 0),
        0
      );

      // Count feedback
      const totalFeedback = items.reduce(
        (sum, item) => sum + (item.feedbackCount || 0),
        0
      );

      const stats = {
        totalItems: items.length,
        statusCounts,
        categoryCounts,
        publicCount,
        privateCount,
        totalVotes,
        totalFeedback,
      };

      return {
        ...roadmap,
        stats,
      };
    });

    return roadmapsWithStats;
  },
});

// Delete a roadmap
export const deleteRoadmap = mutation({
  args: {
    token: v.string(),
    id: v.id("publicRoadmaps"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Delete all related items, votes, feedback, and changelogs
    const items = await ctx.db
      .query("roadmapItems")
      .withIndex("by_roadmap", (q) => q.eq("roadmapId", args.id))
      .collect();

    for (const item of items) {
      // Delete votes
      const votes = await ctx.db
        .query("roadmapVotes")
        .withIndex("by_item", (q) => q.eq("roadmapItemId", item._id))
        .collect();

      for (const vote of votes) {
        await ctx.db.delete(vote._id);
      }

      // Delete feedback
      const feedback = await ctx.db
        .query("roadmapFeedback")
        .withIndex("by_item", (q) => q.eq("roadmapItemId", item._id))
        .collect();

      for (const fb of feedback) {
        await ctx.db.delete(fb._id);
      }

      // Delete the item
      await ctx.db.delete(item._id);
    }

    // Delete changelogs
    const changelogs = await ctx.db
      .query("roadmapChangelogs")
      .withIndex("by_roadmap", (q) => q.eq("roadmapId", args.id))
      .collect();

    for (const changelog of changelogs) {
      await ctx.db.delete(changelog._id);
    }

    // Delete the roadmap
    await ctx.db.delete(args.id);
  },
});

// Get public roadmap stats - NO AUTH REQUIRED
export const getRoadmapStats = query({
  args: { roadmapId: v.id("publicRoadmaps") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("roadmapItems")
      .withIndex("by_roadmap", (q) => q.eq("roadmapId", args.roadmapId))
      .collect();

    // Count by status
    const statusCounts: Record<string, number> = {};
    items.forEach((item) => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    });

    // Count by category
    const categoryCounts: Record<string, number> = {};
    items.forEach((item) => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    // Count public vs private
    const publicCount = items.filter((item) => item.isPublic).length;
    const privateCount = items.length - publicCount;

    // Count votes
    const totalVotes = items.reduce(
      (sum, item) => sum + (item.voteCount || 0),
      0
    );

    // Count feedback
    const totalFeedback = items.reduce(
      (sum, item) => sum + (item.feedbackCount || 0),
      0
    );

    return {
      totalItems: items.length,
      statusCounts,
      categoryCounts,
      publicCount,
      privateCount,
      totalVotes,
      totalFeedback,
    };
  },
});
