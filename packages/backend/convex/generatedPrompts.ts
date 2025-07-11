import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexSession } from "./betterAuth";

export const create = mutation({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
    nodeId: v.optional(v.string()),
    templateId: v.id("promptTemplates"),
    title: v.string(),
    content: v.string(),
    targetTool: v.string(),
    variables: v.record(v.string(), v.string()),
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
    const { token, ...promptData } = args;
    return await ctx.db.insert("generatedPrompts", {
      ...promptData,
      createdAt: now,
      updatedAt: now,
    });
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
      .query("generatedPrompts")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
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
      .query("generatedPrompts")
      .withIndex("by_node", (q) => q.eq("nodeId", args.nodeId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: {
    token: v.string(),
    id: v.id("generatedPrompts"),
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

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("generatedPrompts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
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

export const deletePrompt = mutation({
  args: {
    token: v.string(),
    id: v.id("generatedPrompts"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
