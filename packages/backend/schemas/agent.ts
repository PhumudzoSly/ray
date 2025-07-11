import { defineTable } from "convex/server";
import { v } from "convex/values";

export const agentConversations = defineTable({
  title: v.string(),
  userId: v.string(),
  organizationId: v.id("organization"),
  createdAt: v.number(),
  updatedAt: v.number(),
  isActive: v.boolean(),
  model: v.optional(v.string()),
  systemPrompt: v.optional(v.string()),
})
  .index("by_user_and_active", ["userId", "isActive"])
  .index("by_organization", ["organizationId"])
  .index("by_updated_at", ["updatedAt"]);

export const agentMessages = defineTable({
  conversationId: v.id("agentConversations"),
  role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
  content: v.string(),
  userId: v.string(),
  createdAt: v.number(),
  isError: v.optional(v.boolean()),
  tokens: v.optional(
    v.object({
      input: v.number(),
      output: v.number(),
    })
  ),
})
  .index("by_conversation_and_created_at", ["conversationId", "createdAt"])
  .index("by_conversation", ["conversationId"])
  .index("by_user", ["userId"]);
