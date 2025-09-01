"use server";

import { redis } from "@/lib/redis";
import { getSession } from "../account/user";
import { v4 as uuidv4 } from "uuid";
import { encrypt, decrypt } from "@/lib/crypto";

interface VercelIntegration {
  id: string;
  type: "VERCEL";
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  config: {
    apiKey: string;
  };
}

const getIntegrationKey = (orgId: string) => `integrations:${orgId}:vercel`;

/**
 * Create a new Vercel integration
 */

export async function createVercelIntegration(data: {
  config: { apiKey: string };
}): Promise<VercelIntegration> {
  const { org } = await getSession();
  const now = new Date().toISOString();

  const existingData = await redis.get(getIntegrationKey(org));
  if (existingData) {
    throw new Error(
      "A Vercel integration already exists for this organization."
    );
  }

  const integration: VercelIntegration = {
    id: uuidv4(),
    type: "VERCEL",
    isActive: true,
    organizationId: org,
    createdAt: now,
    updatedAt: now,
    config: {
      apiKey: encrypt(data.config.apiKey),
    },
  };

  await redis.setex(
    getIntegrationKey(org),
    60 * 60 * 24 * 30, // 30 day expiry
    JSON.stringify(integration)
  );

  return integration;
}

/**
 * Get the Vercel integration (without API key for security)
 */
export async function getVercelIntegration(): Promise<Omit<
  VercelIntegration,
  "config"
> | null> {
  const session = await getSession();

  const data = await redis.get(getIntegrationKey(session.org));

  console.log("VERCEL INTEGRATION", data);

  if (!data) {
    return null;
  }

  const integration = JSON.parse(JSON.stringify(data)) as VercelIntegration;

  // Remove sensitive config data before returning to client
  const { config, ...rest } = integration;
  return rest;
}

/**
 * Delete the Vercel integration
 */
export async function deleteVercelIntegration(id: string): Promise<void> {
  const { org } = await getSession();

  const data = await redis.get(getIntegrationKey(org));
  if (!data) {
    throw new Error("Vercel integration not found");
  }

  const integration = JSON.parse(JSON.stringify(data)) as VercelIntegration;

  if (integration.id !== id) {
    throw new Error("Integration ID mismatch.");
  }

  await redis.del(getIntegrationKey(org));
}

/**
 * Get the decrypted Vercel API key for server-side use
 * This should only be used in server components or server actions
 */
export async function getVercelApiKey(): Promise<string | null> {
  const session = await getSession();
  const data = await redis.get(getIntegrationKey(session.org));

  if (!data) {
    return null;
  }

  const integration = JSON.parse(JSON.stringify(data)) as VercelIntegration;
  return decrypt(integration.config.apiKey);
}
