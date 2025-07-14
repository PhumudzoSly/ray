import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexSession } from "./betterAuth";
import { Id } from "./_generated/dataModel";

// Create a file asset (upload)
export const createFileAsset = mutation({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    type: v.union(
      v.literal("image"),
      v.literal("document"),
      v.literal("video"),
      v.literal("code"),
      v.literal("design"),
      v.literal("other")
    ),
    category: v.optional(
      v.union(
        v.literal("branding"),
        v.literal("ui-design"),
        v.literal("mockups"),
        v.literal("documentation"),
        v.literal("inspiration"),
        v.literal("code-snippets"),
        v.literal("presentations"),
        v.literal("tutorials"),
        v.literal("other")
      )
    ),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();
    const assetId = await ctx.db.insert("assets", {
      name: args.name,
      description: args.description,
      type: args.type,
      projectId: args.projectId,
      organizationId: session.activeOrganizationId as Id<"organization">,
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      mimeType: args.mimeType,
      category: args.category,
      tags: args.tags,
      isPublic: args.isPublic ?? false,
      uploadedBy: session.userId as Id<"user">,
      uploadedAt: now,
      updatedAt: now,
      viewCount: 0,
      downloadCount: 0,
    });

    // Track activity
    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Uploaded asset "${args.name}"`,
      description: `File uploaded to project`,
      activity: "created",
      entityType: "project",
      entityId: args.projectId.toString(),
      entityName: args.name,
      projectId: args.projectId,
    });

    return assetId;
  },
});

// Create a link asset
export const createLinkAsset = mutation({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    url: v.string(),
    linkType: v.union(
      v.literal("youtube"),
      v.literal("figma"),
      v.literal("notion"),
      v.literal("github"),
      v.literal("dribbble"),
      v.literal("behance"),
      v.literal("external")
    ),
    category: v.optional(
      v.union(
        v.literal("branding"),
        v.literal("ui-design"),
        v.literal("mockups"),
        v.literal("documentation"),
        v.literal("inspiration"),
        v.literal("code-snippets"),
        v.literal("presentations"),
        v.literal("tutorials"),
        v.literal("other")
      )
    ),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();
    const assetId = await ctx.db.insert("assets", {
      name: args.name,
      description: args.description,
      type: "link",
      projectId: args.projectId,
      organizationId: session.activeOrganizationId as Id<"organization">,
      url: args.url,
      linkType: args.linkType,
      category: args.category,
      tags: args.tags,
      isPublic: args.isPublic ?? false,
      uploadedBy: session.userId as Id<"user">,
      uploadedAt: now,
      updatedAt: now,
      viewCount: 0,
      downloadCount: 0,
    });

    // Track activity
    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Added link "${args.name}"`,
      description: `Link added to project`,
      activity: "created",
      entityType: "project",
      entityId: args.projectId.toString(),
      entityName: args.name,
      projectId: args.projectId,
    });

    return assetId;
  },
});

// Get assets for a project
export const getProjectAssets = query({
  args: {
    token: v.string(),
    projectId: v.id("projects"),
    type: v.optional(
      v.union(
        v.literal("image"),
        v.literal("document"),
        v.literal("video"),
        v.literal("link"),
        v.literal("code"),
        v.literal("design"),
        v.literal("other")
      )
    ),
    category: v.optional(
      v.union(
        v.literal("branding"),
        v.literal("ui-design"),
        v.literal("mockups"),
        v.literal("documentation"),
        v.literal("inspiration"),
        v.literal("code-snippets"),
        v.literal("presentations"),
        v.literal("tutorials"),
        v.literal("other")
      )
    ),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    let query = ctx.db
      .query("assets")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId));

    if (args.type) {
      query = ctx.db
        .query("assets")
        .withIndex("by_project_and_type", (q) =>
          q.eq("projectId", args.projectId).eq("type", args.type as any)
        );
    }

    const assets = await query.collect();

    // Get user info for each asset
    const assetsWithUsers = await Promise.all(
      assets.map(async (asset) => {
        const user = await ctx.db.get(asset.uploadedBy);
        return {
          ...asset,
          uploadedByUser: user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
              }
            : null,
        };
      })
    );

    return assetsWithUsers;
  },
});

// Get asset by ID
export const getAsset = query({
  args: {
    token: v.string(),
    assetId: v.id("assets"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const asset = await ctx.db.get(args.assetId);
    if (!asset) return null;

    // Check if user has access to this asset
    if (asset.organizationId !== session.activeOrganizationId) {
      throw new Error("Unauthorized");
    }

    // Get user info
    const user = await ctx.db.get(asset.uploadedBy);

    return {
      ...asset,
      uploadedByUser: user
        ? {
            _id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
          }
        : null,
    };
  },
});

// Update asset
export const updateAsset = mutation({
  args: {
    token: v.string(),
    assetId: v.id("assets"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("branding"),
        v.literal("ui-design"),
        v.literal("mockups"),
        v.literal("documentation"),
        v.literal("inspiration"),
        v.literal("code-snippets"),
        v.literal("presentations"),
        v.literal("tutorials"),
        v.literal("other")
      )
    ),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const asset = await ctx.db.get(args.assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    if (asset.organizationId !== session.activeOrganizationId) {
      throw new Error("Unauthorized");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.category !== undefined) updates.category = args.category;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

    await ctx.db.patch(args.assetId, updates);

    // Track activity
    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Updated asset "${asset.name}"`,
      description: `Asset details modified`,
      activity: "updated",
      entityType: "project",
      entityId: asset.projectId.toString(),
      entityName: asset.name,
      projectId: asset.projectId,
    });

    return args.assetId;
  },
});

// Delete asset
export const deleteAsset = mutation({
  args: {
    token: v.string(),
    assetId: v.id("assets"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const asset = await ctx.db.get(args.assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    if (asset.organizationId !== session.activeOrganizationId) {
      throw new Error("Unauthorized");
    }

    // Delete the file from storage if it exists
    if (asset.storageId) {
      await ctx.storage.delete(asset.storageId);
    }

    await ctx.db.delete(args.assetId);

    // Track activity
    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Deleted asset "${asset.name}"`,
      description: `Asset removed from project`,
      activity: "deleted",
      entityType: "project",
      entityId: asset.projectId.toString(),
      entityName: asset.name,
      projectId: asset.projectId,
    });

    return args.assetId;
  },
});

// Increment view count
export const incrementViewCount = mutation({
  args: {
    token: v.string(),
    assetId: v.id("assets"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const asset = await ctx.db.get(args.assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    await ctx.db.patch(args.assetId, {
      viewCount: (asset.viewCount || 0) + 1,
    });

    return args.assetId;
  },
});

// Get asset download URL
export const getAssetDownloadUrl = mutation({
  args: {
    token: v.string(),
    assetId: v.id("assets"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const asset = await ctx.db.get(args.assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    if (asset.organizationId !== session.activeOrganizationId) {
      throw new Error("Unauthorized");
    }

    if (!asset.storageId) {
      throw new Error("Asset is not a file");
    }

    // Increment download count
    await ctx.db.patch(args.assetId, {
      downloadCount: (asset.downloadCount || 0) + 1,
    });

    return await ctx.storage.getUrl(asset.storageId);
  },
});
