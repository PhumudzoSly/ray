import { defineTable } from "convex/server";
import { v } from "convex/values";

export const chats = defineTable({
  projectId: v.id("projects"),
  title: v.string(),
  type: v.union(v.literal("general"), v.literal("flow-analysis"), v.literal("recommendations")),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_project", ["projectId"]);

export const messages = defineTable({
  chatId: v.id("chats"),
  content: v.string(),
  role: v.union(v.literal("user"), v.literal("assistant")),
  metadata: v.optional(v.object({
    type: v.optional(v.string()),
    suggestions: v.optional(v.array(v.string())),
    missingFlows: v.optional(v.array(v.object({
      type: v.string(),
      label: v.string(),
      description: v.string(),
      priority: v.string(),
      reasoning: v.string(),
    }))),
  })),
  createdAt: v.number(),
}).index("by_chat", ["chatId"]);