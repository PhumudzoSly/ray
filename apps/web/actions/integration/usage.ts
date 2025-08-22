"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";
import { getLoopsIntegrationById } from "./loops-actions";
import { getResendIntegrationById } from "./resend-actions";

/**
 * Get integration usage for a specific entity and purpose
 * Primarily uses Redis-based integrations for email sync
 */
export const getIntegrationUsage = async (
  entityType: string,
  entityId: string,
  purpose: string
) => {
  const { org } = await getSession();
  try {
    // For email sync, check Redis-based integrations first
    if (entityType === "waitlist" && purpose === "email_sync") {
      try {
        // Try to get Loops integrations first
        const loopsIntegrations = await import("./loops-actions").then((m) =>
          m.getLoopsIntegrations()
        );
        if (loopsIntegrations.length > 0 && loopsIntegrations[0]) {
          // Return a usage object for the first active Loops integration
          const firstLoops = loopsIntegrations[0];
          const loopsIntegration = await getLoopsIntegrationById(firstLoops.id);
          return {
            success: true,
            data: {
              id: `redis-loops-${firstLoops.id}`,
              integrationId: firstLoops.id,
              entityType,
              entityId,
              purpose,
              isActive: firstLoops.isActive,
              integration: {
                id: firstLoops.id,
                name: firstLoops.name,
                type: "LOOPS",
                config: loopsIntegration.config,
                isActive: firstLoops.isActive,
                organizationId: org,
              },
            },
          };
        }

        // Try Resend integrations
        const resendIntegrations = await import("./resend-actions").then((m) =>
          m.getResendIntegrations()
        );
        if (resendIntegrations.length > 0 && resendIntegrations[0]) {
          // Return a usage object for the first active Resend integration
          const firstResend = resendIntegrations[0];
          const resendIntegration = await getResendIntegrationById(
            firstResend.id
          );
          return {
            success: true,
            data: {
              id: `redis-resend-${firstResend.id}`,
              integrationId: firstResend.id,
              entityType,
              entityId,
              purpose,
              isActive: firstResend.isActive,
              integration: {
                id: firstResend.id,
                name: firstResend.name,
                type: "RESEND",
                config: resendIntegration.config,
                isActive: firstResend.isActive,
                organizationId: org,
              },
            },
          };
        }
      } catch (redisError) {
        console.error("Error checking Redis integrations:", redisError);
      }
    }

    // Fallback to database-based integrations for other purposes
    const usage = await prisma.integrationUsage.findFirst({
      where: {
        entityType,
        entityId,
        purpose,
        integration: {
          organizationId: org,
        },
      },
      include: {
        integration: true,
      },
    });

    if (usage) {
      return { success: true, data: usage };
    }

    return { success: true, data: null };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Create a new integration usage
 */
export const createIntegrationUsage = async (data: {
  integrationId: string;
  entityType: string;
  entityId: string;
  purpose: string;
  isActive?: boolean;
}) => {
  const { org } = await getSession();
  try {
    // Ensure the integration belongs to the org
    const integration = await prisma.integration.findFirst({
      where: { id: data.integrationId, organizationId: org },
    });
    if (!integration) {
      return {
        success: false,
        error: "Integration not found or not in your organization",
      };
    }

    const usage = await prisma.integrationUsage.create({
      data: {
        integrationId: data.integrationId,
        entityType: data.entityType,
        entityId: data.entityId,
        purpose: data.purpose,
        isActive: data.isActive ?? true,
      },
      include: {
        integration: true,
      },
    });
    return { success: true, data: usage };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Update integration usage
 */
export const updateIntegrationUsage = async (
  id: string,
  data: Partial<{
    isActive: boolean;
  }>
) => {
  const { org } = await getSession();
  try {
    // Ensure the usage belongs to an integration in the org
    const usage = await prisma.integrationUsage.findFirst({
      where: {
        id,
        integration: {
          organizationId: org,
        },
      },
    });
    if (!usage) {
      return {
        success: false,
        error: "Integration usage not found or not in your organization",
      };
    }

    const updated = await prisma.integrationUsage.update({
      where: { id },
      data,
      include: {
        integration: true,
      },
    });
    return { success: true, data: updated };
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
    // Ensure the usage belongs to an integration in the org
    const usage = await prisma.integrationUsage.findFirst({
      where: {
        id,
        integration: {
          organizationId: org,
        },
      },
    });
    if (!usage) {
      return {
        success: false,
        error: "Integration usage not found or not in your organization",
      };
    }

    await prisma.integrationUsage.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Get all integrations for a specific purpose
 * Prioritizes Redis-based integrations for email sync
 */
export const getIntegrationsForPurpose = async (purpose: string) => {
  const { org } = await getSession();
  try {
    // For email_sync, prioritize Redis-based integrations
    if (purpose === "email_sync") {
      const redisIntegrations = [];

      try {
        // Get Loops integrations
        const loopsIntegrations = await import("./loops-actions").then((m) =>
          m.getLoopsIntegrations()
        );
        for (const loops of loopsIntegrations) {
          if (loops.isActive) {
            const fullLoops = await getLoopsIntegrationById(loops.id);
            redisIntegrations.push({
              id: loops.id,
              name: loops.name,
              type: "LOOPS",
              config: fullLoops.config,
              isActive: loops.isActive,
              organizationId: org,
              createdAt: new Date(loops.createdAt),
              updatedAt: new Date(loops.updatedAt),
              usages: [],
            });
          }
        }

        // Get Resend integrations
        const resendIntegrations = await import("./resend-actions").then((m) =>
          m.getResendIntegrations()
        );
        for (const resend of resendIntegrations) {
          if (resend.isActive) {
            const fullResend = await getResendIntegrationById(resend.id);
            redisIntegrations.push({
              id: resend.id,
              name: resend.name,
              type: "RESEND",
              config: fullResend.config,
              isActive: resend.isActive,
              organizationId: org,
              createdAt: new Date(resend.createdAt),
              updatedAt: new Date(resend.updatedAt),
              usages: [],
            });
          }
        }
      } catch (redisError) {
        console.error("Error fetching Redis integrations:", redisError);
      }

      // If we have Redis integrations, return them
      if (redisIntegrations.length > 0) {
        return { success: true, data: redisIntegrations };
      }
    }

    // Fallback to database-based integrations
    const integrations = await prisma.integration.findMany({
      where: {
        organizationId: org,
        isActive: true,
        usages: {
          some: {
            purpose,
            isActive: true,
          },
        },
      },
      include: {
        usages: {
          where: {
            purpose,
            isActive: true,
          },
        },
      },
    });

    return { success: true, data: integrations };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Get the active email integration for a specific waitlist
 * This is a convenience function that returns the first active email integration
 */
export const getWaitlistEmailIntegration = async (waitlistId: string) => {
  const { org } = await getSession();
  try {
    // First check if there's a specific integration usage for this waitlist
    const usage = await getIntegrationUsage(
      "waitlist",
      waitlistId,
      "email_sync"
    );
    if (usage.success && usage.data) {
      return usage;
    }

    // If no specific usage, get the first available email integration
    const integrations = await getIntegrationsForPurpose("email_sync");
    if (
      integrations.success &&
      integrations.data &&
      integrations.data.length > 0 &&
      integrations.data[0]
    ) {
      const firstIntegration = integrations.data[0];
      return {
        success: true,
        data: {
          id: `auto-${firstIntegration.id}`,
          integrationId: firstIntegration.id,
          entityType: "waitlist",
          entityId: waitlistId,
          purpose: "email_sync",
          isActive: firstIntegration.isActive,
          integration: firstIntegration,
        },
      };
    }

    return { success: true, data: null };
  } catch (error) {
    return { success: false, error };
  }
};
