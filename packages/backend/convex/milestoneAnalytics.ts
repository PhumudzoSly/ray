import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { ConvexSession } from "./betterAuth";

// Query to get all active milestones that need status analysis
export const getActiveMilestones = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const milestones = await ctx.db
      .query("milestones")
      .filter((q) =>
        q.and(
          q.eq(q.field("organizationId"), session.activeOrganizationId),
          q.or(
            q.eq(q.field("status"), "not-started"),
            q.eq(q.field("status"), "in-progress"),
            q.eq(q.field("status"), "at-risk")
          )
        )
      )
      .collect();

    return milestones;
  },
});

// Mutation to update milestone status based on analysis
export const updateMilestoneStatus = mutation({
  args: {
    milestoneId: v.id("milestones"),
    newStatus: v.union(
      v.literal("not-started"),
      v.literal("in-progress"),
      v.literal("at-risk"),
      v.literal("delayed"),
      v.literal("completed")
    ),
    reason: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const milestone = await ctx.db.get(args.milestoneId);
    if (!milestone) return;

    // Verify milestone belongs to user's organization
    if (milestone.organizationId !== session.activeOrganizationId) {
      throw new Error("Unauthorized");
    }

    // Only update if status actually changed
    if (milestone.status !== args.newStatus) {
      await ctx.db.patch(args.milestoneId, {
        status: args.newStatus,
        updatedAt: Date.now(),
      });

      // Create activity log for automated status change
      await ctx.db.insert("activities", {
        organizationId: milestone.organizationId,
        userId: session.userId as Id<"user">,
        title: `Milestone "${milestone.name}" automatically updated to ${args.newStatus}`,
        description: args.reason,
        activity: "milestone_updated",
        entityType: "milestone",
        entityId: args.milestoneId,
        entityName: milestone.name,
        projectId: milestone.projectId,
        milestoneId: args.milestoneId,
        metadata: {
          oldValue: milestone.status,
          newValue: args.newStatus,
          field: "status",
        },
        createdAt: Date.now(),
      });
    }
  },
});

// Public mutation to manually trigger milestone analysis (for testing or manual refresh)
export const triggerMilestoneAnalysis = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Call analyzeMilestoneHealth directly since it's now a regular mutation
    // We'll inline the logic here to avoid circular calls
    const milestones = await ctx.db
      .query("milestones")
      .filter((q) =>
        q.and(
          q.eq(q.field("organizationId"), session.activeOrganizationId),
          q.or(
            q.eq(q.field("status"), "not-started"),
            q.eq(q.field("status"), "in-progress"),
            q.eq(q.field("status"), "at-risk")
          )
        )
      )
      .collect();
    const now = Date.now();

    for (const milestone of milestones) {
      // Skip if no target date
      if (!milestone.targetDate) continue;

      // Check if milestone is overdue
      if (milestone.targetDate < now && milestone.status !== "delayed") {
        // Update milestone status directly
        await ctx.db.patch(milestone._id, {
          status: "delayed",
          updatedAt: Date.now(),
        });

        // Create activity log
        await ctx.db.insert("activities", {
          organizationId: milestone.organizationId,
          userId: session.userId as Id<"user">,
          title: `Milestone "${milestone.name}" automatically updated to delayed`,
          description: `Target date (${new Date(milestone.targetDate).toDateString()}) has passed`,
          activity: "milestone_updated",
          entityType: "milestone",
          entityId: milestone._id,
          entityName: milestone.name,
          projectId: milestone.projectId,
          milestoneId: milestone._id,
          metadata: {
            oldValue: milestone.status,
            newValue: "delayed",
            field: "status",
          },
          createdAt: Date.now(),
        });
        continue;
      }

      // Calculate progress and time remaining for risk assessment
      const issues = await ctx.db
        .query("issues")
        .withIndex("byMilestone", (q) => q.eq("milestoneId", milestone._id))
        .collect();

      if (issues.length === 0) continue;

      const completedIssues = issues.filter((issue) => issue.achieved === true);
      const progressPercentage = (completedIssues.length / issues.length) * 100;

      const timeTotal = milestone.targetDate - milestone.createdAt;
      const timeElapsed = now - milestone.createdAt;
      const timeProgress = (timeElapsed / timeTotal) * 100;

      // Risk assessment logic
      let newStatus = milestone.status;
      let reason = "";

      // If we're 75% through the timeline but less than 50% done with issues
      if (timeProgress >= 75 && progressPercentage < 50) {
        newStatus = "at-risk";
        reason = `${Math.round(timeProgress)}% of time elapsed but only ${Math.round(progressPercentage)}% of issues completed`;
      }
      // If we're 50% through the timeline but less than 25% done with issues
      else if (timeProgress >= 50 && progressPercentage < 25) {
        newStatus = "at-risk";
        reason = `${Math.round(timeProgress)}% of time elapsed but only ${Math.round(progressPercentage)}% of issues completed`;
      }
      // If we have some progress and are not at risk, mark as in-progress
      else if (progressPercentage > 0 && milestone.status === "not-started") {
        newStatus = "in-progress";
        reason = `Work has begun - ${Math.round(progressPercentage)}% of issues completed`;
      }
      // If we're on track, ensure status reflects that
      else if (
        milestone.status === "at-risk" &&
        timeProgress <= 60 &&
        progressPercentage >= timeProgress * 0.8
      ) {
        newStatus = "in-progress";
        reason = `Back on track - ${Math.round(progressPercentage)}% of issues completed with ${Math.round(100 - timeProgress)}% of time remaining`;
      }

      // Check dependencies for additional risk factors
      const dependencies = await ctx.db
        .query("milestoneDependencies")
        .withIndex("by_milestone", (q) => q.eq("milestoneId", milestone._id))
        .collect();

      for (const dependency of dependencies) {
        const dependentMilestone = await ctx.db.get(
          dependency.dependsOnMilestoneId
        );
        if (
          dependentMilestone?.status === "delayed" &&
          newStatus !== "at-risk"
        ) {
          newStatus = "at-risk";
          reason = `Dependent milestone "${dependentMilestone.name}" is delayed`;
          break;
        }
      }

      if (newStatus !== milestone.status) {
        // Update milestone status directly
        await ctx.db.patch(milestone._id, {
          status: newStatus,
          updatedAt: Date.now(),
        });

        // Create activity log
        await ctx.db.insert("activities", {
          organizationId: milestone.organizationId,
          userId: session.userId as Id<"user">,
          title: `Milestone "${milestone.name}" automatically updated to ${newStatus}`,
          description: reason,
          activity: "milestone_updated",
          entityType: "milestone",
          entityId: milestone._id,
          entityName: milestone.name,
          projectId: milestone.projectId,
          milestoneId: milestone._id,
          metadata: {
            oldValue: milestone.status,
            newValue: newStatus,
            field: "status",
          },
          createdAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});
