"use server";

import { redis } from "@/lib/redis";
import { getSession } from "../account/user";
import { v4 as uuidv4 } from "uuid";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/crypto";

// Safe session getter that doesn't redirect
async function getSafeSession(): Promise<{ org: string }> {
  try {
    const headersList = await headers();
    const [data, member, activeOrg] = await Promise.all([
      auth.api.getSession({ headers: headersList }),
      auth.api.getActiveMember({ headers: headersList }),
      (async () => {
        const sessionData = await auth.api.getSession({ headers: headersList });
        if (!sessionData?.session.activeOrganizationId) return null;
        return auth.api.getFullOrganization({
          params: {
            id: sessionData.session.activeOrganizationId,
          },
          headers: headersList,
        });
      })(),
    ]);

    if (
      !data?.session ||
      !data.session.activeOrganizationId ||
      !activeOrg ||
      !member
    ) {
      throw new Error(
        "Authentication required. Please sign in and select an organization."
      );
    }

    return {
      org: data.session.activeOrganizationId,
    };
  } catch (error) {
    console.error("Error getting session:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Authentication failed");
  }
}

interface ResendIntegrationConfig {
  apiKey: string;
  name: string;
  audienceId?: string;
}

interface ResendIntegration {
  id: string;
  name: string;
  type: "RESEND";
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  config: {
    apiKey: string;
    audienceId?: string;
  };
}

// Redis key patterns - simplified structure
const getIntegrationsKey = (orgId: string, type: string) =>
  `integrations:${orgId}:${type.toLowerCase()}`;

// Helper function to safely parse Redis data
function parseIntegrationsData(data: string | null): ResendIntegration[] {
  if (!data) return [];

  try {
    // Handle case where data might already be an object
    if (typeof data === "object") {
      return Array.isArray(data) ? data : [];
    }

    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error parsing integrations data:", error, "Raw data:", data);
    return [];
  }
}

/**
 * Create a new Resend integration
 */
export async function createResendIntegration(data: {
  name: string;
  config: { apiKey: string; audienceId?: string };
}): Promise<ResendIntegration> {
  const { org } = await getSession();
  const now = new Date().toISOString();

  const integration: ResendIntegration = {
    id: uuidv4(),
    name: data.name,
    type: "RESEND",
    isActive: true,
    organizationId: org,
    createdAt: now,
    updatedAt: now,
    config: {
      apiKey: encrypt(data.config.apiKey),
      audienceId: data.config.audienceId,
    },
  };

  // Get existing integrations array
  const existingData = await redis.get(getIntegrationsKey(org, "RESEND"));
  const integrations = parseIntegrationsData(existingData as string);

  // Check if integration with same name already exists
  const existingIndex = integrations.findIndex((int) => int.name === data.name);
  if (existingIndex !== -1) {
    throw new Error("Integration with this name already exists");
  }

  // Add new integration
  integrations.push(integration);

  // Save back to Redis with 30 day expiry
  await redis.setex(
    getIntegrationsKey(org, "RESEND"),
    60 * 60 * 24 * 30,
    JSON.stringify(integrations)
  );

  return integration;
}

/**
 * Get all Resend integrations (without API keys for security)
 */
export async function getResendIntegrations(): Promise<
  Omit<ResendIntegration, "config">[]
> {
  const session = await getSafeSession();

  // Get integrations array from Redis
  const data = await redis.get(getIntegrationsKey(session.org, "RESEND"));
  const integrations = parseIntegrationsData(data as string);

  // Remove sensitive config data (API keys) before returning to client
  return integrations.map(({ config, ...integration }) => integration);
}

/**
 * Get a specific Resend integration by name
 */
export async function getResendIntegration(
  name: string
): Promise<ResendIntegration> {
  const { org } = await getSession();

  // Get integrations array from Redis
  const data = await redis.get(getIntegrationsKey(org, "RESEND"));
  const integrations = parseIntegrationsData(data as string);

  const integration = integrations.find((int) => int.name === name);

  if (!integration) {
    throw new Error("Resend integration not found");
  }

  // Decrypt the API key before returning
  return {
    ...integration,
    config: {
      ...integration.config,
      apiKey: decrypt(integration.config.apiKey),
    },
  };
}

/**
 * Delete a Resend integration by name
 */
export async function deleteResendIntegration(name: string): Promise<void> {
  const { org } = await getSession();

  // Get existing integrations array
  const existingData = await redis.get(getIntegrationsKey(org, "RESEND"));
  const integrations = parseIntegrationsData(existingData as string);

  const filteredIntegrations = integrations.filter((int) => int.name !== name);

  if (integrations.length === filteredIntegrations.length) {
    throw new Error("Resend integration not found");
  }

  // Save updated array back to Redis
  if (filteredIntegrations.length === 0) {
    // If no integrations left, delete the key
    await redis.del(getIntegrationsKey(org, "RESEND"));
  } else {
    await redis.setex(
      getIntegrationsKey(org, "RESEND"),
      60 * 60 * 24 * 30,
      JSON.stringify(filteredIntegrations)
    );
  }
}

/**
 * Get a specific Resend integration by ID with decrypted API key
 */
export async function getResendIntegrationById(
  id: string
): Promise<ResendIntegration> {
  const { org } = await getSession();

  // Get integrations array from Redis
  const data = await redis.get(getIntegrationsKey(org, "RESEND"));
  const integrations = parseIntegrationsData(data as string);

  const integration = integrations.find((int) => int.id === id);

  if (!integration) {
    throw new Error("Resend integration not found");
  }

  // Decrypt the API key before returning
  return {
    ...integration,
    config: {
      ...integration.config,
      apiKey: decrypt(integration.config.apiKey),
    },
  };
}

/**
 * Delete a Resend integration by ID
 */
export async function deleteResendIntegrationById(id: string): Promise<void> {
  const { org } = await getSession();

  // Get existing integrations array
  const existingData = (await redis.get(
    getIntegrationsKey(org, "RESEND")
  )) as string;
  const integrations = parseIntegrationsData(existingData as string);

  const filteredIntegrations = integrations.filter((int) => int.id !== id);

  if (integrations.length === filteredIntegrations.length) {
    throw new Error("Resend integration not found");
  }

  // Save updated array back to Redis
  if (filteredIntegrations.length === 0) {
    // If no integrations left, delete the key
    await redis.del(getIntegrationsKey(org, "RESEND"));
  } else {
    await redis.setex(
      getIntegrationsKey(org, "RESEND"),
      60 * 60 * 24 * 30,
      JSON.stringify(filteredIntegrations)
    );
  }
}
