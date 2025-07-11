import { v } from "convex/values";
import { mutation, query, action } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { ConvexSession } from "../betterAuth";

// Create a new launch plan
export const create = mutation({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
    targetLaunchDate: v.optional(v.string()),
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
    const launchPlanId = await ctx.db.insert("launchPlans", {
      projectId: args.projectId,
      status: "draft",
      targetLaunchDate: args.targetLaunchDate,
      createdAt: now,
      updatedAt: now,
    });

    return launchPlanId;
  },
});

// Get launch plan by project ID
export const getByProject = query({
  args: { 
    token: v.string(),
    projectId: v.id("projects") 
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const launchPlan = await ctx.db
      .query("launchPlans")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    if (!launchPlan) return null;

    // Get related data
    const [checklistItems, copyItems, strategyPhases] = await Promise.all([
      ctx.db
        .query("launchChecklistItems")
        .withIndex("by_launch_plan", (q) => q.eq("launchPlanId", launchPlan._id))
        .order("asc")
        .collect(),
      ctx.db
        .query("launchCopy")
        .withIndex("by_launch_plan", (q) => q.eq("launchPlanId", launchPlan._id))
        .collect(),
      ctx.db
        .query("launchStrategy")
        .withIndex("by_launch_plan", (q) => q.eq("launchPlanId", launchPlan._id))
        .order("asc")
        .collect(),
    ]);

    return {
      ...launchPlan,
      checklistItems,
      copyItems,
      strategyPhases,
    };
  },
});

// Update launch plan status
export const updateStatus = mutation({
  args: {
    token: v.string(),
    launchPlanId: v.id("launchPlans"),
    status: v.union(
      v.literal("draft"),
      v.literal("in-progress"),
      v.literal("ready"),
      v.literal("launched")
    ),
    actualLaunchDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    await ctx.db.patch(args.launchPlanId, {
      status: args.status,
      actualLaunchDate: args.actualLaunchDate,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Delete launch plan
export const remove = mutation({
  args: {
    token: v.string(),
    launchPlanId: v.id("launchPlans"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Delete related data first
    const [checklistItems, copyItems, strategyPhases, metrics] = await Promise.all([
      ctx.db
        .query("launchChecklistItems")
        .withIndex("by_launch_plan", (q) => q.eq("launchPlanId", args.launchPlanId))
        .collect(),
      ctx.db
        .query("launchCopy")
        .withIndex("by_launch_plan", (q) => q.eq("launchPlanId", args.launchPlanId))
        .collect(),
      ctx.db
        .query("launchStrategy")
        .withIndex("by_launch_plan", (q) => q.eq("launchPlanId", args.launchPlanId))
        .collect(),
      ctx.db
        .query("launchMetrics")
        .withIndex("by_launch_plan", (q) => q.eq("launchPlanId", args.launchPlanId))
        .collect(),
    ]);

    // Delete all related records
    await Promise.all([
      ...checklistItems.map(item => ctx.db.delete(item._id)),
      ...copyItems.map(item => ctx.db.delete(item._id)),
      ...strategyPhases.map(item => ctx.db.delete(item._id)),
      ...metrics.map(item => ctx.db.delete(item._id)),
    ]);

    // Finally delete the launch plan
    await ctx.db.delete(args.launchPlanId);

    return { success: true };
  },
});

// Get launch plan with full details
export const getDetails = query({
  args: {
    token: v.string(),
    launchPlanId: v.id("launchPlans"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const launchPlan = await ctx.db.get(args.launchPlanId);
    if (!launchPlan) return null;

    const [project, checklistItems, copyItems, strategyPhases, metrics] = await Promise.all([
      ctx.db.get(launchPlan.projectId),
      ctx.db
        .query("launchChecklistItems")
        .withIndex("by_launch_plan", (q) => q.eq("launchPlanId", args.launchPlanId))
        .order("asc")
        .collect(),
      ctx.db
        .query("launchCopy")
        .withIndex("by_launch_plan", (q) => q.eq("launchPlanId", args.launchPlanId))
        .collect(),
      ctx.db
        .query("launchStrategy")
        .withIndex("by_launch_plan", (q) => q.eq("launchPlanId", args.launchPlanId))
        .order("asc")
        .collect(),
      ctx.db
        .query("launchMetrics")
        .withIndex("by_launch_plan", (q) => q.eq("launchPlanId", args.launchPlanId))
        .collect(),
    ]);

    return {
      ...launchPlan,
      project,
      checklistItems,
      copyItems,
      strategyPhases,
      metrics,
    };
  },
});