import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { mutation, query } from "../_generated/server";
import {
  importance,
  issueLabel,
  issueStatus,
  featurePhase,
} from "../../schemas/enums";
import { ConvexSession } from "../betterAuth";
import { Id } from "../_generated/dataModel";

export const changeIssueStatus = mutation({
  args: {
    token: v.string(),
    status: issueStatus,
    issueId: v.id("issues"),
  },
  handler: async (ctx, { issueId, status, token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }
    await ctx.runQuery(api.user.session, {
      token,
    });

    // Get issue before updating for activity tracking
    const issue = await ctx.db.get(issueId);
    if (!issue) {
      throw Error("Issue not found");
    }

    // Validate that issue can be marked as DONE
    if (status === "DONE") {
      const validationResult = await ctx.runQuery(
        api.issue.dependency.validateIssueCompletion,
        { token, issueId }
      );
      
      if (validationResult && !validationResult.canComplete) {
        throw new Error(
          `Cannot mark issue as DONE: blocked by ${validationResult.blockers.length} uncompleted dependencies`
        );
      }
    }

    await ctx.db.patch(issueId, { status });

    // Track activity
    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Changed status of issue "${issue.title}"`,
      description: `Changed from "${issue.status}" to "${status}"`,
      activity: "status_changed",
      entityType: "issue",
      entityId: issueId.toString(),
      entityName: issue.title,
      projectId: issue.projectId,
      issueId: issueId,
      metadata: {
        oldValue: issue.status,
        newValue: status,
        field: "status",
      },
    });
  },
});

export const changeIssuePriority = mutation({
  args: {
    token: v.string(),
    priority: importance,
    issueId: v.id("issues"),
  },
  handler: async (ctx, { issueId, priority, token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }
    await ctx.runQuery(api.user.session, {
      token,
    });

    // Get issue before updating for activity tracking
    const issue = await ctx.db.get(issueId);
    if (!issue) {
      throw Error("Issue not found");
    }

    await ctx.db.patch(issueId, { priority });

    // Track activity
    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Changed priority of issue "${issue.title}"`,
      description: `Changed from "${issue.priority}" to "${priority}"`,
      activity: "updated",
      entityType: "issue",
      entityId: issueId.toString(),
      entityName: issue.title,
      projectId: issue.projectId,
      issueId: issueId,
      metadata: {
        oldValue: issue.priority,
        newValue: priority,
        field: "priority",
      },
    });
  },
});

export const changeIssueLabel = mutation({
  args: {
    token: v.string(),
    label: issueLabel,
    issueId: v.id("issues"),
  },
  handler: async (ctx, { issueId, label, token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }
    await ctx.runQuery(api.user.session, {
      token,
    });

    // Get issue before updating for activity tracking
    const issue = await ctx.db.get(issueId);
    if (!issue) {
      throw Error("Issue not found");
    }

    await ctx.db.patch(issueId, { label });

    // Track activity
    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Changed label of issue "${issue.title}"`,
      description: `Changed from "${issue.label}" to "${label}"`,
      activity: "updated",
      entityType: "issue",
      entityId: issueId.toString(),
      entityName: issue.title,
      projectId: issue.projectId,
      issueId: issueId,
      metadata: {
        oldValue: issue.label,
        newValue: label,
        field: "label",
      },
    });
  },
});

export const changeIssueAssignedTo = mutation({
  args: {
    token: v.string(),
    userId: v.id("user") || v.null(),
    issueId: v.id("issues"),
  },
  handler: async (ctx, { issueId, userId, token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    await ctx.runQuery(api.user.session, {
      token,
    });

    // Get issue before updating for activity tracking
    const issue = await ctx.db.get(issueId);
    if (!issue) {
      throw Error("Issue not found");
    }

    // Get user information for better tracking
    const oldUser = issue.assignedTo
      ? await ctx.db.get(issue.assignedTo)
      : null;
    const newUser = userId ? await ctx.db.get(userId) : null;

    await ctx.db.patch(issueId, { assignedTo: userId });

    // Track activity
    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: userId
        ? `Assigned issue "${issue.title}"`
        : `Unassigned issue "${issue.title}"`,
      description: userId
        ? `Assigned to ${newUser?.name || "Unknown user"}`
        : `Unassigned from ${oldUser?.name || "Unknown user"}`,
      activity: userId ? "assigned" : "unassigned",
      entityType: "issue",
      entityId: issueId.toString(),
      entityName: issue.title,
      projectId: issue.projectId,
      issueId: issueId,
      metadata: {
        oldValue: oldUser?.name,
        newValue: newUser?.name,
        field: "assignedTo",
      },
    });
  },
});

export const changeIssueDueDate = mutation({
  args: {
    token: v.string(),
    dueDate: v.string() || v.null(),
    issueId: v.optional(v.id("issues")),
  },
  handler: async (ctx, { issueId, dueDate, token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    if (!issueId) {
      throw new Error("Issue ID is missing");
    }
    await ctx.runQuery(api.user.session, {
      token,
    });

    // Get issue before updating for activity tracking
    const issue = await ctx.db.get(issueId);
    if (!issue) {
      throw Error("Issue not found");
    }

    // Format dates for better display
    const formatDate = (dateStr: string | null | undefined) => {
      if (!dateStr) return null;
      try {
        return new Date(dateStr).toLocaleDateString();
      } catch {
        return dateStr;
      }
    };

    await ctx.db.patch(issueId, { dueDate });

    // Track activity
    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: dueDate
        ? `Set due date for issue "${issue.title}"`
        : `Removed due date from issue "${issue.title}"`,
      description: dueDate
        ? `Set due date to ${formatDate(dueDate) || "Unknown date"}`
        : `Removed due date (was ${formatDate(issue.dueDate) || "Unknown date"})`,
      activity: "updated",
      entityType: "issue",
      entityId: issueId.toString(),
      entityName: issue.title,
      projectId: issue.projectId,
      issueId: issueId,
      metadata: {
        oldValue: formatDate(issue.dueDate) || "No date",
        newValue: formatDate(dueDate) || "No date",
        field: "dueDate",
      },
    });
  },
});

export const changeIssueTitle = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    issueId: v.id("issues"),
  },
  handler: async (ctx, { issueId, title, token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    await ctx.runQuery(api.user.session, {
      token,
    });

    // Get issue before updating for activity tracking
    const issue = await ctx.db.get(issueId);
    if (!issue) {
      throw Error("Issue not found");
    }

    await ctx.db.patch(issueId, { title });

    // Track activity
    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Changed title of issue`,
      description: `Changed from "${issue.title}" to "${title}"`,
      activity: "updated",
      entityType: "issue",
      entityId: issueId.toString(),
      entityName: title,
      projectId: issue.projectId,
      issueId: issueId,
      metadata: {
        oldValue: issue.title,
        newValue: title,
        field: "title",
      },
    });
  },
});

