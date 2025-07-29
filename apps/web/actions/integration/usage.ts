"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";
import { Zod } from "@workspace/backend";

export type IntegrationUsageData = {
  integrationId: string;
  entityType: string;
  entityId: string;
  purpose: string;
  isActive?: boolean;
};

export type IntegrationUsageResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Link an integration to an entity for a specific purpose
 */
export const createIntegrationUsage = async (
  data: IntegrationUsageData
): Promise<IntegrationUsageResponse> => {
  const session = await getSession();
  try {
    // Verify the integration belongs to the org
    const integration = await prisma.integration.findFirst({
      where: { id: data.integrationId, organizationId: session.org },
    });
    if (!integration) {
      return {
        success: false,
        error: "Integration not found or not in your organization",
      };
    }

    // Check if usage already exists
    const existingUsage = await prisma.integrationUsage.findFirst({
      where: {
        integrationId: data.integrationId,
        entityType: data.entityType,
        entityId: data.entityId,
        purpose: data.purpose,
      },
    });

    if (existingUsage) {
      return {
        success: false,
        error: "Integration usage already exists for this entity and purpose",
      };
    }

    const usage = await prisma.integrationUsage.create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
      },
      include: { integration: true },
    });

    return { success: true, data: usage };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

/**
 * Get integration usage by entity and purpose
 */
export const getIntegrationUsage = async (
  entityType: string,
  entityId: string,
  purpose: string
): Promise<IntegrationUsageResponse> => {
  const session = await getSession();
  try {
    const usage = await prisma.integrationUsage.findFirst({
      where: {
        entityType,
        entityId,
        purpose,
        integration: { organizationId: session.org },
      },
      include: { integration: true },
    });
    return { success: true, data: usage };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

/**
 * Get all integration usages for an entity
 */
export const getEntityIntegrationUsages = async (
  entityType: string,
  entityId: string
): Promise<IntegrationUsageResponse> => {
  const session = await getSession();
  try {
    const usages = await prisma.integrationUsage.findMany({
      where: {
        entityType,
        entityId,
        integration: { organizationId: session.org },
      },
      include: { integration: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: usages };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

/**
 * Get all integrations available for a specific purpose
 */
export const getIntegrationsForPurpose = async (
  purpose: string
): Promise<IntegrationUsageResponse> => {
  const session = await getSession();
  try {
    const integrationType = getIntegrationTypeForPurpose(purpose);
    if (!integrationType) {
      return {
        success: false,
        error: `No integration type found for purpose: ${purpose}`,
      };
    }

    const integrations = await prisma.integration.findMany({
      where: {
        organizationId: session.org,
        isActive: true,
        type: integrationType,
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: integrations };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

/**
 * Update integration usage
 */
export const updateIntegrationUsage = async (
  id: string,
  data: Partial<{ isActive: boolean }>
): Promise<IntegrationUsageResponse> => {
  const session = await getSession();
  try {
    const usage = await prisma.integrationUsage.update({
      where: {
        id,
        integration: { organizationId: session.org },
      },
      data,
      include: { integration: true },
    });
    return { success: true, data: usage };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

/**
 * Delete integration usage
 */
export const deleteIntegrationUsage = async (
  id: string
): Promise<IntegrationUsageResponse> => {
  const session = await getSession();
  try {
    await prisma.integrationUsage.delete({
      where: {
        id,
        integration: { organizationId: session.org },
      },
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

/**
 * Helper function to map purpose to integration type
 */
function getIntegrationTypeForPurpose(
  purpose: string
): Zod.IntegrationTypeType | undefined {
  const purposeToTypeMap: Record<string, Zod.IntegrationTypeType> = {
    email_sync: "RESEND",
    code_sync: "GITHUB",
    analytics: "RESEND", // Using RESEND as placeholder until POSTHOG is added
    webhook: "RESEND", // Using RESEND as placeholder until WEBHOOK is added
    payment: "RESEND", // Using RESEND as placeholder until STRIPE is added
  };
  return purposeToTypeMap[purpose];
}
