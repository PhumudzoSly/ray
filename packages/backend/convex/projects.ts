import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { betterAuth, ConvexSession } from "./betterAuth";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    project: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      platform: v.union(
        v.literal("web"),
        v.literal("mobile"),
        v.literal("both"),
        v.literal("api"),
        v.literal("plugin"),
        v.literal("desktop"),
        v.literal("cli")
      ),
      techStack: v.object({
        auth: v.string(),
        orm: v.string(),
        database: v.string(),
        ai: v.string(),
      }),
      ideaId: v.optional(v.id("idea")),
    }),
    token: v.string(),
  },
  handler: async (ctx, { project, token }) => {
    const now = Date.now();
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Create the project
    const projectId = await ctx.db.insert("projects", {
      ...project,
      status: "planning", // Default status
      createdAt: now,
      updatedAt: now,
    });

    // Create the main flow for this project
    await ctx.db.insert("flows", {
      projectId,
      name: `${project.name} - Main Flow`,
      description: "Main application flow",
      type: "main",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Created project "${project.name}"`,
      description: `Project created`,
      activity: "created",
      entityType: "project",
      entityId: projectId.toString(),
      entityName: project.name,
      projectId,
    });

    return projectId;
  },
});

export const updateStatus = mutation({
  args: {
    projectId: v.id("projects"),
    status: v.union(
      v.literal("planning"),
      v.literal("in-progress"),
      v.literal("review"),
      v.literal("completed")
    ),
    token: v.string(),
  },
  handler: async (ctx, { projectId, status, token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    await ctx.db.patch(projectId, {
      status,
      updatedAt: Date.now(),
    });

    const project = await ctx.db.get(projectId);

    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Updated project status for "${project?.name || "Unknown project"}"`,
      description: `Project status updated to ${status}`,
      activity: "status_changed",
      entityType: "project",
      entityId: projectId.toString(),
      entityName: project?.name || "Unknown project",
      projectId,
      metadata: {
        newValue: status,
        field: "status",
      },
    });
  },
});

