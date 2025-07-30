"use server";

import { getSession } from "./user";
import { auth, polarClient } from "@/lib/auth";
import { featureAccessConfig } from "@/lib/featureAccess";
import { prisma } from "@workspace/backend";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Feature, GeneralFeature } from "@/types/features";
import { redis } from "@/lib/redis";

const CACHE_TTL = 300; // 5 minutes in seconds

export async function getSubscription() {
  const { org } = await getSession();

  // Development-only: Check if subscription check should be bypassed
  if (process.env.NODE_ENV === "development") {
    return {
      id: "dev-subscription",
      status: "active",
      productId: process.env.POLAR_ENTERPRICE_PRICING!,
      priceId: "dev-price",
      customerId: "dev-customer",
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      endsAt: null,
      canceledAt: null,
      trialEndsAt: null,
    };
  }

  try {
    // Try to get from cache first
    const cached = await redis.get(`subscription:${org}`);
    if (cached) {
      return cached as any;
    }

    // If not in cache, fetch from database and Polar
    const subscription = await prisma.subscription.findUnique({
      where: {
        organisation_id: org,
      },
    });

    const sub = subscription?.subscription_id
      ? await polarClient.subscriptions.get({
          id: subscription.subscription_id!,
        })
      : await Promise.resolve(null);

    if (!sub || sub.status !== "active") redirect("/checkout");

    // Cache the subscription with TTL
    await redis.setex(`subscription:${org}`, CACHE_TTL, sub);

    return sub;
  } catch (error) {
    // If Redis fails, fallback to direct database call
    console.warn("Redis cache failed, falling back to database:", error);

    const subscription = await prisma.subscription.findUnique({
      where: {
        organisation_id: org,
      },
    });

    const sub = subscription?.subscription_id
      ? await polarClient.subscriptions.get({
          id: subscription.subscription_id!,
        })
      : await Promise.resolve(null);

    if (!sub || sub.status !== "active") redirect("/checkout");

    return sub;
  }
}

export async function checkFeatureAccess(feature: Feature): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_DEV_BYPASS_SUBSCRIPTION === "true") {
    return true; // Dev bypass grants access to all features
  }

  try {
    // Try to get from cache first
    const { org } = await getSession();
    const cached = await redis.get(`feature_access:${org}:${feature}`);
    if (cached !== null) {
      return cached as boolean;
    }

    const subscription = await getSubscription();
    if (!subscription) {
      return false; // or redirect, but getSubscription already redirects for no active sub
    }

    const allowedFeatures = featureAccessConfig[subscription.productId];
    const hasAccess = allowedFeatures
      ? allowedFeatures.includes(feature)
      : false;

    // Cache the feature access result
    await redis.setex(`feature_access:${org}:${feature}`, CACHE_TTL, hasAccess);

    return hasAccess;
  } catch (error) {
    // If Redis fails, fallback to direct check
    console.warn("Redis cache failed, falling back to direct check:", error);

    const subscription = await getSubscription();
    if (!subscription) {
      return false;
    }

    const allowedFeatures = featureAccessConfig[subscription.productId];
    return allowedFeatures ? allowedFeatures.includes(feature) : false;
  }
}

export async function getAllowedFeatures(): Promise<Feature[]> {
  try {
    // Try to get from cache first
    const { org } = await getSession();
    const cached = await redis.get(`allowed_features:${org}`);
    if (cached) {
      return cached as Feature[];
    }

    const subscription = await getSubscription();
    if (!subscription) return [];

    const allowedFeatures = featureAccessConfig[subscription.productId] || [];

    // Cache the allowed features list
    await redis.setex(`allowed_features:${org}`, CACHE_TTL, allowedFeatures);

    return allowedFeatures;
  } catch (error) {
    // If Redis fails, fallback to direct check
    console.warn("Redis cache failed, falling back to direct check:", error);

    const subscription = await getSubscription();
    if (!subscription) return [];

    const allowedFeatures = featureAccessConfig[subscription.productId];
    return allowedFeatures || [];
  }
}

/**
 * Gets subscription information for a specific organization without requiring a session
 * @param organizationId The ID of the organization to get subscription for
 * @returns The subscription object or null if not found/active
 */
