"use server";
import { prisma } from "@workspace/backend";
import { verifyApiKey } from "@/lib/api-key-utils";
import { headers } from "next/headers";

/**
 * Authenticate an API request using an API key
 */
export async function authenticateApiKey(apiKey: string) {
  try {
    // Hash the provided API key
    const { hashApiKey } = await import("@/lib/api-key-utils");
    const providedHash = hashApiKey(apiKey);

    // Find the API key by its hash
    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: {
        keyHash: providedHash,
      },
      include: {
        organization: true,
      },
    });

    if (!apiKeyRecord) {
      return {
        success: false,
        error: "Invalid API key",
      };
    }

    // Check if the API key is active
    if (!apiKeyRecord.isActive) {
      return {
        success: false,
        error: "API key is inactive",
      };
    }

    // Check if the API key has expired
    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
      return {
        success: false,
        error: "API key has expired",
      };
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: {
        id: apiKeyRecord.id,
      },
      data: {
        lastUsed: new Date(),
      },
    });

    return {
      success: true,
      apiKey: apiKeyRecord,
      organization: apiKeyRecord.organization,
    };
  } catch (error) {
    return {
      success: false,
      error: "Authentication failed",
    };
  }
}

/**
 * Extract API key from Authorization header
 */
export function extractApiKeyFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader) return null;

  // Handle "Bearer <token>" format
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Handle "ApiKey <token>" format
  if (authHeader.startsWith("ApiKey ")) {
    return authHeader.substring(7);
  }

  // Handle plain token
  return authHeader;
}

/**
 * Middleware function to authenticate API requests
 */
export async function authenticateApiRequest() {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  const apiKey = extractApiKeyFromHeader(authHeader);

  if (!apiKey) {
    throw new Error("No API key provided");
  }

  const authResult = await authenticateApiKey(apiKey);

  if (!authResult.success) {
    throw new Error(authResult.error);
  }

  return authResult;
}
