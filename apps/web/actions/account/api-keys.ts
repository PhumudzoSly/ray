"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

/**
 * Create a new API key
 */
export const createApiKey = async (data: {
  name: string;
  keyHash: string;
  keyPreview: string;
  isActive: boolean;
  expiresAt?: Date;
}) => {
  const { org, userId } = await getSession();
  try {
    const apiKey = await prisma.apiKey.create({
      data: {
        ...data,
        organizationId: org,
        createdBy: userId,
        createdAt: new Date(),
      },
    });
    return { success: true, data: apiKey };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Get an API key by ID (scoped to org)
 */
export const getApiKey = async (id: string) => {
  const { org } = await getSession();
  try {
    const apiKey = await prisma.apiKey.findFirst({
      where: { id, organizationId: org },
    });
    return { success: true, data: apiKey };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * List all API keys for the current org
 */
export const getAllApiKeys = async () => {
  const { org } = await getSession();
  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: { organizationId: org },
    });
    return { success: true, data: apiKeys };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Update an API key (scoped to org)
 */
export const updateApiKey = async (
  id: string,
  data: Partial<{
    name?: string;
    permissions?: any;
    isActive?: boolean;
    expiresAt?: Date;
  }>
) => {
  const { org } = await getSession();
  try {
    const apiKey = await prisma.apiKey.update({
      where: { id, organizationId: org },
      data,
    });
    return { success: true, data: apiKey };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Delete an API key (scoped to org)
 */
export const deleteApiKey = async (id: string) => {
  const { org } = await getSession();
  try {
    await prisma.apiKey.delete({ where: { id, organizationId: org } });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};
