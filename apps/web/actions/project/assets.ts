'use server'

import { prisma, AssetTypeType, AssetCategoryType } from "@workspace/backend";

// Asset type for client and server
export type Asset = {
    id: string;
    name: string;
    description?: string;
    type: AssetTypeType;
    projectId: string;
    organizationId: string;
    storageId?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    url?: string;
    linkType?: string;
    tags?: string[];
    category?: AssetCategoryType;
    thumbnailUrl?: string;
    isPublic?: boolean;
    uploadedById?: string;
    createdAt: Date;
    updatedAt: Date;
    viewCount?: number;
    downloadCount?: number;
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
        tags: Array.isArray(a.tags) ? a.tags : (a.tags ? JSON.parse(a.tags as any) : []),
    }));
}

// Delete an asset by ID
export async function deleteAsset({ assetId }: { assetId: string }): Promise<void> {
    await prisma.asset.delete({ where: { id: assetId } });
}