export async function getPublicSubscription(organizationId: string) {
  // Development-only: Check if subscription check should be bypassed
  if (process.env.NEXT_PUBLIC_DEV_BYPASS_SUBSCRIPTION === "true") {
    return {
      id: "dev-subscription",
      status: "active",
      productId: process.env.POLAR_ENTERPRICE_PRICING!,
      priceId: "dev-price",
      customerId: "dev-customer",
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      endsAt: null,
      canceledAt: null,
      trialEndsAt: null,
    };
  }

  const subscription = await prisma.subscription.findUnique({
    where: {
      organisation_id: organizationId,
    },
  });

  const sub = subscription?.subscription_id
    ? await polarClient.subscriptions.get({
        id: subscription.subscription_id!,
      })
    : await Promise.resolve(null);

  if (!sub || sub.status !== "active") return null;

  return sub;
}

/**
 * Checks if an organization has access to a specific feature without requiring a session
 * @param organizationId The ID of the organization to check
 * @param feature The feature to check access for
 * @returns Boolean indicating whether the organization has access to the feature
 */
export async function checkPublicFeatureAccess(
  organizationId: string,
  feature: Feature
): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_DEV_BYPASS_SUBSCRIPTION === "true") {
    return true; // Dev bypass grants access to all features
  }

  try {
    // Try to get from cache first
    const cached = await redis.get(
      `public_feature_access:${organizationId}:${feature}`
    );
    if (cached !== null) {
      return cached as boolean;
    }

    const subscription = await getPublicSubscription(organizationId);
    if (!subscription) {
      return false;
    }

    const allowedFeatures = featureAccessConfig[subscription.productId];
    const hasAccess = allowedFeatures
      ? allowedFeatures.includes(feature)
      : false;

    // Cache the feature access result
    await redis.setex(
      `public_feature_access:${organizationId}:${feature}`,
      CACHE_TTL,
      hasAccess
    );

    return hasAccess;
  } catch (error) {
    // If Redis fails, fallback to direct check
    console.warn("Redis cache failed, falling back to direct check:", error);

    const subscription = await getPublicSubscription(organizationId);
    if (!subscription) {
      return false;
    }

    const allowedFeatures = featureAccessConfig[subscription.productId];
    return allowedFeatures ? allowedFeatures.includes(feature) : false;
  }
}

export async function generateCustomerURL() {
  // Get the current organization ID from the session

  const headersList = await headers();
  const sessionData = await auth.api.getSession({ headers: headersList });

  if (!sessionData?.session) {
    return null;
  }

  const { activeOrganizationId: org } = sessionData.session;

  if (!org) return null;

  // Look up the subscription record for this organization
  const subscription = await prisma.subscription.findFirst({
    where: {
      organisation_id: org,
    },
  });

  if (!subscription) return null;

  // Fetch the full subscription details from Polar
  const polarSubscription = await polarClient.subscriptions.get({
    id: subscription.subscription_id!, // Assert non-null since we found a subscription
  });

  if (!polarSubscription) return null;

  // Create a new customer portal session and get the access URL
  const portalSession = await polarClient.customerSessions.create({
    customerId: polarSubscription.customerId,
  });

  const url = portalSession.customerPortalUrl;

  return url;
}

/**
 * Invalidate all subscription-related caches for an organization
 * Call this when subscription data changes (status, plan, etc.)
 */
export async function invalidateSubscriptionCaches(organizationId: string) {
  try {
    // Get all features to invalidate feature access caches
    const allFeatures = Object.values(GeneralFeature);

    const keysToDelete = [
      `subscription:${organizationId}`,
      `allowed_features:${organizationId}`,
      ...allFeatures.map(
        (feature) => `feature_access:${organizationId}:${feature}`
      ),
      ...allFeatures.map(
        (feature) => `public_feature_access:${organizationId}:${feature}`
      ),
    ];

    // Delete all related cache keys
    await Promise.allSettled(keysToDelete.map((key) => redis.del(key)));
  } catch (error) {
    console.warn("Failed to invalidate subscription caches:", error);
  }
}

/**
 * Invalidate specific feature access cache
 */
export async function invalidateFeatureAccessCache(
  organizationId: string,
  feature?: Feature
) {
  try {
    if (feature) {
      // Invalidate specific feature
      await Promise.allSettled([
        redis.del(`feature_access:${organizationId}:${feature}`),
        redis.del(`public_feature_access:${organizationId}:${feature}`),
      ]);
    } else {
      // Invalidate all feature access caches for the organization
      const allFeatures = Object.values(GeneralFeature);
      const keysToDelete = [
        ...allFeatures.map((f) => `feature_access:${organizationId}:${f}`),
        ...allFeatures.map(
          (f) => `public_feature_access:${organizationId}:${f}`
        ),
      ];
      await Promise.allSettled(keysToDelete.map((key) => redis.del(key)));
    }
  } catch (error) {
    console.warn("Failed to invalidate feature access cache:", error);
  }
}
