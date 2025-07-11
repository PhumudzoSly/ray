import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexSession } from "./betterAuth";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Create a new API key
export const createApiKey = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    permissions: v.array(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }
    const apiKey = await ctx.db.insert("apiKeys", {
      organizationId: session.activeOrganizationId as Id<"organization">,
      name: args.name,
      keyHash: "", // Will be set by the server action
      keyPreview: "", // Will be set by the server action
      permissions: args.permissions,
      createdBy: session.userId as Id<"user">,
      createdAt: Date.now(),
      isActive: true,
      expiresAt: args.expiresAt,
    });

    return apiKey;
  },
});

// List all API keys for an organization
export const listApiKeys = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const apiKeys = await ctx.db
      .query("apiKeys")
      .withIndex("by_organization", (q) =>
        q.eq(
          "organizationId",
          session.activeOrganizationId as Id<"organization">
        )
      )
      .collect();

    // Return keys without the hash for security
    return apiKeys.map((key) => ({
      _id: key._id,
      name: key.name,
      keyPreview: key.keyPreview,
      permissions: key.permissions,
      createdBy: key.createdBy,
      createdAt: key.createdAt,
      lastUsed: key.lastUsed,
      isActive: key.isActive,
      expiresAt: key.expiresAt,
    }));
  },
});

// Get a specific API key by ID
export const getApiKey = query({
  args: {
    token: v.string(),
    keyId: v.id("apiKeys"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const apiKey = await ctx.db.get(args.keyId);

    if (!apiKey || apiKey.organizationId !== session.activeOrganizationId) {
      throw new Error("API key not found");
    }

    // Return key without the hash for security
    return {
      _id: apiKey._id,
      name: apiKey.name,
      keyPreview: apiKey.keyPreview,
      permissions: apiKey.permissions,
      createdBy: apiKey.createdBy,
      createdAt: apiKey.createdAt,
      lastUsed: apiKey.lastUsed,
      isActive: apiKey.isActive,
      expiresAt: apiKey.expiresAt,
    };
  },
});

// Update an API key's hash and preview (used internally)
export const updateApiKeyHash = mutation({
  args: {
    token: v.string(),
    keyId: v.id("apiKeys"),
    keyHash: v.string(),
    keyPreview: v.string(),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const apiKey = await ctx.db.get(args.keyId);

    if (!apiKey || apiKey.organizationId !== session.activeOrganizationId) {
      throw new Error("API key not found");
    }

    await ctx.db.patch(args.keyId, {
      keyHash: args.keyHash,
      keyPreview: args.keyPreview,
    });
  },
});

// Deactivate an API key
export const deactivateApiKey = mutation({
  args: {
    token: v.string(),
    keyId: v.id("apiKeys"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const apiKey = await ctx.db.get(args.keyId);

    if (!apiKey || apiKey.organizationId !== session.activeOrganizationId) {
      throw new Error("API key not found");
    }

    await ctx.db.patch(args.keyId, {
      isActive: false,
    });
  },
});

// Delete an API key
export const deleteApiKey = mutation({
  args: {
    token: v.string(),
    keyId: v.id("apiKeys"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const apiKey = await ctx.db.get(args.keyId);

    if (!apiKey || apiKey.organizationId !== session.activeOrganizationId) {
      throw new Error("API key not found");
    }

    await ctx.db.delete(args.keyId);
  },
});

// Update last used timestamp
export const updateLastUsed = mutation({
  args: {
    keyId: v.id("apiKeys"),
  },
  handler: async (ctx, args) => {
    const apiKey = await ctx.db.get(args.keyId);

    if (!apiKey || !apiKey.isActive) {
      throw new Error("API key not found or inactive");
    }

    // Check if key is expired
    if (apiKey.expiresAt && apiKey.expiresAt < Date.now()) {
      throw new Error("API key has expired");
    }

    await ctx.db.patch(args.keyId, {
      lastUsed: Date.now(),
    });
  },
});

// Verify an API key (used for authentication)
export const verifyApiKey = query({
  args: {
    keyHash: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_key_hash", (q) => q.eq("keyHash", args.keyHash))
      .first();

    if (!apiKey || !apiKey.isActive) {
      return null;
    }

    // Check if key is expired
    if (apiKey.expiresAt && apiKey.expiresAt < Date.now()) {
      return null;
    }

    return {
      _id: apiKey._id,
      organizationId: apiKey.organizationId as Id<"organization">,
      permissions: apiKey.permissions,
      name: apiKey.name,
    };
  },
});
