import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Query: Get all conversations for a user
export const getConversations = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("agentConversations")
      .withIndex("by_user_and_active", (q) =>
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .order("desc")
      .collect();

    return conversations;
  },
});

// Query: Get messages for a conversation
export const getMessages = query({
  args: {
    conversationId: v.id("agentConversations"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("agentMessages")
      .withIndex("by_conversation_and_created_at", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    return messages;
  },
});

// Query: Get single conversation
export const getConversation = query({
  args: {
    conversationId: v.id("agentConversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

// Mutation: Create a new conversation
export const createConversation = mutation({
  args: {
    title: v.string(),
    userId: v.string(),
    organizationId: v.id("organization"),
    model: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const conversationId = await ctx.db.insert("agentConversations", {
      title: args.title,
      userId: args.userId,
      organizationId: args.organizationId,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      model: args.model || "gemini-2.0-flash",
      systemPrompt: args.systemPrompt,
    });

    return conversationId;
  },
});

// Mutation: Add a message to a conversation
export const addMessage = mutation({
  args: {
    conversationId: v.id("agentConversations"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system")
    ),
    content: v.string(),
    userId: v.string(),
    isError: v.optional(v.boolean()),
    tokens: v.optional(
      v.object({
        input: v.number(),
        output: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("agentMessages", {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      userId: args.userId,
      createdAt: Date.now(),
      isError: args.isError,
      tokens: args.tokens,
    });

    // Defensive: Check if conversation exists before patching
    const conversation = await ctx.db.get(args.conversationId);
    if (conversation) {
      await ctx.db.patch(args.conversationId, {
        updatedAt: Date.now(),
      });
    } else {
      console.error(
        "Tried to update nonexistent conversation",
        args.conversationId
      );
      // Optionally, throw an error or just skip patching
    }

    return messageId;
  },
});

// Mutation: Update conversation title
export const updateConversationTitle = mutation({
  args: {
    conversationId: v.id("agentConversations"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      title: args.title,
      updatedAt: Date.now(),
    });
  },
});

// Mutation: Delete conversation
export const deleteConversation = mutation({
  args: {
    conversationId: v.id("agentConversations"),
  },
  handler: async (ctx, args) => {
    // Delete all messages first
    const messages = await ctx.db
      .query("agentMessages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete conversation
    await ctx.db.delete(args.conversationId);
  },
});
