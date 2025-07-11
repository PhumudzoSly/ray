import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { ConvexSession } from "../betterAuth";

// Add a checklist item
export const addItem = mutation({
  args: {
    token: v.string(),
    launchPlanId: v.id("launchPlans"),
    item: v.object({
      category: v.union(
        v.literal("technical"),
        v.literal("content"),
        v.literal("legal"),
        v.literal("marketing"),
        v.literal("analytics"),
        v.literal("support")
      ),
      title: v.string(),
      description: v.string(),
      priority: v.union(
        v.literal("high"),
        v.literal("medium"),
        v.literal("low")
      ),
      isRequired: v.boolean(),
      dependsOn: v.optional(v.array(v.id("launchChecklistItems"))),
      assignedTo: v.optional(v.id("user")),
      dueDate: v.optional(v.string()),
      order: v.number(),
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
    const itemId = await ctx.db.insert("launchChecklistItems", {
      launchPlanId: args.launchPlanId,
      ...args.item,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return itemId;
  },
});

// Update checklist item status
export const updateStatus = mutation({
  args: {
    token: v.string(),
    itemId: v.id("launchChecklistItems"),
    status: v.union(
      v.literal("pending"),
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("skipped")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    await ctx.db.patch(args.itemId, {
      status: args.status,
      notes: args.notes,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update checklist item
export const updateItem = mutation({
  args: {
    token: v.string(),
    itemId: v.id("launchChecklistItems"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      priority: v.optional(
        v.union(v.literal("high"), v.literal("medium"), v.literal("low"))
      ),
      isRequired: v.optional(v.boolean()),
      assignedTo: v.optional(v.id("user")),
      dueDate: v.optional(v.string()),
      notes: v.optional(v.string()),
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

    await ctx.db.patch(args.itemId, {
      ...args.updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Delete checklist item
export const deleteItem = mutation({
  args: {
    token: v.string(),
    itemId: v.id("launchChecklistItems"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    await ctx.db.delete(args.itemId);
    return { success: true };
  },
});

// Reorder checklist items
export const reorderItems = mutation({
  args: {
    token: v.string(),
    launchPlanId: v.id("launchPlans"),
    itemOrders: v.array(
      v.object({
        itemId: v.id("launchChecklistItems"),
        order: v.number(),
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

    // Update all items with their new order
    await Promise.all(
      args.itemOrders.map(({ itemId, order }) =>
        ctx.db.patch(itemId, { order, updatedAt: Date.now() })
      )
    );

    return { success: true };
  },
});

// Get checklist items by category
export const getByCategory = query({
  args: {
    token: v.string(),
    launchPlanId: v.id("launchPlans"),
    category: v.union(
      v.literal("technical"),
      v.literal("content"),
      v.literal("legal"),
      v.literal("marketing"),
      v.literal("analytics"),
      v.literal("support")
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

    const items = await ctx.db
      .query("launchChecklistItems")
      .withIndex("by_category", (q) =>
        q.eq("launchPlanId", args.launchPlanId).eq("category", args.category)
      )
      .order("asc")
      .collect();

    return items;
  },
});

// Get checklist progress summary
export const getProgress = query({
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

    const items = await ctx.db
      .query("launchChecklistItems")
      .withIndex("by_launch_plan", (q) =>
        q.eq("launchPlanId", args.launchPlanId)
      )
      .collect();

    const total = items.length;
    const completed = items.filter(
      (item) => item.status === "completed"
    ).length;
    const inProgress = items.filter(
      (item) => item.status === "in-progress"
    ).length;
    const pending = items.filter((item) => item.status === "pending").length;
    const required = items.filter((item) => item.isRequired).length;
    const requiredCompleted = items.filter(
      (item) => item.isRequired && item.status === "completed"
    ).length;

    // Group by category
    const byCategory = items.reduce(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = {
            total: 0,
            completed: 0,
            inProgress: 0,
            pending: 0,
          };
        }
        acc[item.category].total++;
        if (item.status === "completed") acc[item.category].completed++;
        if (item.status === "in-progress") acc[item.category].inProgress++;
        if (item.status === "pending") acc[item.category].pending++;
        return acc;
      },
      {} as Record<
        string,
        {
          total: number;
          completed: number;
          inProgress: number;
          pending: number;
        }
      >
    );

    return {
      total,
      completed,
      inProgress,
      pending,
      required,
      requiredCompleted,
      completionPercentage:
        total > 0 ? Math.round((completed / total) * 100) : 0,
      requiredCompletionPercentage:
        required > 0 ? Math.round((requiredCompleted / required) * 100) : 100,
      byCategory,
      isReadyForLaunch:
        requiredCompleted === required && completed >= total * 0.8, // 80% completion + all required items
    };
  },
});
