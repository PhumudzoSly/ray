import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { ConvexSession } from "../betterAuth";

export const addIssueDependency = mutation({
  args: {
    token: v.string(),
    parentId: v.id("issues"),
    dependentIssueId: v.id("issues"),
  },
  handler: async (ctx, { token, parentId, dependentIssueId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Check if dependency already exists
    const existingDependency = await ctx.db
      .query("issueDependency")
      .withIndex("byParent", (q) => q.eq("parentId", parentId))
      .filter((q) => q.eq(q.field("dependentIssueId"), dependentIssueId))
      .first();

    if (existingDependency) {
      throw Error("Dependency already exists");
    }

    // Check for circular dependency
    const wouldCreateCycle = await ctx.runQuery(
      api.issue.dependency.checkCircularDependency,
      {
        token,
        parentId,
        dependentIssueId,
      }
    );

    if (wouldCreateCycle.wouldCreateCycle) {
      throw Error("Cannot create dependency: would create circular dependency");
    }

    await ctx.db.insert("issueDependency", {
      parentId,
      dependentIssueId,
    });

    // Get issue names for better activity tracking
    const [parentIssue, dependentIssue] = await Promise.all([
      ctx.db.get(parentId),
      ctx.db.get(dependentIssueId),
    ]);

    // Track activity
    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Added dependency to issue "${dependentIssue?.title || "Unknown issue"}"`,
      description: `Added "${parentIssue?.title || "Unknown issue"}" as dependency`,
      activity: "dependency_added",
      entityType: "issue",
      entityId: dependentIssueId.toString(),
      entityName: dependentIssue?.title || "Unknown issue",
      projectId: dependentIssue?.projectId,
      issueId: dependentIssueId,
      metadata: {
        newValue: parentIssue?.title,
      },
    });
  },
});

export const removeIssueDependency = mutation({
  args: {
    token: v.string(),
    parentId: v.id("issues"),
    dependentIssueId: v.id("issues"),
  },
  handler: async (ctx, { token, parentId, dependentIssueId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const dependency = await ctx.db
      .query("issueDependency")
      .withIndex("byParent", (q) => q.eq("parentId", parentId))
      .filter((q) => q.eq(q.field("dependentIssueId"), dependentIssueId))
      .first();

    if (dependency) {
      // Get issue names for better activity tracking before deletion
      const [parentIssue, dependentIssue] = await Promise.all([
        ctx.db.get(parentId),
        ctx.db.get(dependentIssueId),
      ]);

      await ctx.db.delete(dependency._id);

      // Track activity
      await ctx.runMutation(internal.activities.trackActivity, {
        organizationId: session.activeOrganizationId as Id<"organization">,
        userId: session.userId as Id<"user">,
        title: `Removed dependency from issue "${dependentIssue?.title || "Unknown issue"}"`,
        description: `Removed "${parentIssue?.title || "Unknown issue"}" as dependency`,
        activity: "dependency_removed",
        entityType: "issue",
        entityId: dependentIssueId.toString(),
        entityName: dependentIssue?.title || "Unknown issue",
        projectId: dependentIssue?.projectId,
        issueId: dependentIssueId,
        metadata: {
          oldValue: parentIssue?.title,
        },
      });
    }
  },
});

export const getIssueDependencies = query({
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

    // Get issues this issue depends on (blockers)
    const dependencies = await ctx.db
      .query("issueDependency")
      .withIndex("byDependent", (q) => q.eq("dependentIssueId", issueId))
      .collect();

    // Get issues that depend on this issue (dependents)
    const dependents = await ctx.db
      .query("issueDependency")
      .withIndex("byParent", (q) => q.eq("parentId", issueId))
      .collect();

    const [dependencyIssues, dependentIssues] = await Promise.all([
      Promise.all(
        dependencies.map(async (dep) => {
          const issue = await ctx.db.get(dep.parentId);
          const user = issue?.assignedTo
            ? await ctx.db.get(issue.assignedTo as Id<"user">)
            : null;
          return { ...issue, user };
        })
      ),
      Promise.all(
        dependents.map(async (dep) => {
          const issue = await ctx.db.get(dep.dependentIssueId);
          const user = issue?.assignedTo
            ? await ctx.db.get(issue.assignedTo as Id<"user">)
            : null;
          return { ...issue, user };
        })
      ),
    ]);

    return {
      dependencies: dependencyIssues.filter(Boolean),
      dependents: dependentIssues.filter(Boolean),
    };
  },
});

export const checkCircularDependency = query({
  args: {
    token: v.string(),
    parentId: v.id("issues"),
    dependentIssueId: v.id("issues"),
  },
  handler: async (ctx, { token, parentId, dependentIssueId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Check if adding this dependency would create a circular dependency
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = async (
      issueId: Id<"issues">,
      simulatedDeps: Map<string, string[]>
    ): Promise<boolean> => {
      if (recursionStack.has(issueId)) {
        return true; // Cycle detected
      }

      if (visited.has(issueId)) {
        return false; // Already processed
      }

      visited.add(issueId);
      recursionStack.add(issueId);

      // Get all dependencies of this issue (including simulated one)
      const dependencies = await ctx.db
        .query("issueDependency")
        .withIndex("byDependent", (q) => q.eq("dependentIssueId", issueId))
        .collect();

      const depParentIds = dependencies.map((dep) => dep.parentId);

      // Add simulated dependency if applicable
      if (simulatedDeps.has(issueId)) {
        depParentIds.push(
          ...simulatedDeps.get(issueId)!.map((id) => id as Id<"issues">)
        );
      }

      for (const parentId of depParentIds) {
        if (await hasCycle(parentId, simulatedDeps)) {
          return true;
        }
      }

      recursionStack.delete(issueId);
      return false;
    };

    // Create a map with the simulated dependency
    const simulatedDeps = new Map<string, string[]>();
    simulatedDeps.set(dependentIssueId, [parentId]);

    const wouldCreateCycle = await hasCycle(dependentIssueId, simulatedDeps);

    return { wouldCreateCycle };
  },
});

export const getIssueDependencyGraph = query({
  args: {
    token: v.string(),
    projectId: v.optional(v.id("projects")),
  },
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

    // Get all issues for the project or organization
    const issues = projectId
      ? await ctx.db
          .query("issues")
          .withIndex("byOrgProject", (q) => q.eq("projectId", projectId))
          .collect()
      : await ctx.db
          .query("issues")
          .withIndex("byOrg", (q) =>
            q.eq("organizationId", session.activeOrganizationId as any)
          )
          .collect();

    // Get all dependencies
    const allDependencies = await ctx.db.query("issueDependency").collect();

    // Filter dependencies to only include issues in our scope
    const issueIds = new Set(issues.map((i) => i._id));
    const dependencies = allDependencies.filter(
      (dep) => issueIds.has(dep.parentId) && issueIds.has(dep.dependentIssueId)
    );

    // Enrich issues with user data
    const enrichedIssues = await Promise.all(
      issues.map(async (issue) => {
        const user = issue.assignedTo
          ? await ctx.db.get(issue.assignedTo as Id<"user">)
          : null;
        return { ...issue, user };
      })
    );

    return {
      issues: enrichedIssues,
      dependencies,
    };
  },
});

export const getIssueHierarchy = query({
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

    const issue = await ctx.db.get(issueId);
    if (!issue) {
      throw Error("Issue not found");
    }

    // Get parent issue if exists
    const parentIssue = issue.parentIssueId
      ? await ctx.db.get(issue.parentIssueId)
      : null;

    // Get sub-issues
    const subIssues = await ctx.db
      .query("issues")
      .withIndex("byParentIssue", (q) => q.eq("parentIssueId", issueId))
      .collect();

    // Enrich with user data
    const enrichedSubIssues = await Promise.all(
      subIssues.map(async (subIssue) => {
        const user = subIssue.assignedTo
          ? await ctx.db.get(subIssue.assignedTo as Id<"user">)
          : null;
        return { ...subIssue, user };
      })
    );

    const enrichedParent = parentIssue
      ? {
          ...parentIssue,
          user: parentIssue.assignedTo
            ? await ctx.db.get(parentIssue.assignedTo as Id<"user">)
            : null,
        }
      : null;

    return {
      issue: {
        ...issue,
        user: issue.assignedTo
          ? await ctx.db.get(issue.assignedTo as Id<"user">)
          : null,
      },
      parentIssue: enrichedParent,
      subIssues: enrichedSubIssues,
    };
  },
});

export const getTopLevelIssues = query({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
  },
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

    // Get issues that don't have a parent (top-level issues)
    const issues = await ctx.db
      .query("issues")
      .withIndex("byOrgProject", (q) => q.eq("projectId", projectId))
      .filter((q) => q.eq(q.field("parentIssueId"), undefined))
      .order("desc")
      .collect();

    const finalIssues = Promise.all(
      issues.map(async (issue) => {
        const [user, project, subIssues] = await Promise.all([
          issue.assignedTo ? ctx.db.get(issue.assignedTo as Id<"user">) : null,
          issue.projectId
            ? ctx.db.get(issue.projectId as Id<"projects">)
            : null,
          ctx.db
            .query("issues")
            .withIndex("byParentIssue", (q) => q.eq("parentIssueId", issue._id))
            .collect(),
        ]);

        return {
          ...issue,
          user,
          project,
          subIssueCount: subIssues.length,
          hasSubIssues: subIssues.length > 0,
        };
      })
    );

    return finalIssues;
  },
});

export const validateIssueCompletion = query({
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

    // Get all issues this issue depends on
    const dependencies = await ctx.db
      .query("issueDependency")
      .withIndex("byDependent", (q) => q.eq("dependentIssueId", issueId))
      .collect();

    const blockers = [];
    for (const dep of dependencies) {
      const issue = await ctx.db.get(dep.parentId);
      if (issue && issue.status !== "DONE") {
        blockers.push(issue);
      }
    }

    return {
      canComplete: blockers.length === 0,
      blockers,
    };
  },
});

export const getProjectDependencyStats = query({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
  },
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
      .collect();

    const dependencies = await ctx.db.query("issueDependency").collect();
    const issueIds = new Set(issues.map((i) => i._id));
    const projectDependencies = dependencies.filter(
      (dep) => issueIds.has(dep.parentId) && issueIds.has(dep.dependentIssueId)
    );

    const stats = {
      totalIssues: issues.length,
      totalDependencies: projectDependencies.length,
      issuesWithDependencies: new Set(
        projectDependencies.map((d) => d.dependentIssueId)
      ).size,
      issuesBeingDependedOn: new Set(projectDependencies.map((d) => d.parentId))
        .size,
      blockedIssues: 0,
      completableIssues: 0,
    };

    // Calculate blocked and completable issues
    for (const issue of issues) {
      const issueDeps = projectDependencies.filter(
        (d) => d.dependentIssueId === issue._id
      );

      if (issueDeps.length === 0) {
        stats.completableIssues++;
      } else {
        const blockers = await Promise.all(
          issueDeps.map((d) => ctx.db.get(d.parentId))
        );
        const hasBlockers = blockers.some((b) => b && b.status !== "DONE");

        if (hasBlockers) {
          stats.blockedIssues++;
        } else {
          stats.completableIssues++;
        }
      }
    }

    return stats;
  },
});

export const getAllDescendantIssues = query({
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

    const getDescendants = async (
      parentId: Id<"issues">
    ): Promise<Id<"issues">[]> => {
      const directChildren = await ctx.db
        .query("issues")
        .withIndex("byParentIssue", (q) => q.eq("parentIssueId", parentId))
        .collect();

      const allDescendants: Id<"issues">[] = [];

      for (const child of directChildren) {
        allDescendants.push(child._id);
        const childDescendants = await getDescendants(child._id);
        allDescendants.push(...childDescendants);
      }

      return allDescendants;
    };

    return await getDescendants(issueId);
  },
});
