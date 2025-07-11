import { v } from "convex/values";
import { query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { ConvexSession } from "./betterAuth";
import { Id } from "./_generated/dataModel";

export const getStats = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const [projects, issues, members, ideas] = await Promise.all([
      ctx.db
        .query("projects")
        .withIndex("byOrg", (q) =>
          q.eq(
            "organizationId",
            session.activeOrganizationId as Id<"organization">
          )
        )
        .collect(),
      ctx.db
        .query("issues")
        .withIndex("byOrg", (q) =>
          q.eq(
            "organizationId",
            session.activeOrganizationId as Id<"organization">
          )
        )
        .collect(),
      ctx.db
        .query("member")
        .withIndex("byOrg", (q) =>
          q.eq(
            "organizationId",
            session.activeOrganizationId as Id<"organization">
          )
        )
        .collect(),
      ctx.db
        .query("idea")
        .withIndex("byOrg", (q) =>
          q.eq(
            "organizationId",
            session.activeOrganizationId as Id<"organization">
          )
        )
        .collect(),
    ]);

    return {
      projects,
      issues,
      members,
      ideas,
    };
  },
});

export const getUpcomingIssues = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const issues = await ctx.db
      .query("issues")
      .withIndex("byOrg", (q) =>
        q.eq(
          "organizationId",
          session.activeOrganizationId as Id<"organization">
        )
      )
      .filter((q) =>
        q.and(
          q.neq(q.field("dueDate"), null),
          q.lt(q.field("dueDate"), sevenDaysFromNow.toISOString()),
          q.gt(q.field("dueDate"), now.toISOString()),
          q.eq(q.field("achieved"), false)
        )
      )
      .order("asc")
      .collect();

    // Get user and project details for each issue
    const enrichedIssues = await Promise.all(
      issues.map(async (issue) => {
        const [assignee, project] = await Promise.all([
          issue.assignedTo ? ctx.db.get(issue.assignedTo) : null,
          ctx.db.get(issue.projectId),
        ]);

        return {
          ...issue,
          assignee,
          project,
        };
      })
    );

    return enrichedIssues;
  },
});
