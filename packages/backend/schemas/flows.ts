import { defineTable } from "convex/server";
import { v } from "convex/values";

export const flows = defineTable({
  projectId: v.id("projects"),
  parentNodeId: v.optional(v.string()), // For sub-flows, this is the parent node ID
  name: v.string(),
  description: v.optional(v.string()),
  type: v.union(v.literal("main"), v.literal("sub")),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_project", ["projectId"])
  .index("by_parent_node", ["parentNodeId"])
  .index("by_project_and_type", ["projectId", "type"]);

export const flowNodes = defineTable({
  flowId: v.id("flows"),
  nodeId: v.string(), // Unique identifier for the node within the flow
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
    v.literal("sms"),
    v.literal("group"),
    v.literal("conditional"),
    v.literal("start"),
    v.literal("end"),
    v.literal("stickyNote")
  ),
  label: v.string(),
  description: v.optional(v.string()),
  position: v.object({
    x: v.number(),
    y: v.number(),
  }),
  data: v.object({
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    features: v.optional(v.array(v.string())),
    dependencies: v.optional(v.array(v.string())),
    hasSubFlow: v.optional(v.boolean()),
    featureId: v.optional(v.id("feature")),
    // For conditional nodes
    conditions: v.optional(
      v.array(
        v.object({
          id: v.string(),
          label: v.string(),
          expression: v.string(),
          color: v.string(),
        })
      )
    ),
    // Allow any additional data for extensibility
    additionalData: v.optional(v.any()),
  }),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_flow", ["flowId"])
  .index("by_node_id", ["nodeId"])
  .index("by_flow_and_node", ["flowId", "nodeId"]);

export const flowEdges = defineTable({
  flowId: v.id("flows"),
  edgeId: v.string(), // Unique identifier for the edge within the flow
  source: v.string(), // Source node ID
  target: v.string(), // Target node ID
  sourceHandle: v.optional(v.string()), // For conditional nodes
  targetHandle: v.optional(v.string()), // For conditional nodes
  type: v.optional(v.string()),
  animated: v.optional(v.boolean()),
  style: v.optional(
    v.object({
      stroke: v.optional(v.string()),
      strokeWidth: v.optional(v.number()),
    })
  ),
  markerEnd: v.optional(
    v.object({
      type: v.string(),
      color: v.optional(v.string()),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
    })
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_flow", ["flowId"])
  .index("by_source", ["source"])
  .index("by_target", ["target"]);
