"use server";

import { getSession } from "./user";
import { auth, dodoPayments } from "@/lib/auth";
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
  // if (process.env.NODE_ENV === "development") {
  //   return {
  //     id: "dev-subscription",
  //     status: "active",
  //     productId: process.env.DODO_ENTERPRISE_PLAN!,
  //     priceId: "dev-price",
  //     customerId: "dev-customer",
  //     metadata: {},
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //     endsAt: null,
  //     canceledAt: null,
  //     trialEndsAt: null,
  //   };
  // }

  try {
    // Try to get from cache first
    const cached = await redis.get(`subscription:${org}`);
    if (cached) {
      return cached as any;
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        organisation_id: org,
      },
    });

    const sub = subscription?.subscription_id
      ? await dodoPayments.subscriptions.retrieve(subscription.subscription_id)
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
      ? await dodoPayments.subscriptions.retrieve(subscription.subscription_id)
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
      productId: process.env.DODO_ENTERPRISE_PLAN!,
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
    ? await dodoPayments.subscriptions.retrieve(subscription.subscription_id)
    : await Promise.resolve(null);

  if (!sub || sub.status !== "active") return null;

  return sub;
}

export async function generateCustomerURL() {
  // Get the current organization ID from the session

  const headersList = await headers();
  const sessionData = await auth.api.getSession({ headers: headersList });

  if (!sessionData?.session) {
    return null;
  }

  const { activeOrganizationId: org, userId: customerId } = sessionData.session;

  if (!org) return null;

  // Look up the subscription record for this organization
  const subscription = await prisma.subscription.findFirst({
    where: {
      organisation_id: org,
    },
  });

  if (!subscription?.subscription_id || subscription?.userId !== customerId) {
    return null;
  }

  const dodoSubscription = await await dodoPayments.subscriptions.retrieve(
    subscription.subscription_id
  );
  if (!dodoSubscription) return null;

  // Create a new customer portal session and get the access URL
  const portalSession =
    await await dodoPayments.customers.customerPortal.create(
      dodoSubscription.customer.customer_id
    );

  const url = portalSession.link;

  return url;
}

// Server action specifically for client components
export async function generateCustomerPortalURL(): Promise<string> {
  "use server";

  const url = await generateCustomerURL();
  if (!url) {
    throw new Error("Failed to generate customer URL");
  }
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

// Server action: subscribeToProduct
export async function subscribeToProduct({ products }: { products: string[] }) {
  let result;
  const { userId, org } = await getSession();
  try {
    result = await dodoPayments.checkoutSessions.create({
      product_cart: products.map((p) => ({
        product_id: p,
        quantity: 1,
      })),
      metadata: {
        orgId: org,
        userId: userId,
      },
    });
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    throw new Error("Failed to create checkout session.");
  }
  redirect(result.checkout_url);
}