export const update = mutation({
  args: {
    project: v.object({
      projectId: v.id("projects"),
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      platform: v.optional(
        v.union(
          v.literal("web"),
          v.literal("mobile"),
          v.literal("both"),
          v.literal("api"),
          v.literal("plugin"),
          v.literal("desktop"),
          v.literal("cli")
        )
      ),
      status: v.optional(
        v.union(
          v.literal("planning"),
          v.literal("in-progress"),
          v.literal("review"),
          v.literal("completed")
        )
      ),
      techStack: v.optional(
        v.object({
          auth: v.string(),
          orm: v.string(),
          database: v.string(),
          ai: v.string(),
        })
      ),
      infrastructure: v.optional(v.string()),
      dueDate: v.optional(v.string()),
    }),
    token: v.string(),
  },
  handler: async (ctx, { project, token }) => {
    const { projectId, ...updates } = project;

    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Get current project data before updating
    const currentProject = await ctx.db.get(projectId);
    if (!currentProject) {
      throw Error("Project not found");
    }

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    // Generate descriptive activity message based on what changed
    const changes: string[] = [];
    const metadata: { oldValue?: string; newValue?: string; field?: string } =
      {};

    if (filteredUpdates.name && filteredUpdates.name !== currentProject.name) {
      changes.push(
        `name from "${currentProject.name}" to "${filteredUpdates.name}"`
      );
      metadata.oldValue = currentProject.name;
      metadata.newValue = filteredUpdates.name as string;
      metadata.field = "name";
    }

    if (
      filteredUpdates.description &&
      filteredUpdates.description !== currentProject.description
    ) {
      changes.push("description");
      metadata.field = "description";
    }

    if (
      filteredUpdates.platform &&
      filteredUpdates.platform !== currentProject.platform
    ) {
      changes.push(
        `platform from "${currentProject.platform}" to "${filteredUpdates.platform}"`
      );
      metadata.oldValue = currentProject.platform;
      metadata.newValue = filteredUpdates.platform as string;
      metadata.field = "platform";
    }

    if (
      filteredUpdates.status &&
      filteredUpdates.status !== currentProject.status
    ) {
      changes.push(
        `status from "${currentProject.status}" to "${filteredUpdates.status}"`
      );
      metadata.oldValue = currentProject.status;
      metadata.newValue = filteredUpdates.status as string;
      metadata.field = "status";
    }

    if (filteredUpdates.techStack) {
      const currentTechStack = currentProject.techStack;
      const newTechStack = filteredUpdates.techStack as typeof currentTechStack;

      const techChanges: string[] = [];
      if (newTechStack.auth !== currentTechStack.auth) {
        techChanges.push(
          `auth from "${currentTechStack.auth}" to "${newTechStack.auth}"`
        );
      }
      if (newTechStack.orm !== currentTechStack.orm) {
        techChanges.push(
          `ORM from "${currentTechStack.orm}" to "${newTechStack.orm}"`
        );
      }
      if (newTechStack.database !== currentTechStack.database) {
        techChanges.push(
          `database from "${currentTechStack.database}" to "${newTechStack.database}"`
        );
      }
      if (newTechStack.ai !== currentTechStack.ai) {
        techChanges.push(
          `AI from "${currentTechStack.ai}" to "${newTechStack.ai}"`
        );
      }

      if (techChanges.length > 0) {
        changes.push(`tech stack (${techChanges.join(", ")})`);
        metadata.field = "techStack";
      }
    }

    if (
      filteredUpdates.infrastructure &&
      filteredUpdates.infrastructure !== currentProject.infrastructure
    ) {
      changes.push(
        `infrastructure from "${currentProject.infrastructure || "none"}" to "${filteredUpdates.infrastructure}"`
      );
      metadata.oldValue = currentProject.infrastructure || "none";
      metadata.newValue = filteredUpdates.infrastructure as string;
      metadata.field = "infrastructure";
    }

    if (
      filteredUpdates.dueDate &&
      filteredUpdates.dueDate !== currentProject.dueDate
    ) {
      const formatDate = (dateString: string) => {
        try {
          const date = new Date(dateString);
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        } catch {
          return dateString;
        }
      };

      const oldDateFormatted = currentProject.dueDate
        ? formatDate(currentProject.dueDate)
        : "none";
      const newDateFormatted = formatDate(filteredUpdates.dueDate as string);

      changes.push(
        `due date from "${oldDateFormatted}" to "${newDateFormatted}"`
      );
      metadata.oldValue = currentProject.dueDate || "none";
      metadata.newValue = filteredUpdates.dueDate as string;
      metadata.field = "dueDate";
    }

    // Update the project
    await ctx.db.patch(projectId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });

    const updatedProject = await ctx.db.get(projectId);

    // Generate activity description
    let description = "Project updated";
    if (changes.length === 1) {
      description = `Updated ${changes[0]}`;
    } else if (changes.length > 1) {
      description = `Updated ${changes.slice(0, -1).join(", ")} and ${changes[changes.length - 1]}`;
    }

    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Updated project "${updatedProject?.name || "Unknown project"}"`,
      description,
      activity: "updated",
      entityType: "project",
      entityId: projectId.toString(),
      entityName: updatedProject?.name || "Unknown project",
      projectId,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    });
  },
});

export const list = query({
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

    const projects = await ctx.db.query("projects").order("desc").collect();

    // For each project, get the main flow data for display
    const projectsWithMetrics = await Promise.all(
      projects.map(async (project) => {
        const mainFlow = await ctx.db
          .query("flows")
          .withIndex("by_project_and_type", (q) =>
            q.eq("projectId", project._id).eq("type", "main")
          )
          .first();

        if (!mainFlow) {
          return { ...project, flowData: null };
        }

        // Get issues for this project
        const issues = await ctx.db
          .query("issues")
          .withIndex("byOrgProject", (q) =>
            q
              .eq("projectId", project._id)
              .eq(
                "organizationId",
                session.activeOrganizationId as Id<"organization">
              )
          )
          .collect();

        const totalIssues = issues.length;
        const openIssues = issues.filter(
          (issue) => issue.status !== "DONE"
        ).length;

        // Get features for this project
        const features = await ctx.db
          .query("feature")
          .withIndex("byOrgProject", (q) =>
            q
              .eq("projectId", project._id)
              .eq(
                "organizationId",
                session.activeOrganizationId as Id<"organization">
              )
          )
          .collect();

        const totalFeatures = features.length;
        const completedFeatures = features.filter(
          (feature) => feature.phase === "LIVE"
        ).length;
        const inProgressFeatures = features.filter(
          (feature) => feature.phase === "DEVELOPMENT"
        ).length;

        // Check for launch plan
        const launchPlan = await ctx.db
          .query("launchPlans")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .first();

        const hasLaunchPlan = !!launchPlan;

        // Calculate launch readiness score (0-100)
        let launchReadinessScore = 0;

        // Weight factors
        const issueWeight = 0.3; // 30% of score
        const launchPlanWeight = 0.2; // 20% of score

        // Issue score (fewer open issues = better)
        const issueScore =
          totalIssues > 0
            ? ((totalIssues - openIssues) / totalIssues) * 100
            : 0;

        // Launch plan score (having a plan = 100, no plan = 0)
        const launchPlanScore = hasLaunchPlan ? 100 : 0;

        // Calculate weighted score
        launchReadinessScore = Math.round(
          issueScore * issueWeight + launchPlanScore * launchPlanWeight
        );

        // Ensure score is between 0-100
        launchReadinessScore = Math.max(0, Math.min(100, launchReadinessScore));

        return {
          ...project,
          metrics: {
            totalIssues,
            openIssues,
            completedIssues: totalIssues - openIssues,
            totalFeatures,
            completedFeatures,
            inProgressFeatures,
            hasLaunchPlan,
            launchReadinessScore,
          },
        };
      })
    );

    return projectsWithMetrics;
  },
});

export const get = query({
  args: { id: v.id("projects"), token: v.string() },
  handler: async (ctx, { id, token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const project = await ctx.db.get(id);
    if (!project) return null;

    // Get the main flow data
    const mainFlow = await ctx.db
      .query("flows")
      .withIndex("by_project_and_type", (q) =>
        q.eq("projectId", id).eq("type", "main")
      )
      .first();

    if (!mainFlow) {
      return { ...project, flowData: null };
    }

    // Get issues for this project
    const issues = await ctx.db
      .query("issues")
      .withIndex("byOrgProject", (q) =>
        q
          .eq("projectId", id)
          .eq(
            "organizationId",
            session.activeOrganizationId as Id<"organization">
          )
      )
      .collect();

    const totalIssues = issues.length;
    const openIssues = issues.filter((issue) => issue.status !== "DONE").length;

    // Get features for this project
    const features = await ctx.db
      .query("feature")
      .withIndex("byOrgProject", (q) =>
        q
          .eq("projectId", id)
          .eq(
            "organizationId",
            session.activeOrganizationId as Id<"organization">
          )
      )
      .collect();

    const totalFeatures = features.length;
    const completedFeatures = features.filter(
      (feature) => feature.phase === "LIVE"
    ).length;
    const inProgressFeatures = features.filter(
      (feature) => feature.phase === "DEVELOPMENT"
    ).length;

    // Check for launch plan
    const launchPlan = await ctx.db
      .query("launchPlans")
      .withIndex("by_project", (q) => q.eq("projectId", id))
      .first();

    const hasLaunchPlan = !!launchPlan;

    // Calculate launch readiness score (0-100)
    let launchReadinessScore = 0;

    // Weight factors
    const issueWeight = 0.3; // 30% of score
    const launchPlanWeight = 0.2; // 20% of score

    // Issue score (fewer open issues = better)
    const issueScore =
      totalIssues > 0 ? ((totalIssues - openIssues) / totalIssues) * 100 : 0;

    // PRD score (more PRDs = better, up to a reasonable limit)

    // Launch plan score (having a plan = 100, no plan = 0)
    const launchPlanScore = hasLaunchPlan ? 100 : 0;

    // Calculate weighted score
    launchReadinessScore = Math.round(
      issueScore * issueWeight + launchPlanScore * launchPlanWeight
    );

    // Ensure score is between 0-100
    launchReadinessScore = Math.max(0, Math.min(100, launchReadinessScore));

    return {
      ...project,
      metrics: {
        totalIssues,
        openIssues,
        completedIssues: totalIssues - openIssues,
        totalFeatures,
        completedFeatures,
        inProgressFeatures,
        hasLaunchPlan,
        launchReadinessScore,
      },
    };
  },
});

export const getSimpleProject = query({
  args: { id: v.id("projects"), token: v.string() },
  handler: async (ctx, { id, token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const project = await ctx.db.get(id);
    return project;
  },
});

export const deleteProject = mutation({
  args: { id: v.id("projects"), token: v.string() },
  handler: async (ctx, { id, token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(id);
    //Todo: Delete all the project data
  },
});

// Simple query to get all projects for dropdowns/selects
export const getAllProjects = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const projects = await ctx.db
      .query("projects")
      .filter((q) =>
        q.eq(
          q.field("organizationId"),
          session?.activeOrganizationId as Id<"organization">
        )
      )
      .order("desc")
      .collect();

    return projects.map((project) => ({
      _id: project._id,
      name: project.name,
      description: project.description,
      platform: project.platform,
      status: project.status,
      createdAt: project.createdAt,
    }));
  },
});
