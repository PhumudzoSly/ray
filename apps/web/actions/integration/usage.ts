"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export type IntegrationUsageData = {
    integrationId: string;
    entityType: string;
    entityId: string;
    purpose: string;
    isActive?: boolean;
};

/**
 * Link an integration to an entity for a specific purpose
 */
export const createIntegrationUsage = async (data: IntegrationUsageData) => {
    const { org } = await getSession();
    try {
        // Verify the integration belongs to the org
        const integration = await prisma.integration.findFirst({
            where: { id: data.integrationId, organizationId: org },
        });
        if (!integration) {
            return { success: false, error: "Integration not found or not in your organization" };
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
            return { success: false, error: "Integration usage already exists for this entity and purpose" };
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
        return { success: false, error };
    }
};

/**
 * Get integration usage by entity and purpose
 */
export const getIntegrationUsage = async (entityType: string, entityId: string, purpose: string) => {
    const { org } = await getSession();
    try {
        const usage = await prisma.integrationUsage.findFirst({
            where: {
                entityType,
                entityId,
                purpose,
                integration: { organizationId: org },
            },
            include: { integration: true },
        });
        return { success: true, data: usage };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get all integration usages for an entity
 */
export const getEntityIntegrationUsages = async (entityType: string, entityId: string) => {
    const { org } = await getSession();
    try {
        const usages = await prisma.integrationUsage.findMany({
            where: {
                entityType,
                entityId,
                integration: { organizationId: org },
            },
            include: { integration: true },
            orderBy: { createdAt: "desc" },
        });
        return { success: true, data: usages };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get all integrations available for a specific purpose
 */
export const getIntegrationsForPurpose = async (purpose: string) => {
    const { org } = await getSession();
    try {
        const integrations = await prisma.integration.findMany({
            where: {
                organizationId: org,
                isActive: true,
                type: getIntegrationTypeForPurpose(purpose),
            },
            orderBy: { createdAt: "desc" },
        });
        return { success: true, data: integrations };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Update integration usage
 */
export const updateIntegrationUsage = async (
    id: string,
    data: Partial<{ isActive: boolean }>
) => {
    const { org } = await getSession();
    try {
        const usage = await prisma.integrationUsage.update({
            where: {
                id,
                integration: { organizationId: org },
            },
            data,
            include: { integration: true },
        });
        return { success: true, data: usage };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Delete integration usage
 */
export const deleteIntegrationUsage = async (id: string) => {
    const { org } = await getSession();
    try {
        await prisma.integrationUsage.delete({
            where: {
                id,
                integration: { organizationId: org },
            },
        });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Helper function to map purpose to integration type
 */
function getIntegrationTypeForPurpose(purpose: string): string | undefined {
    const purposeToTypeMap: Record<string, string> = {
        email_sync: "RESEND",
        analytics: "POSTHOG", // Future
        webhook: "WEBHOOK", // Future
        payment: "STRIPE", // Future
    };
    return purposeToTypeMap[purpose];
}

/**
 * Get all available purposes for integrations
 */
export const getAvailablePurposes = () => {
    return [
        { value: "email_sync", label: "Email Sync", description: "Sync data to email platforms" },
        { value: "analytics", label: "Analytics", description: "Send data to analytics platforms" },
        { value: "webhook", label: "Webhook", description: "Send webhooks to external services" },
        { value: "payment", label: "Payment", description: "Process payments" },
    ];
}; 