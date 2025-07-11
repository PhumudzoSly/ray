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

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(projectId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });

    const updatedProject = await ctx.db.get(projectId);

    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Updated project "${updatedProject?.name || "Unknown project"}"`,
      description: `Project updated`,
      activity: "updated",
      entityType: "project",
      entityId: projectId.toString(),
      entityName: updatedProject?.name || "Unknown project",
      projectId,
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
    const projectsWithFlowData = await Promise.all(
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

        const [nodes, edges] = await Promise.all([
          ctx.db
            .query("flowNodes")
            .withIndex("by_flow", (q) => q.eq("flowId", mainFlow._id))
            .collect(),
          ctx.db
            .query("flowEdges")
            .withIndex("by_flow", (q) => q.eq("flowId", mainFlow._id))
            .collect(),
        ]);

        // Format for React Flow
        const formattedNodes = nodes.map((node: any) => ({
          id: node.nodeId,
          type: "flowNode",
          position: node.position,
          data: {
            type: node.type,
            label: node.label,
            description: node.description,
            priority: node.data.priority,
            features: node.data.features,
            dependencies: node.data.dependencies,
            hasSubFlow: node.data.hasSubFlow,
          },
        }));

        const formattedEdges = edges.map((edge) => ({
          id: edge.edgeId,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          animated: edge.animated,
          style: edge.style,
        }));

        // Calculate project health metrics
        const totalNodes = formattedNodes.length;
        const totalEdges = formattedEdges.length;

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

        // Get PRDs for this project
        const prds = await ctx.db
          .query("prds")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();

        const totalPrds = prds.length;

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
        const nodeWeight = 0.3; // 30% of score
        const issueWeight = 0.3; // 30% of score
        const prdWeight = 0.2; // 20% of score
        const launchPlanWeight = 0.2; // 20% of score

        // Node score (more nodes = better, up to a reasonable limit)
        const nodeScore = Math.min(totalNodes / 10, 1) * 100; // Max score at 10+ nodes

        // Issue score (fewer open issues = better)
        const issueScore =
          totalIssues > 0
            ? ((totalIssues - openIssues) / totalIssues) * 100
            : 0;

        // PRD score (more PRDs = better, up to a reasonable limit)
        const prdScore = Math.min(totalPrds / 5, 1) * 100; // Max score at 5+ PRDs

        // Launch plan score (having a plan = 100, no plan = 0)
        const launchPlanScore = hasLaunchPlan ? 100 : 0;

        // Calculate weighted score
        launchReadinessScore = Math.round(
          nodeScore * nodeWeight +
            issueScore * issueWeight +
            prdScore * prdWeight +
            launchPlanScore * launchPlanWeight
        );

        // Ensure score is between 0-100
        launchReadinessScore = Math.max(0, Math.min(100, launchReadinessScore));

        return {
          ...project,
          flowData: {
            nodes: formattedNodes,
            edges: formattedEdges,
          },
          metrics: {
            totalNodes,
            totalEdges,
            totalIssues,
            openIssues,
            completedIssues: totalIssues - openIssues,
            totalFeatures,
            completedFeatures,
            inProgressFeatures,
            totalPrds,
            hasLaunchPlan,
            launchReadinessScore,
          },
        };
      })
    );

    return projectsWithFlowData;
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

    const [nodes, edges] = await Promise.all([
      ctx.db
        .query("flowNodes")
        .withIndex("by_flow", (q) => q.eq("flowId", mainFlow._id))
        .collect(),
      ctx.db
        .query("flowEdges")
        .withIndex("by_flow", (q) => q.eq("flowId", mainFlow._id))
        .collect(),
    ]);

    // Format for React Flow
    const formattedNodes = nodes.map((node) => ({
      id: node.nodeId,
      type: "flowNode",
      position: node.position,
      data: {
        type: node.type,
        label: node.label,
        description: node.description,
        priority: node.data.priority,
        features: node.data.features,
        dependencies: node.data.dependencies,
        hasSubFlow: node.data.hasSubFlow,
      },
    }));

    const formattedEdges = edges.map((edge) => ({
      id: edge.edgeId,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      animated: edge.animated,
      style: edge.style,
    }));

    // Calculate project health metrics
    const totalNodes = formattedNodes.length;
    const totalEdges = formattedEdges.length;

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

    // Get PRDs for this project
    const prds = await ctx.db
      .query("prds")
      .withIndex("by_project", (q) => q.eq("projectId", id))
      .collect();

    const totalPrds = prds.length;

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
    const nodeWeight = 0.3; // 30% of score
    const issueWeight = 0.3; // 30% of score
    const prdWeight = 0.2; // 20% of score
    const launchPlanWeight = 0.2; // 20% of score

    // Node score (more nodes = better, up to a reasonable limit)
    const nodeScore = Math.min(totalNodes / 10, 1) * 100; // Max score at 10+ nodes

    // Issue score (fewer open issues = better)
    const issueScore =
      totalIssues > 0 ? ((totalIssues - openIssues) / totalIssues) * 100 : 0;

    // PRD score (more PRDs = better, up to a reasonable limit)
    const prdScore = Math.min(totalPrds / 5, 1) * 100; // Max score at 5+ PRDs

    // Launch plan score (having a plan = 100, no plan = 0)
    const launchPlanScore = hasLaunchPlan ? 100 : 0;

    // Calculate weighted score
    launchReadinessScore = Math.round(
      nodeScore * nodeWeight +
        issueScore * issueWeight +
        prdScore * prdWeight +
        launchPlanScore * launchPlanWeight
    );

    // Ensure score is between 0-100
    launchReadinessScore = Math.max(0, Math.min(100, launchReadinessScore));

    return {
      ...project,
      flowData: {
        nodes: formattedNodes,
        edges: formattedEdges,
      },
      metrics: {
        totalNodes,
        totalEdges,
        totalIssues,
        openIssues,
        completedIssues: totalIssues - openIssues,
        totalFeatures,
        completedFeatures,
        inProgressFeatures,
        totalPrds,
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
