import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { ConvexSession } from "../betterAuth";

// Create a changelog
export const createChangelog = mutation({
  args: {
    token: v.string(),
    roadmapId: v.id("publicRoadmaps"),
    title: v.string(),
    description: v.string(),
    items: v.array(
      v.object({
        itemId: v.id("roadmapItems"),
        title: v.string(),
        description: v.string(),
        status: v.string(),
      })
    ),
    publishDate: v.number(),
    isPublished: v.boolean(),
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

    const { token, ...changelogData } = args;
    return await ctx.db.insert("roadmapChangelogs", {
      ...changelogData,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update a changelog
export const updateChangelog = mutation({
  args: {
    token: v.string(),
    id: v.id("roadmapChangelogs"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    items: v.optional(
      v.array(
        v.object({
          itemId: v.id("roadmapItems"),
          title: v.string(),
          description: v.string(),
          status: v.string(),
        })
      )
    ),
    publishDate: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
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

// Get changelogs for a roadmap - Mixed auth (public for published, auth for drafts)
export const getChangelogs = query({
  args: {
    token: v.optional(v.string()),
    roadmapId: v.id("publicRoadmaps"),
    onlyPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // If requesting unpublished changelogs, require auth
    if (args.onlyPublished === false) {
      if (!args.token) {
        throw Error("Authentication required for unpublished changelogs");
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
      .query("roadmapChangelogs")
      .withIndex("by_roadmap", (q) => q.eq("roadmapId", args.roadmapId));

    if (args.onlyPublished) {
      q = q.filter((q) => q.eq(q.field("isPublished"), true));
    }

    return await q.order("desc").collect();
  },
});
