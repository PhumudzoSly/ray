import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexSession } from "./betterAuth";

// Generate upload URL for file uploads
export const generateUploadUrl = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

// Save file metadata after upload
export const saveFile = mutation({
  args: {
    token: v.string(),
    storageId: v.id("_storage"),
    name: v.string(),
    size: v.number(),
    type: v.string(),
  },
  handler: async (ctx, { token, storageId, name, size, type }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const fileId = await ctx.db.insert("files", {
      storageId,
      name,
      size,
      type,
      uploadedAt: Date.now(),
      uploadedBy: session.userId!,
    });

    return {
      id: fileId,
      storageId,
      name,
      size,
      type,
      uploadedAt: Date.now(),
    };
  },
});

// Get file URL
export const getFileUrl = mutation({
  args: {
    token: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { token, storageId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    return await ctx.storage.getUrl(storageId);
  },
}); 