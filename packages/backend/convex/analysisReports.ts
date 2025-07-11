import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexSession } from "./betterAuth";

export const create = mutation({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
    type: v.union(
      v.literal("flow_analysis"),
      v.literal("missing_flows"),
      v.literal("recommendations")
    ),
    title: v.string(),
    content: v.string(),
    metadata: v.optional(
      v.object({
        missingFlowsCount: v.optional(v.number()),
        recommendationsCount: v.optional(v.number()),
        analysisScore: v.optional(v.number()),
      })
    ),
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
    return await ctx.db.insert("analysisReports", {
      projectId: args.projectId,
      type: args.type,
      title: args.title,
      content: args.content,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getLatestByType = query({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
    type: v.union(
      v.literal("flow_analysis"),
      v.literal("missing_flows"),
      v.literal("recommendations")
    ),
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
      .query("analysisReports")
      .withIndex("by_project_and_type", (q) =>
        q.eq("projectId", args.projectId).eq("type", args.type)
      )
      .order("desc")
      .first();
  },
});

export const getByProject = query({
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
      .query("analysisReports")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: {
    token: v.string(),
    id: v.id("analysisReports"),
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
