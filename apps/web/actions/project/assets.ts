"use server";

import { prisma, AssetTypeType, AssetCategoryType } from "@workspace/backend";
import { getSession } from "../account/user";

// Asset type for client and server - matches the actual Prisma schema
export type Asset = {
  id: string;
  name: string;
  description: string | null;
  type: AssetTypeType;
  projectId: string;
  organizationId: string;
  storageId: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  url: string | null;
  linkType: string | null;
  tags: string[];
  category: AssetCategoryType | null;
  thumbnailUrl: string | null;
  isPublic: boolean | null;
  uploadedById: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Get all assets for a project, with optional type and category filters
export async function getProjectAssets({
  projectId,
  type,
  category,
}: {
  projectId: string;
  type?: AssetTypeType;
  category?: AssetCategoryType;
}): Promise<Asset[]> {
  const where: any = { projectId };
  if (type) where.type = type;
  if (category) where.category = category;
  const assets = await prisma.asset.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  // Convert tags from JSON to string[] if needed
  return assets.map((a) => ({
    ...a,
    tags: a.tags || [],
  }));
}

// Delete an asset by ID
export async function deleteAsset({
  assetId,
}: {
  assetId: string;
}): Promise<void> {
  await prisma.asset.delete({ where: { id: assetId } });
}

// Increment view count for an asset by creating a new AssetView record
export async function incrementViewCount({
  assetId,
  userId,
  ipAddress,
  userAgent,
}: {
  assetId: string;
  userId?: string;
  ipAddress: string;
  userAgent?: string;
}): Promise<void> {
  // Get the asset to get the organizationId
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { organizationId: true },
  });

  if (!asset) return;

  await prisma.assetView.create({
    data: {
      assetId,
      organizationId: asset.organizationId,
      userId,
      ipAddress,
      userAgent,
    },
  });
}

// Get download URL for an asset
export async function getAssetDownloadUrl({
  assetId,
}: {
  assetId: string;
}): Promise<string | null> {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { storageId: true, fileName: true, url: true },
  });

  if (!asset) return null;

  // If it's a link asset, return the URL
  if (asset.url) return asset.url;

  // For file assets, return the storage URL
  if (asset.storageId) {
    return `/api/storage/${asset.storageId}`;
  }

  return null;
}

// Update an asset
export async function updateAsset({
  assetId,
  name,
  description,
  category,
  tags,
}: {
  assetId: string;
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
}): Promise<Asset> {
  const asset = await prisma.asset.update({
    where: { id: assetId },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(category && { category: category as AssetCategoryType }),
      ...(tags && { tags }),
    },
  });

  return {
    ...asset,
    tags: asset.tags || [],
  };
}

// Create a new file asset
export async function createFileAsset({
  projectId,
  name,
  description,
  url,
  fileName,
  fileSize,
  mimeType,
  type,
  category,
  tags,
}: {
  projectId: string;
  name: string;
  description?: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  type: AssetTypeType;
  category?: string;
  tags?: string[];
}): Promise<Asset> {
  const { userId, org } = await getSession();

  const asset = await prisma.asset.create({
    data: {
      name,
      description,
      type,
      projectId,
      organizationId: org,
      url,
      fileName,
      fileSize,
      mimeType,
      category: category as AssetCategoryType,
      tags: tags || [],
      uploadedById: userId,
    },
  });

  return {
    ...asset,
    tags: asset.tags || [],
  };
}

// Create a new link asset
export async function createLinkAsset({
  projectId,
  name,
  description,
  url,
  linkType,
  category,
  tags,
}: {
  projectId: string;
  name: string;
  description?: string;
  url: string;
  linkType: string;
  category?: string;
  tags?: string[];
}): Promise<Asset> {
  const { userId, org } = await getSession();

  const asset = await prisma.asset.create({
    data: {
      name,
      description,
      type: "link" as AssetTypeType,
      projectId,
      organizationId: org,
      url,
      linkType: linkType as any,
      category: category as AssetCategoryType,
      tags: tags || [],
      uploadedById: userId,
    },
  });

  return {
    ...asset,
    tags: asset.tags || [],
  };
}

// Get view count for an asset
export async function getAssetViewCount({
  assetId,
}: {
  assetId: string;
}): Promise<number> {
  const count = await prisma.assetView.count({
    where: { assetId },
  });
  return count;
}

// Get download count for an asset
export async function getAssetDownloadCount({
  assetId,
}: {
  assetId: string;
}): Promise<number> {
  const count = await prisma.assetDownload.count({
    where: { assetId },
  });
  return count;
}

// Record an asset download
export async function recordAssetDownload({
  assetId,
  userId,
  ipAddress,
  userAgent,
}: {
  assetId: string;
  userId?: string;
  ipAddress: string;
  userAgent?: string;
}): Promise<void> {
  // Get the asset to get the organizationId
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { organizationId: true },
  });

  if (!asset) return;

  await prisma.assetDownload.create({
    data: {
      assetId,
      organizationId: asset.organizationId,
      userId,
      ipAddress,
      userAgent,
    },
  });
}