export const changeIssueDescription = mutation({
  args: {
    token: v.string(),
    description: v.string(),
    issueId: v.id("issues"),
  },
  handler: async (ctx, { issueId, description, token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    await ctx.runQuery(api.user.session, {
      token,
    });

    // Get issue before updating for activity tracking
    const issue = await ctx.db.get(issueId);
    if (!issue) {
      throw Error("Issue not found");
    }

    await ctx.db.patch(issueId, { description });

    // Track activity
    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Updated description of issue "${issue.title}"`,
      description: description
        ? "Updated issue description"
        : "Cleared issue description",
      activity: "updated",
      entityType: "issue",
      entityId: issueId.toString(),
      entityName: issue.title,
      projectId: issue.projectId,
      issueId: issueId,
      metadata: {
        oldValue: issue.description ? "Had description" : "No description",
        newValue: description ? "Has description" : "No description",
        field: "description",
      },
    });
  },
});

export const changeIssueFeature = mutation({
  args: {
    token: v.string(),
    featureId: v.id("feature") || v.null(),
    issueId: v.id("issues"),
  },
  handler: async (ctx, { issueId, featureId, token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    await ctx.runQuery(api.user.session, {
      token,
    });

    // Get issue before updating for activity tracking
    const issue = await ctx.db.get(issueId);
    if (!issue) {
      throw Error("Issue not found");
    }

    // Get feature information for better tracking
    const oldFeature = issue.featureId ? await ctx.db.get(issue.featureId) : null;
    const newFeature = featureId ? await ctx.db.get(featureId) : null;

    await ctx.db.patch(issueId, { featureId });

    // Track activity
    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: featureId
        ? `Linked issue "${issue.title}" to feature`
        : `Unlinked issue "${issue.title}" from feature`,
      description: featureId
        ? `Linked to feature "${newFeature?.name || "Unknown feature"}"`
        : `Unlinked from feature "${oldFeature?.name || "Unknown feature"}"`,
      activity: "updated",
      entityType: "issue",
      entityId: issueId.toString(),
      entityName: issue.title,
      projectId: issue.projectId,
      issueId: issueId,
      metadata: {
        oldValue: oldFeature?.name,
        newValue: newFeature?.name,
        field: "featureId",
      },
    });
  },
});
export const togglePublic = mutation({
  args: {
    token: v.string(),
    isPublic: v.boolean(),
    issueId: v.id("issues"),
  },
  handler: async (ctx, { issueId, isPublic, token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    await ctx.runQuery(api.user.session, {
      token,
    });

    // Get issue before updating for activity tracking
    const issue = await ctx.db.get(issueId);
    if (!issue) {
      throw Error("Issue not found");
    }

    await ctx.db.patch(issueId, { isPublic });

    // Track activity
    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Changed visibility of issue "${issue.title}"`,
      description: isPublic
        ? "Made issue public"
        : "Made issue private",
      activity: "updated",
      entityType: "issue",
      entityId: issueId.toString(),
      entityName: issue.title,
      projectId: issue.projectId,
      issueId: issueId,
      metadata: {
        oldValue: issue.isPublic ? "Public" : "Private",
        newValue: isPublic ? "Public" : "Private",
        field: "isPublic",
      },
    });
  },
});

export const listAll = query({
  args: {
    token: v.string(),
  },
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

    const issues = await ctx.db
      .query("issues")
      .withIndex("byOrg", (q) =>
        q.eq("organizationId", session.activeOrganizationId as any)
      )
      .order("desc")
      .collect();

    return issues;
  },
});
