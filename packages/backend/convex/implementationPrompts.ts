import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexSession } from "./betterAuth";

export const create = mutation({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
    nodeId: v.string(),
    prdId: v.id("prds"),
    title: v.string(),
    content: v.string(),
    techStack: v.object({
      auth: v.string(),
      orm: v.string(),
      database: v.string(),
      ai: v.string(),
    }),
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
    return await ctx.db.insert("implementationPrompts", {
      projectId: args.projectId,
      nodeId: args.nodeId,
      prdId: args.prdId,
      title: args.title,
      content: args.content,
      techStack: args.techStack,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("implementationPrompts"),
    content: v.string(),
    title: v.optional(v.string()),
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
    await ctx.db.patch(id, {
      ...updates,
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
      .query("implementationPrompts")
      .withIndex("by_node", (q) => q.eq("nodeId", args.nodeId))
      .order("desc")
      .first();
  },
});

export const getByPrd = query({
  args: {
    token: v.string(),
    prdId: v.id("prds"),
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
      .query("implementationPrompts")
      .withIndex("by_prd", (q) => q.eq("prdId", args.prdId))
      .order("desc")
      .first();
  },
});

export const get = query({
  args: {
    token: v.string(),
    id: v.id("implementationPrompts"),
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

    const prompts = await ctx.db
      .query("implementationPrompts")
      .withIndex("by_node", (q) => q.eq("nodeId", args.nodeId))
      .collect();

    for (const prompt of prompts) {
      await ctx.db.delete(prompt._id);
    }
  },
});
