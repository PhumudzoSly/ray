import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { mutation, query } from "../_generated/server";
import { importance, issueLabel, issueStatus } from "../../schemas/enums";
import { Id } from "../_generated/dataModel";
import { ConvexSession } from "../betterAuth";

export const addIssue = mutation({
  args: {
    token: v.string(),
    issue: v.object({
      title: v.string(),
      description: v.optional(v.string()),
      organizationId: v.id("organization"),
      projectId: v.id("projects"),
      featureId: v.optional(v.id("feature")),
      parentIssueId: v.optional(v.id("issues")),
      status: issueStatus,
      priority: importance,
      label: issueLabel,
      dueDate: v.optional(v.string()),
      assignedTo: v.optional(v.id("user")),
    }),
  },
  handler: async (ctx, { token, issue }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session || session.activeOrganizationId !== issue.organizationId) {
      throw Error("Unauthorized");
    }

    // If this is a sub-issue, validate that parent exists and belongs to same project
    if (issue.parentIssueId) {
      const parentIssue = await ctx.db.get(issue.parentIssueId);
      if (!parentIssue) {
        throw Error("Parent issue not found");
      }
      if (parentIssue.projectId !== issue.projectId) {
        throw Error(
          "Sub-issue must belong to the same project as parent issue"
        );
      }
      if (parentIssue.organizationId !== issue.organizationId) {
        throw Error(
          "Sub-issue must belong to the same organization as parent issue"
        );
      }
    }

    const newIssue = await ctx.db.insert("issues", {
      ...issue,
      organizationId: session.activeOrganizationId as Id<"organization">,
      achieved: false,
    });

    // Track activity
    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Created issue "${issue.title}"`,
      description: issue.description,
      activity: "created",
      entityType: "issue",
      entityId: newIssue.toString(),
      entityName: issue.title,
      projectId: issue.projectId,
      issueId: newIssue,
    });

    // If this is a sub-issue, automatically create dependency on parent
    if (issue.parentIssueId) {
      await ctx.db.insert("issueDependency", {
        parentId: issue.parentIssueId,
        dependentIssueId: newIssue,
      });

      // Track parent relationship activity
      const parentIssue = await ctx.db.get(issue.parentIssueId);
      await ctx.runMutation(internal.activities.trackActivity, {
        organizationId: session.activeOrganizationId as Id<"organization">,
        userId: session.userId as Id<"user">,
        title: `Set parent issue for "${issue.title}"`,
        description: `Set "${parentIssue?.title}" as parent issue`,
        activity: "parent_changed",
        entityType: "issue",
        entityId: newIssue.toString(),
        entityName: issue.title,
        projectId: issue.projectId,
        issueId: newIssue,
        metadata: {
          newValue: parentIssue?.title,
        },
      });
    }

    return newIssue;
  },
});

export const getIssues = query({
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

    const issues = await ctx.db
      .query("issues")
      .withIndex("byOrg", (q) =>
        q.eq("organizationId", session.activeOrganizationId as any)
      )
      .order("desc")
      .collect();

    const finalIssues = Promise.all(
      issues.map(async (issue) => {
        //

        const [user, feature, project, parentIssue, subIssues] =
          await Promise.all([
            issue.assignedTo
              ? ctx.db.get(issue.assignedTo as Id<"user">)
              : null,
            issue.featureId
              ? ctx.db.get(issue.featureId as Id<"feature">)
              : null,
            issue.projectId
              ? ctx.db.get(issue.projectId as Id<"projects">)
              : null,
            issue.parentIssueId ? ctx.db.get(issue.parentIssueId) : null,
            ctx.db
              .query("issues")
              .withIndex("byParentIssue", (q) =>
                q.eq("parentIssueId", issue._id)
              )
              .collect(),
          ]);

        return {
          ...issue,
          user,
          feature,
          project,
          parentIssue,
          subIssueCount: subIssues.length,
          hasSubIssues: subIssues.length > 0,
          isSubIssue: !!issue.parentIssueId,
        };
      })
    );

    return finalIssues;
  },
});

export const getIssuesByProject = query({
  args: { token: v.string(), projectId: v.id("projects") },
  handler: async (ctx, { token, projectId }) => {
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
      .withIndex("byOrgProject", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();

    const finalIssues = Promise.all(
      issues.map(async (issue) => {
        //

        const [user, feature, project, parentIssue, subIssues] =
          await Promise.all([
            issue.assignedTo
              ? ctx.db.get(issue.assignedTo as Id<"user">)
              : null,
            issue.featureId
              ? ctx.db.get(issue.featureId as Id<"feature">)
              : null,
            issue.projectId
              ? ctx.db.get(issue.projectId as Id<"projects">)
              : null,
            issue.parentIssueId ? ctx.db.get(issue.parentIssueId) : null,
            ctx.db
              .query("issues")
              .withIndex("byParentIssue", (q) =>
                q.eq("parentIssueId", issue._id)
              )
              .collect(),
          ]);

        return {
          ...issue,
          user,
          feature,
          project,
          parentIssue,
          subIssueCount: subIssues.length,
          hasSubIssues: subIssues.length > 0,
          isSubIssue: !!issue.parentIssueId,
        };
      })
    );

    return finalIssues;
  },
});

export const updateIssue = mutation({
  args: {
    token: v.string(),
    issueId: v.id("issues"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      assignedTo: v.optional(v.union(v.id("user"), v.null())),
      status: v.optional(issueStatus),
      priority: v.optional(importance),
      label: v.optional(issueLabel),
      dueDate: v.optional(v.union(v.string(), v.null())),
      milestoneId: v.optional(v.union(v.id("milestones"), v.null())),
      parentIssueId: v.optional(v.union(v.id("issues"), v.null())),
    }),
  },
  handler: async (ctx, { token, issueId, updates }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const issue = await ctx.db.get(issueId);
    if (!issue) {
      throw Error("Issue not found");
    }

    // Validate that issue can be marked as DONE
    if (updates.status === "DONE") {
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

    // If parentIssueId is changing, handle dependency updates
    if (updates.parentIssueId !== undefined) {
      // Remove existing parent dependency if any
      if (issue.parentIssueId) {
        const existingDependency = await ctx.db
          .query("issueDependency")
          .withIndex("byParent", (q) => q.eq("parentId", issue.parentIssueId!))
          .filter((q) => q.eq(q.field("dependentIssueId"), issueId))
          .first();

        if (existingDependency) {
          await ctx.db.delete(existingDependency._id);
        }
      }

      // Add new parent dependency if specified
      if (updates.parentIssueId) {
        const parentIssue = await ctx.db.get(updates.parentIssueId);
        if (!parentIssue) {
          throw Error("Parent issue not found");
        }
        if (parentIssue.projectId !== issue.projectId) {
          throw Error(
            "Sub-issue must belong to the same project as parent issue"
          );
        }

        // Check for circular dependency
        const wouldCreateCycle = await ctx.runQuery(
          api.issue.dependency.checkCircularDependency,
          {
            token,
            parentId: updates.parentIssueId,
            dependentIssueId: issueId,
          }
        );

        if (wouldCreateCycle.wouldCreateCycle) {
          throw Error(
            "Cannot create parent relationship: would create circular dependency"
          );
        }

        await ctx.db.insert("issueDependency", {
          parentId: updates.parentIssueId,
          dependentIssueId: issueId,
        });
      }
    }

    // Track status changes
    if (updates.status !== undefined && updates.status !== issue.status) {
      await ctx.runMutation(internal.activities.trackActivity, {
        organizationId: issue.organizationId,
        userId: session.userId as Id<"user">,
        title: `Changed status of issue "${issue.title}"`,
        description: `Changed from "${issue.status}" to "${updates.status}"`,
        activity: "status_changed",
        entityType: "issue",
        entityId: issueId.toString(),
        entityName: issue.title,
        projectId: issue.projectId,
        issueId: issueId,
        metadata: {
          oldValue: issue.status,
          newValue: updates.status,
          field: "status",
        },
      });
    }

    // Track priority changes
    if (updates.priority !== undefined && updates.priority !== issue.priority) {
      await ctx.runMutation(internal.activities.trackActivity, {
        organizationId: issue.organizationId,
        userId: session.userId as Id<"user">,
        title: `Changed priority of issue "${issue.title}"`,
        description: `Changed from "${issue.priority}" to "${updates.priority}"`,
        activity: "updated",
        entityType: "issue",
        entityId: issueId.toString(),
        entityName: issue.title,
        projectId: issue.projectId,
        issueId: issueId,
        metadata: {
          oldValue: issue.priority,
          newValue: updates.priority,
          field: "priority",
        },
      });
    }

    // Track label changes
    if (updates.label !== undefined && updates.label !== issue.label) {
      await ctx.runMutation(internal.activities.trackActivity, {
        organizationId: issue.organizationId,
        userId: session.userId as Id<"user">,
        title: `Changed label of issue "${issue.title}"`,
        description: `Changed from "${issue.label}" to "${updates.label}"`,
        activity: "updated",
        entityType: "issue",
        entityId: issueId.toString(),
        entityName: issue.title,
        projectId: issue.projectId,
        issueId: issueId,
        metadata: {
          oldValue: issue.label,
          newValue: updates.label,
          field: "label",
        },
      });
    }

    // Track assignment changes
    if (
      updates.assignedTo !== undefined &&
      updates.assignedTo !== issue.assignedTo
    ) {
      const oldUser = issue.assignedTo
        ? await ctx.db.get(issue.assignedTo)
        : null;
      const newUser = updates.assignedTo
        ? await ctx.db.get(updates.assignedTo)
        : null;

      await ctx.runMutation(internal.activities.trackActivity, {
        organizationId: issue.organizationId,
        userId: session.userId as Id<"user">,
        title: updates.assignedTo
          ? `Assigned issue "${issue.title}"`
          : `Unassigned issue "${issue.title}"`,
        description: updates.assignedTo
          ? `Assigned to ${newUser?.name || "Unknown user"}`
          : `Unassigned from ${oldUser?.name || "Unknown user"}`,
        activity: updates.assignedTo ? "assigned" : "unassigned",
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
    }

    // Track due date changes
    if (updates.dueDate !== undefined && updates.dueDate !== issue.dueDate) {
      const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return null;
        try {
          return new Date(dateStr).toLocaleDateString();
        } catch {
          return dateStr;
        }
      };

      await ctx.runMutation(internal.activities.trackActivity, {
        organizationId: issue.organizationId,
        userId: session.userId as Id<"user">,
        title: updates.dueDate
          ? `Set due date for issue "${issue.title}"`
          : `Removed due date from issue "${issue.title}"`,
        description: updates.dueDate
          ? `Set due date to ${formatDate(updates.dueDate) || "Unknown date"}`
          : `Removed due date (was ${formatDate(issue.dueDate) || "Unknown date"})`,
        activity: "updated",
        entityType: "issue",
        entityId: issueId.toString(),
        entityName: issue.title,
        projectId: issue.projectId,
        issueId: issueId,
        metadata: {
          oldValue: formatDate(issue.dueDate) || "No date",
          newValue: formatDate(updates.dueDate) || "No date",
          field: "dueDate",
        },
      });
    }

    // Track milestone changes
    if (
      updates.milestoneId !== undefined &&
      updates.milestoneId !== issue.milestoneId
    ) {
      const oldMilestone = issue.milestoneId
        ? await ctx.db.get(issue.milestoneId)
        : null;
      const newMilestone = updates.milestoneId
        ? await ctx.db.get(updates.milestoneId)
        : null;

      await ctx.runMutation(internal.activities.trackActivity, {
        organizationId: issue.organizationId,
        userId: session.userId as Id<"user">,
        title: updates.milestoneId
          ? `Assigned issue "${issue.title}" to milestone`
          : `Unassigned issue "${issue.title}" from milestone`,
        description: updates.milestoneId
          ? `Assigned to milestone "${newMilestone?.name || "Unknown milestone"}"`
          : `Unassigned from milestone "${oldMilestone?.name || "Unknown milestone"}"`,
        activity: updates.milestoneId
          ? "milestone_assigned"
          : "milestone_unassigned",
        entityType: "issue",
        entityId: issueId.toString(),
        entityName: issue.title,
        projectId: issue.projectId,
        issueId: issueId,
        metadata: {
          oldValue: oldMilestone?.name,
          newValue: newMilestone?.name,
          field: "milestoneId",
        },
      });
    }

    // Track title changes
    if (updates.title !== undefined && updates.title !== issue.title) {
      await ctx.runMutation(internal.activities.trackActivity, {
        organizationId: issue.organizationId,
        userId: session.userId as Id<"user">,
        title: `Changed title of issue`,
        description: `Changed from "${issue.title}" to "${updates.title}"`,
        activity: "updated",
        entityType: "issue",
        entityId: issueId.toString(),
        entityName: updates.title,
        projectId: issue.projectId,
        issueId: issueId,
        metadata: {
          oldValue: issue.title,
          newValue: updates.title,
          field: "title",
        },
      });
    }

    // Track description changes
    if (
      updates.description !== undefined &&
      updates.description !== issue.description
    ) {
      await ctx.runMutation(internal.activities.trackActivity, {
        organizationId: issue.organizationId,
        userId: session.userId as Id<"user">,
        title: `Updated description of issue "${issue.title}"`,
        description: updates.description
          ? "Updated issue description"
          : "Removed issue description",
        activity: "updated",
        entityType: "issue",
        entityId: issueId.toString(),
        entityName: issue.title,
        projectId: issue.projectId,
        issueId: issueId,
        metadata: {
          oldValue: issue.description ? "Had description" : "No description",
          newValue: updates.description ? "Has description" : "No description",
          field: "description",
        },
      });
    }

    await ctx.db.patch(issueId, updates as any);

    // Track parent issue changes
    if (
      updates.parentIssueId !== undefined &&
      updates.parentIssueId !== issue.parentIssueId
    ) {
      const oldParent = issue.parentIssueId
        ? await ctx.db.get(issue.parentIssueId)
        : null;
      const newParent = updates.parentIssueId
        ? await ctx.db.get(updates.parentIssueId)
        : null;

      await ctx.runMutation(internal.activities.trackActivity, {
        organizationId: issue.organizationId,
        userId: session.userId as Id<"user">,
        title: `Changed parent issue for "${issue.title}"`,
        description: updates.parentIssueId
          ? `Set "${newParent?.title}" as parent issue`
          : `Removed "${oldParent?.title}" as parent issue`,
        activity: "parent_changed",
        entityType: "issue",
        entityId: issueId.toString(),
        entityName: issue.title,
        projectId: issue.projectId,
        issueId: issueId,
        metadata: {
          oldValue: oldParent?.title,
          newValue: newParent?.title,
          field: "parentIssueId",
        },
      });
    }

    return { success: true, message: "Issue updated successfully" };
  },
});

export const getIssueById = query({
  args: {
    token: v.string(),
    id: v.id("issues"),
  },
  handler: async (ctx, { token, id }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const issue = await ctx.db.get(id);
    if (!issue) return null;

    const [project, user] = await Promise.all([
      ctx.db.get(issue.projectId as Id<"projects">),
      issue.assignedTo ? ctx.db.get(issue.assignedTo as Id<"user">) : null,
    ]);

    return { ...issue, project, user: user || null };
  },
});

export const getLinks = query({
  args: {
    token: v.string(),
    issueId: v.id("issues"),
  },
  handler: async (ctx, { token, issueId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const links = await ctx.db
      .query("issueLink")
      .withIndex("byIssue", (q) => q.eq("issueId", issueId))
      .collect();

    return links;
  },
});

export const addLink = mutation({
  args: {
    token: v.string(),
    issueId: v.id("issues"),
    link: v.object({
      url: v.string(),
    }),
  },
  handler: async (ctx, { token, issueId, link }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Fetch metadata for the link
    try {
      const response = await fetch(link.url);
      const html = await response.text();

      // Create a simple HTML parser
      const getMetaContent = (content: string, property: string) => {
        const match =
          content.match(
            new RegExp(
              `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']+)["']`,
              "i"
            )
          ) ||
          content.match(
            new RegExp(
              `<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${property}["']`,
              "i"
            )
          );
        return match ? match[1] : null;
      };

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : null;

      // Extract metadata
      const metadata = {
        title: getMetaContent(html, "og:title") || title,
        description:
          getMetaContent(html, "og:description") ||
          getMetaContent(html, "description"),
        image: getMetaContent(html, "og:image"),
        siteName: getMetaContent(html, "og:site_name"),
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=64`,
      };

      // Insert the link with metadata
      const newLink = await ctx.db.insert("issueLink", {
        ...link,
        issueId,
        metadata: metadata as any,
      });

      // Get issue for activity tracking
      const issue = await ctx.db.get(issueId);

      // Track activity
      if (issue) {
        await ctx.runMutation(internal.activities.trackActivity, {
          organizationId: session.activeOrganizationId as Id<"organization">,
          userId: session.userId as Id<"user">,
          title: `Added link to issue "${issue.title}"`,
          description: `Added link: ${link.url}`,
          activity: "link_added",
          entityType: "issue",
          entityId: issueId.toString(),
          entityName: issue.title,
          projectId: issue.projectId,
          issueId: issueId,
          metadata: {
            newValue: link.url,
          },
        });
      }

      return newLink;
    } catch (error) {
      // If metadata fetching fails, still save the link but without metadata
      const newLink = await ctx.db.insert("issueLink", {
        ...link,
        issueId,
      });

      // Get issue for activity tracking
      const issue = await ctx.db.get(issueId);

      // Track activity
      if (issue) {
        await ctx.runMutation(internal.activities.trackActivity, {
          organizationId: session.activeOrganizationId as Id<"organization">,
          userId: session.userId as Id<"user">,
          title: `Added link to issue "${issue.title}"`,
          description: `Added link: ${link.url}`,
          activity: "link_added",
          entityType: "issue",
          entityId: issueId.toString(),
          entityName: issue.title,
          projectId: issue.projectId,
          issueId: issueId,
          metadata: {
            newValue: link.url,
          },
        });
      }

      return newLink;
    }
  },
});

export const deleteLink = mutation({
  args: {
    token: v.string(),
    linkId: v.id("issueLink"),
  },
  handler: async (ctx, { token, linkId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Get link and issue info before deletion for activity tracking
    const link = await ctx.db.get(linkId);
    const issue = link ? await ctx.db.get(link.issueId) : null;

    await ctx.db.delete(linkId);

    // Track activity
    if (issue && link) {
      await ctx.runMutation(internal.activities.trackActivity, {
        organizationId: session.activeOrganizationId as Id<"organization">,
        userId: session.userId as Id<"user">,
        title: `Removed link from issue "${issue.title}"`,
        description: `Removed link: ${link.url}`,
        activity: "link_removed",
        entityType: "issue",
        entityId: issue._id.toString(),
        entityName: issue.title,
        projectId: issue.projectId,
        issueId: issue._id,
        metadata: {
          oldValue: link.url,
        },
      });
    }
  },
});
