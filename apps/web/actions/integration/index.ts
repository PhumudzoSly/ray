"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export type IntegrationConfig = {
  apiKey: string;
  listId?: string;
  audienceId?: string;
  // GitHub-specific fields
  repositories?: string[];
  webhookUrl?: string;
  [key: string]: any;
};

/**
 * Create a new integration
 */
export const createIntegration = async (data: {
  name: string;
  type: "RESEND" | "LOOPS" | "SENDGRID" | "MAILCHIMP" | "CONVERTKIT" | "GITHUB";
  config: IntegrationConfig;
}) => {
  const { org, userId } = await getSession();
  try {
    const integration = await prisma.integration.create({
      data: {
        ...data,
        organizationId: org,
        createdById: userId,
      },
    });
    return { success: true, data: integration };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Get an integration by ID (scoped to org)
 */
export const getIntegration = async (id: string) => {
  const { org } = await getSession();
  try {
    const integration = await prisma.integration.findFirst({
      where: { id, organizationId: org },
    });
    return { success: true, data: integration };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * List all integrations for the current org
 */
export const getAllIntegrations = async () => {
  const { org } = await getSession();
  try {
    const integrations = await prisma.integration.findMany({
      where: { organizationId: org },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: integrations };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Update an integration (scoped to org)
 */
export const updateIntegration = async (
  id: string,
  data: Partial<{
    name: string;
    config: IntegrationConfig;
    isActive: boolean;
  }>
) => {
  const { org } = await getSession();
  try {
    const integration = await prisma.integration.update({
      where: { id, organizationId: org },
      data,
    });
    return { success: true, data: integration };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Delete an integration (scoped to org)
 */
export const deleteIntegration = async (id: string) => {
  const { org } = await getSession();
  try {
    // Check if integration is being used by any waitlists
    const waitlistsUsingIntegration = await prisma.integrationUsage.count({
      where: {
        integrationId: id,
        entityType: "waitlist",
        integration: { organizationId: org },
      },
    });

    if (waitlistsUsingIntegration > 0) {
      return {
        success: false,
        error: "Cannot delete integration that is being used by waitlists",
      };
    }

    await prisma.integration.delete({ where: { id, organizationId: org } });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Get integrations by type (scoped to org)
 */
export const getIntegrationsByType = async (type: string) => {
  const { org } = await getSession();
  try {
    const integrations = await prisma.integration.findMany({
      where: { organizationId: org, type: type as any },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: integrations };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Get integrations by purpose (scoped to org)
 * This is useful for filtering integrations by their intended use case
 */
export const getIntegrationsByPurpose = async (purpose: string) => {
  const { org } = await getSession();
  try {
    // For email_sync purpose, we want email-related integrations

    const integrations = await prisma.integration.findMany({
      where: {
        organizationId: org,
        type: {
          in:
            purpose === "email_sync"
              ? ["RESEND", "LOOPS", "SENDGRID", "MAILCHIMP", "CONVERTKIT"]
              : purpose === "code_sync"
              ? ["GITHUB"]
              : ["RESEND", "LOOPS", "SENDGRID", "MAILCHIMP", "CONVERTKIT", "GITHUB"],
        },
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        type: true,
        isActive: true,
        createdAt: true,
      },
    });
    return { success: true, data: integrations };
  } catch (error) {
    return { success: false, error };
  }
};
