"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

/**
 * Create a new asset
 */
export const createAsset = async (data: { name: string; type: string; projectId: string; description?: string; storageId?: string; fileName?: string; fileSize?: number; mimeType?: string; url?: string; linkType?: string; tags?: any; category?: string; thumbnailUrl?: string; isPublic?: boolean; }) => {
    const { org, userId } = await getSession();
    try {
        const asset = await prisma.asset.create({
            data: {
                ...data,
                organizationId: org,
                uploadedById: userId,
            },
        });
        return { success: true, data: asset };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get an asset by ID (scoped to org)
 */
export const getAsset = async (id: string) => {
    const { org } = await getSession();
    try {
        const asset = await prisma.asset.findFirst({ where: { id, organizationId: org } });
        return { success: true, data: asset };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * List all assets for the current org
 */
export const getAllAssets = async () => {
    const { org } = await getSession();
    try {
        const assets = await prisma.asset.findMany({ where: { organizationId: org } });
        return { success: true, data: assets };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Update an asset (scoped to org)
 */
export const updateAsset = async (id: string, data: Partial<{ name?: string; type?: string; description?: string; storageId?: string; fileName?: string; fileSize?: number; mimeType?: string; url?: string; linkType?: string; tags?: any; category?: string; thumbnailUrl?: string; isPublic?: boolean; }>) => {
    const { org } = await getSession();
    try {
        const asset = await prisma.asset.update({ where: { id, organizationId: org }, data });
        return { success: true, data: asset };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Delete an asset (scoped to org)
 */
export const deleteAsset = async (id: string) => {
    const { org } = await getSession();
    try {
        await prisma.asset.delete({ where: { id, organizationId: org } });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}; 