import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id, Doc } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { ConvexSession } from "../betterAuth";
import { importance, issueStatus } from "../../schemas/enums";

// Create a roadmap item
export const createRoadmapItem = mutation({
  args: {
    token: v.string(),
    roadmapId: v.id("publicRoadmaps"),
    issueId: v.optional(v.id("issues")),
    nodeId: v.optional(v.string()),
    title: v.string(),
    description: v.string(),
    status: issueStatus,
    category: v.string(),
    isPublic: v.boolean(),
    priority: importance,
    targetDate: v.optional(v.number()),
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

    // Get the highest order for this roadmap
    const existingItems = await ctx.db
      .query("roadmapItems")
      .withIndex("by_roadmap", (q) => q.eq("roadmapId", args.roadmapId))
      .collect();

    const maxOrder = Math.max(...existingItems.map((i) => i.order), -1);

    const { token, ...itemData } = args;
    return await ctx.db.insert("roadmapItems", {
      ...itemData,
      order: maxOrder + 1,
      voteCount: 0,
      feedbackCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update a roadmap item
export const updateRoadmapItem = mutation({
  args: {
    token: v.string(),
    id: v.id("roadmapItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(issueStatus),
    category: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    priority: v.optional(importance),
    targetDate: v.optional(v.number()),
    order: v.optional(v.number()),
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
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Get roadmap items - Auth required for private roadmaps, public access for public ones
export const getRoadmapItems = query({
  args: {
    token: v.string(),
    roadmapId: v.id("publicRoadmaps"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Check if this is a public roadmap first
    const roadmap = await ctx.db.get(args.roadmapId);

    if (!roadmap) {
      throw new Error("Roadmap not found");
    }

    const items = await ctx.db
      .query("roadmapItems")
      .withIndex("by_roadmap", (q) => q.eq("roadmapId", args.roadmapId))
      .collect();

    return items;
  },
});

// Get all public roadmap items - NO AUTH REQUIRED
export const getPublicRoadmapItems = query({
  args: {
    roadmapId: v.id("publicRoadmaps"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("roadmapItems")
      .withIndex("by_roadmap", (q) => q.eq("roadmapId", args.roadmapId))
      .collect();
  },
});

// Get a roadmap item by ID
export const getRoadmapItem = query({
  args: {
    token: v.optional(v.string()),
    id: v.id("roadmapItems"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) return null;

    // If item is private, require auth
    if (!item.isPublic) {
      if (!args.token) {
        throw Error("Authentication required for private item access");
      }

      const session: ConvexSession = await ctx.runQuery(
        internal.betterAuth.getSession,
        { sessionToken: args.token }
      );

      if (!session) {
        throw Error("Unauthorized");
      }
    }

    return item;
  },
});

// Delete a roadmap item
export const deleteRoadmapItem = mutation({
  args: {
    token: v.string(),
    id: v.id("roadmapItems"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Delete votes
    const votes = await ctx.db
      .query("roadmapVotes")
      .withIndex("by_item", (q) => q.eq("roadmapItemId", args.id))
      .collect();

    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    // Delete feedback
    const feedback = await ctx.db
      .query("roadmapFeedback")
      .withIndex("by_item", (q) => q.eq("roadmapItemId", args.id))
      .collect();

    for (const fb of feedback) {
      await ctx.db.delete(fb._id);
    }

    // Delete the item
    await ctx.db.delete(args.id);
  },
});

// Vote for a roadmap item - NO AUTH REQUIRED (public voting)
export const voteForItem = mutation({
  args: {
    itemId: v.id("roadmapItems"),
    userId: v.optional(v.string()),
    ipAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if user or IP has already voted
    const existingVote = await ctx.db
      .query("roadmapVotes")
      .withIndex("by_item_and_ip", (q) =>
        q.eq("roadmapItemId", args.itemId).eq("ipAddress", args.ipAddress)
      )
      .first();

    if (existingVote) {
      throw new Error("You have already voted for this item");
    }

    // Create vote
    await ctx.db.insert("roadmapVotes", {
      roadmapItemId: args.itemId,
      userId: args.userId,
      ipAddress: args.ipAddress,
      createdAt: now,
    });

    // Update vote count
    const item = await ctx.db.get(args.itemId);
    if (item) {
      await ctx.db.patch(args.itemId, {
        voteCount: (item.voteCount || 0) + 1,
        updatedAt: now,
      });
    }
  },
});

// Remove vote from a roadmap item - NO AUTH REQUIRED (public voting)
export const removeVote = mutation({
  args: {
    itemId: v.id("roadmapItems"),
    userId: v.optional(v.string()),
    ipAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find the vote
    const existingVote = await ctx.db
      .query("roadmapVotes")
      .withIndex("by_item_and_ip", (q) =>
        q.eq("roadmapItemId", args.itemId).eq("ipAddress", args.ipAddress)
      )
      .first();

    if (!existingVote) {
      throw new Error("Vote not found");
    }

    // Delete the vote
    await ctx.db.delete(existingVote._id);

    // Update vote count
    const item = await ctx.db.get(args.itemId);
    if (item) {
      await ctx.db.patch(args.itemId, {
        voteCount: Math.max((item.voteCount || 0) - 1, 0),
        updatedAt: now,
      });
    }
  },
});

// Sync issues to roadmap items - This function already has token auth
export const syncIssuesWithRoadmap = mutation({
  args: {
    token: v.string(),
    roadmapId: v.id("publicRoadmaps"),
    projectId: v.id("projects"),
    statusMapping: issueStatus, // Map issue status to roadmap status
    categoryMapping: v.record(v.string(), v.string()), // Map issue type to roadmap category
  },
  handler: async (
    ctx,
    { roadmapId, projectId, statusMapping, categoryMapping, token }
  ) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );
    if (!session) {
      throw new Error("Not authenticated");
    }
    const now = Date.now();

    // Get all issues for the project
    const issues = await ctx.db
      .query("issues")
      .withIndex("byOrgProject", (q) =>
        q
          .eq("projectId", projectId)
          .eq(
            "organizationId",
            session.activeOrganizationId as Id<"organization">
          )
      )
      .collect();

    // Get existing roadmap items
    const existingItems = await ctx.db
      .query("roadmapItems")
      .withIndex("by_roadmap", (q) => q.eq("roadmapId", roadmapId))
      .collect();

    const existingItemsByIssueId = new Map();
    existingItems.forEach((item) => {
      if (item.issueId) {
        existingItemsByIssueId.set(item.issueId, item);
      }
    });

    // Process each issue
    for (const issue of issues) {
      // Map status and category
      const roadmapStatus = statusMapping;

      // Check if item already exists
      const existingItem = existingItemsByIssueId.get(issue._id);

      if (existingItem) {
        // Update existing item
        await ctx.db.patch(existingItem._id, {
          title: issue.title,
          description: issue.description,
          status: roadmapStatus,
          priority: issue.priority,
          updatedAt: now,
          category: issue.label,
        });
      } else {
        // Create new item
        await ctx.db.insert("roadmapItems", {
          roadmapId: roadmapId,
          issueId: issue._id,
          nodeId: issue.featureId,
          title: issue.title,
          status: roadmapStatus,
          category: issue.label,
          isPublic: false, // Default to private
          priority: issue.priority,
          order: 0, // Will be updated later
          voteCount: 0,
          feedbackCount: 0,
          createdAt: now,
          updatedAt: now,
          description: issue.description || "",
          targetDate: issue.dueDate
            ? new Date(issue.dueDate).getTime()
            : undefined,
        });
      }
    }

    // Return success
    return { success: true, syncedCount: issues.length };
  },
});

// Update issue visibility
export const updateIssueVisibility = mutation({
  args: {
    token: v.string(),
    issueId: v.id("issues"),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Find all roadmap items linked to this issue
    const roadmapItems = await ctx.db
      .query("roadmapItems")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
      .collect();

    // Update visibility for all linked roadmap items
    for (const item of roadmapItems) {
      await ctx.db.patch(item._id, {
        isPublic: args.isPublic,
        updatedAt: Date.now(),
      });
    }

    return { success: true, updatedCount: roadmapItems.length };
  },
});
