import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexSession } from "./betterAuth";

export const create = mutation({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
    nodeId: v.string(),
    title: v.string(),
    content: v.string(),
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
    return await ctx.db.insert("prds", {
      projectId: args.projectId,
      nodeId: args.nodeId,
      title: args.title,
      content: args.content,
      version: 1,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("prds"),
    content: v.string(),
    title: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("approved"), v.literal("archived"))
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

    const { id, token, ...updates } = args;
    const existing = await ctx.db.get(id);

    if (!existing) {
      throw new Error("PRD not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      version: existing.version + 1,
      updatedAt: Date.now(),
    });
  },
});

export const getByNode = query({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
    nodeId: v.string(),
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
      .query("prds")
      .withIndex("by_project_and_node", (q) =>
        q.eq("projectId", args.projectId).eq("nodeId", args.nodeId)
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
      .query("prds")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: {
    token: v.string(),
    id: v.id("prds"),
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

export const deleteByNode = mutation({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
    nodeId: v.string(),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const prd = await ctx.db
      .query("prds")
      .withIndex("by_project_and_node", (q) =>
        q.eq("projectId", args.projectId).eq("nodeId", args.nodeId)
      )
      .first();

    if (prd) {
      await ctx.db.delete(prd._id);
    }
  },
});
