"use server";
import { prisma } from "@workspace/backend";
import { hashApiKey, verifyApiKey } from "@/lib/api-key-utils";
import { headers } from "next/headers";
import { getPublicSubscription } from "./subscription";
import { dodoPayments } from "@/lib/auth";
import { redis } from "@/lib/redis";

const CACHE_TTL = 300; // 5 minutes in seconds

async function getCachedSubscription(organizationId: string) {
  try {
    // Try to get from cache first
    const cached = await redis.get(`subscription:${organizationId}`);
    if (cached) {
      return cached as any;
    }

    // If not in cache, fetch from database
    const subscription = await getPublicSubscription(organizationId);

    if (subscription) {
      // Cache the subscription with TTL
      await redis.setex(
        `subscription:${organizationId}`,
        CACHE_TTL,
        subscription
      );
    }

    return subscription;
  } catch (error) {
    // If Redis fails, fallback to direct database call
    console.warn("Redis cache failed, falling back to database:", error);
    return getPublicSubscription(organizationId);
  }
}

/**
 * Invalidate subscription cache for an organization
 * Call this when subscription data changes
 */

export async function invalidateSubscriptionCache(organizationId: string) {
  try {
    await redis.del(`subscription:${organizationId}`);
  } catch (error) {
    console.warn("Failed to invalidate subscription cache:", error);
  }
}

/**
 * Record an API call (direct write for Vercel compatibility)
 */
export async function recordApiCall(data: {
  apiKeyId: string;
  organizationId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime?: number;
  userAgent?: string;
  ipAddress?: string;
}) {
  try {
    await prisma.apiCall.create({
      data,
    });
  } catch (error) {
    // Log error but don't fail the request
    console.error("Failed to record API call:", error);
  }
}

/**
 * Record an API call using authentication result
 */
export async function recordApiCallFromAuth(
  authResult: { apiKey: { id: string; organizationId: string } },
  data: {
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime?: number;
    userAgent?: string;
    ipAddress?: string;
  }
) {
  return recordApiCall({
    apiKeyId: authResult.apiKey.id,
    organizationId: authResult.apiKey.organizationId,
    ...data,
  });
}

/**
 * Authenticate an API request using an API key and optionally record the API call
 */
export async function authenticateApiKey(
  apiKey: string,
  options?: {
    recordCall?: boolean;
    endpoint?: string;
    method?: string;
    statusCode?: number;
    responseTime?: number;
    userAgent?: string;
    ipAddress?: string;
  }
) {
  try {
    // Hash the provided API key
    const providedHash = hashApiKey(apiKey);

    // Find the API key by its hash
    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: {
        keyHash: providedHash,
      },
      select: {
        id: true,
        isActive: true,
        expiresAt: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
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

    // Update last used timestamp and optionally record API call in a transaction
    if (
      options?.recordCall &&
      options.endpoint &&
      options.method &&
      options.statusCode
    ) {
      const subscription = await getCachedSubscription(
        apiKeyRecord.organizationId
      );

      if (!subscription) {
        return {
          success: false,
          error: "Subscription not found",
        };
      }

      if (subscription.status !== "active") {
        return {
          success: false,
          error: "Subscription is not active",
        };
      }

      await Promise.allSettled([
        // Update database in transaction
        prisma.$transaction([
          // Update last used timestamp
          prisma.apiKey.update({
            where: {
              id: apiKeyRecord.id,
            },
            data: {
              lastUsed: new Date(),
            },
          }),
          // Record API call
          prisma.apiCall.create({
            data: {
              apiKeyId: apiKeyRecord.id,
              organizationId: apiKeyRecord.organizationId,
              endpoint: options.endpoint,
              method: options.method,
              statusCode: options.statusCode,
              responseTime: options.responseTime,
              userAgent: options.userAgent,
              ipAddress: options.ipAddress,
            },
          }),
        ]),
      ]);
    } else {
      // Just update last used timestamp
      await prisma.apiKey.update({
        where: {
          id: apiKeyRecord.id,
        },
        data: {
          lastUsed: new Date(),
        },
      });
    }

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
function extractApiKeyFromHeader(authHeader: string | null): string | null {
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
 * Extract client information from headers
 */
export async function extractClientInfo() {
  const headersList = await headers();
  return {
    userAgent: headersList.get("user-agent") || undefined,
    ipAddress:
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      headersList.get("cf-connecting-ip") ||
      undefined,
  };
}

/**
 * Middleware function to authenticate API requests
 */
export async function authenticateApiRequest(options?: {
  recordCall?: boolean;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ipAddress?: string;
}) {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  const apiKey = extractApiKeyFromHeader(authHeader);

  if (!apiKey) {
    throw new Error("No API key provided");
  }

  const authResult = await authenticateApiKey(apiKey, options);

  if (!authResult.success) {
    throw new Error(authResult.error);
  }

  return authResult;
}
