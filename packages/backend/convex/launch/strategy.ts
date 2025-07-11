import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { ConvexSession } from "../betterAuth";

// Add a strategy phase
export const addPhase = mutation({
  args: {
    token: v.string(),
    launchPlanId: v.id("launchPlans"),
    phase: v.object({
      phase: v.union(
        v.literal("pre-launch"),
        v.literal("soft-launch"),
        v.literal("public-launch"),
        v.literal("post-launch")
      ),
      name: v.string(),
      description: v.string(),
      duration: v.string(),
      platforms: v.array(v.string()),
      targetAudience: v.array(v.string()),
      keyMetrics: v.array(
        v.object({
          name: v.string(),
          target: v.string(),
        })
      ),
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

    // Calculate dates based on order and duration
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (args.phase.order - 1) * 7); // Default 1 week per phase

    const endDate = new Date(startDate);
    const durationMatch = args.phase.duration.match(
      /(\d+)\s*(day|week|month)s?/i
    );
    if (durationMatch) {
      const amount = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();

      switch (unit) {
        case "day":
          endDate.setDate(endDate.getDate() + amount);
          break;
        case "week":
          endDate.setDate(endDate.getDate() + amount * 7);
          break;
        case "month":
          endDate.setMonth(endDate.getMonth() + amount);
          break;
      }
    } else {
      endDate.setDate(endDate.getDate() + 7); // Default 1 week
    }

    const phaseId = await ctx.db.insert("launchStrategy", {
      launchPlanId: args.launchPlanId,
      ...args.phase,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      tasks: [],
      createdAt: now,
      updatedAt: now,
    });

    return phaseId;
  },
});

// Update strategy phase
export const updatePhase = mutation({
  args: {
    token: v.string(),
    phaseId: v.id("launchStrategy"),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      startDate: v.optional(v.string()),
      endDate: v.optional(v.string()),
      platforms: v.optional(v.array(v.string())),
      targetAudience: v.optional(v.array(v.string())),
      keyMetrics: v.optional(
        v.array(
          v.object({
            name: v.string(),
            target: v.string(),
            current: v.optional(v.number()),
          })
        )
      ),
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

    await ctx.db.patch(args.phaseId, {
      ...args.updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Add task to phase
export const addTask = mutation({
  args: {
    token: v.string(),
    phaseId: v.id("launchStrategy"),
    task: v.object({
      title: v.string(),
      description: v.string(),
      assignedTo: v.optional(v.id("user")),
      dueDate: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("in-progress"),
        v.literal("completed")
      ),
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

    const phase = await ctx.db.get(args.phaseId);
    if (!phase) {
      throw Error("Phase not found");
    }

    const updatedTasks = [...phase.tasks, args.task];

    await ctx.db.patch(args.phaseId, {
      tasks: updatedTasks,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update task status
export const updateTaskStatus = mutation({
  args: {
    token: v.string(),
    phaseId: v.id("launchStrategy"),
    taskIndex: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("in-progress"),
      v.literal("completed")
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

    const phase = await ctx.db.get(args.phaseId);
    if (!phase) {
      throw Error("Phase not found");
    }

    const updatedTasks = [...phase.tasks];
    if (updatedTasks[args.taskIndex]) {
      updatedTasks[args.taskIndex].status = args.status;
    }

    await ctx.db.patch(args.phaseId, {
      tasks: updatedTasks,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get strategy phases by launch plan
export const getByLaunchPlan = query({
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

    const phases = await ctx.db
      .query("launchStrategy")
      .withIndex("by_launch_plan", (q) =>
        q.eq("launchPlanId", args.launchPlanId)
      )
      .order("asc")
      .collect();

    return phases;
  },
});

// Get current phase based on dates
export const getCurrentPhase = query({
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

    const phases = await ctx.db
      .query("launchStrategy")
      .withIndex("by_launch_plan", (q) =>
        q.eq("launchPlanId", args.launchPlanId)
      )
      .order("asc")
      .collect();

    const today = new Date().toISOString().split("T")[0];

    // Find current phase based on dates
    const currentPhase = phases.find(
      (phase) => phase.startDate <= today && phase.endDate >= today
    );

    // If no current phase, find the next one
    const nextPhase = phases.find((phase) => phase.startDate > today);

    // Calculate phase progress
    const phaseProgress = phases.map((phase) => {
      const total = phase.tasks.length;
      const completed = phase.tasks.filter(
        (task) => task.status === "completed"
      ).length;
      const inProgress = phase.tasks.filter(
        (task) => task.status === "in-progress"
      ).length;

      return {
        ...phase,
        progress: {
          total,
          completed,
          inProgress,
          completionPercentage:
            total > 0 ? Math.round((completed / total) * 100) : 0,
        },
      };
    });

    return {
      phases: phaseProgress,
      currentPhase: currentPhase || null,
      nextPhase: nextPhase || null,
    };
  },
});

// Delete strategy phase
export const deletePhase = mutation({
  args: {
    token: v.string(),
    phaseId: v.id("launchStrategy"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    await ctx.db.delete(args.phaseId);
    return { success: true };
  },
});
