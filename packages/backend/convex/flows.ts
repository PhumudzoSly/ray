import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { ConvexSession } from "./betterAuth";

// Flow Management
export const createFlow = mutation({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
    parentNodeId: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("main"), v.literal("sub")),
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
    return await ctx.db.insert("flows", {
      projectId: args.projectId,
      parentNodeId: args.parentNodeId,
      name: args.name,
      description: args.description,
      type: args.type,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getMainFlow = query({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    return await ctx.db
      .query("flows")
      .withIndex("by_project_and_type", (q) =>
        q.eq("projectId", args.projectId).eq("type", "main")
      )
      .first();
  },
});

export const getSubFlow = query({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
    parentNodeId: v.string(),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    return await ctx.db
      .query("flows")
      .withIndex("by_parent_node", (q) =>
        q.eq("parentNodeId", args.parentNodeId)
      )
      .first();
  },
});

export const getAllFlows = query({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    return await ctx.db
      .query("flows")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

// Node Management
export const addNode = mutation({
  args: {
    token: v.string(),
    flowId: v.id("flows"),
    nodeId: v.string(),
    type: v.union(
      v.literal("auth"),
      v.literal("onboarding"),
      v.literal("feature"),
      v.literal("feedback"),
      v.literal("error"),
      v.literal("settings"),
      v.literal("permissions"),
      v.literal("custom"),
      v.literal("api"),
      v.literal("payment"),
      v.literal("notification"),
      v.literal("analytics"),
      v.literal("integration"),
      v.literal("database"),
      v.literal("security"),
      v.literal("storage"),
      v.literal("caching"),
      v.literal("search"),
      v.literal("email"),
      v.literal("sms")
    ),
    label: v.string(),
    description: v.optional(v.string()),
    position: v.object({
      x: v.number(),
      y: v.number(),
    }),
    data: v.object({
      priority: v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high")
      ),
      features: v.optional(v.array(v.string())),
      dependencies: v.optional(v.array(v.string())),
      hasSubFlow: v.optional(v.boolean()),
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
    return await ctx.db.insert("flowNodes", {
      flowId: args.flowId,
      nodeId: args.nodeId,
      type: args.type,
      label: args.label,
      description: args.description,
      position: args.position,
      data: args.data,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateNode = mutation({
  args: {
    token: v.string(),
    flowId: v.id("flows"),
    nodeId: v.string(),
    label: v.optional(v.string()),
    description: v.optional(v.string()),
    position: v.optional(
      v.object({
        x: v.number(),
        y: v.number(),
      })
    ),
    data: v.optional(
      v.object({
        priority: v.union(
          v.literal("low"),
          v.literal("medium"),
          v.literal("high")
        ),
        features: v.optional(v.array(v.string())),
        dependencies: v.optional(v.array(v.string())),
        hasSubFlow: v.optional(v.boolean()),
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

    const { flowId, nodeId, ...updates } = args;

    const existingNode = await ctx.db
      .query("flowNodes")
      .withIndex("by_flow_and_node", (q) =>
        q.eq("flowId", flowId).eq("nodeId", nodeId)
      )
      .first();

    if (!existingNode) {
      throw new Error("Node not found");
    }

    await ctx.db.patch(existingNode._id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteNode = mutation({
  args: {
    token: v.string(),
    flowId: v.id("flows"),
    nodeId: v.string(),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Delete the node
    const node = await ctx.db
      .query("flowNodes")
      .withIndex("by_flow_and_node", (q) =>
        q.eq("flowId", args.flowId).eq("nodeId", args.nodeId)
      )
      .first();

    if (node) {
      await ctx.db.delete(node._id);
    }

    // Delete related edges
    const edges = await ctx.db
      .query("flowEdges")
      .withIndex("by_flow", (q) => q.eq("flowId", args.flowId))
      .filter((q) =>
        q.or(
          q.eq(q.field("source"), args.nodeId),
          q.eq(q.field("target"), args.nodeId)
        )
      )
      .collect();

    for (const edge of edges) {
      await ctx.db.delete(edge._id);
    }
  },
});

export const getFlowNodes = query({
  args: {
    token: v.string(),
    flowId: v.id("flows"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    return await ctx.db
      .query("flowNodes")
      .withIndex("by_flow", (q) => q.eq("flowId", args.flowId))
      .collect();
  },
});

// Edge Management
export const addEdge = mutation({
  args: {
    token: v.string(),
    flowId: v.id("flows"),
    edgeId: v.string(),
    source: v.string(),
    target: v.string(),
    type: v.optional(v.string()),
    animated: v.optional(v.boolean()),
    style: v.optional(
      v.object({
        stroke: v.optional(v.string()),
        strokeWidth: v.optional(v.number()),
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

    const now = Date.now();
    return await ctx.db.insert("flowEdges", {
      flowId: args.flowId,
      edgeId: args.edgeId,
      source: args.source,
      target: args.target,
      type: args.type,
      animated: args.animated,
      style: args.style,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deleteEdge = mutation({
  args: {
    token: v.string(),
    flowId: v.id("flows"),
    edgeId: v.string(),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const edge = await ctx.db
      .query("flowEdges")
      .withIndex("by_flow", (q) => q.eq("flowId", args.flowId))
      .filter((q) => q.eq(q.field("edgeId"), args.edgeId))
      .first();

    if (edge) {
      await ctx.db.delete(edge._id);
    }
  },
});

export const getFlowEdges = query({
  args: {
    token: v.string(),
    flowId: v.id("flows"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    return await ctx.db
      .query("flowEdges")
      .withIndex("by_flow", (q) => q.eq("flowId", args.flowId))
      .collect();
  },
});

// Bulk Operations
export const updateFlowData = mutation({
  args: {
    token: v.string(),
    flowId: v.id("flows"),
    nodes: v.array(v.any()),
    edges: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const { flowId, nodes, edges } = args;

    // Clear existing nodes and edges
    const existingNodes = await ctx.db
      .query("flowNodes")
      .withIndex("by_flow", (q) => q.eq("flowId", flowId))
      .collect();

    const existingEdges = await ctx.db
      .query("flowEdges")
      .withIndex("by_flow", (q) => q.eq("flowId", flowId))
      .collect();

    // Delete existing data
    for (const node of existingNodes) {
      await ctx.db.delete(node._id);
    }
    for (const edge of existingEdges) {
      await ctx.db.delete(edge._id);
    }

    const now = Date.now();

    // Insert new nodes
    for (const node of nodes) {
      await ctx.db.insert("flowNodes", {
        flowId,
        nodeId: node.id,
        type: node.data.type,
        label: node.data.label,
        description: node.data.description,
        position: node.position,
        data: {
          priority: node.data.priority,
          features: node.data.features,
          dependencies: node.data.dependencies,
          hasSubFlow: node.data.hasSubFlow,
        },
        createdAt: now,
        updatedAt: now,
      });
    }

    // Insert new edges
    for (const edge of edges) {
      await ctx.db.insert("flowEdges", {
        flowId,
        edgeId: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        animated: edge.animated,
        style: edge.style,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Update flow timestamp
    await ctx.db.patch(flowId, {
      updatedAt: now,
    });
  },
});

export const createSubFlow = mutation({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
    parentNodeId: v.string(),
    name: v.string(),
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

    // Create the sub-flow
    const flowId = await ctx.db.insert("flows", {
      projectId: args.projectId,
      parentNodeId: args.parentNodeId,
      name: args.name,
      description: `Sub-flow for ${args.name}`,
      type: "sub",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Create default start and end nodes
    const startNodeId = `${args.parentNodeId}-start`;
    const endNodeId = `${args.parentNodeId}-end`;

    await ctx.db.insert("flowNodes", {
      flowId,
      nodeId: startNodeId,
      type: "custom",
      label: "Start",
      description: "Entry point for this sub-flow",
      position: { x: 100, y: 100 },
      data: {
        priority: "medium",
      },
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("flowNodes", {
      flowId,
      nodeId: endNodeId,
      type: "custom",
      label: "End",
      description: "Exit point for this sub-flow",
      position: { x: 300, y: 100 },
      data: {
        priority: "medium",
      },
      createdAt: now,
      updatedAt: now,
    });

    // Connect start to end
    await ctx.db.insert("flowEdges", {
      flowId,
      edgeId: `${startNodeId}-${endNodeId}`,
      source: startNodeId,
      target: endNodeId,
      createdAt: now,
      updatedAt: now,
    });

    return flowId;
  },
});

export const getCompleteFlowData = query({
  args: {
    token: v.string(),
    flowId: v.id("flows"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const [nodes, edges] = await Promise.all([
      ctx.db
        .query("flowNodes")
        .withIndex("by_flow", (q) => q.eq("flowId", args.flowId))
        .collect(),
      ctx.db
        .query("flowEdges")
        .withIndex("by_flow", (q) => q.eq("flowId", args.flowId))
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

    return {
      nodes: formattedNodes,
      edges: formattedEdges,
    };
  },
});
