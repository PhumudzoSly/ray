import { GeneralFeature } from "@/types/features";

// Demo Product IDs - Replace with actual Polar product IDs later
// TODO Replace with real prices

const START_PLAN = process.env.POLAR_STARTER_PRICING!;
const BUSINESS_PLAN = process.env.POLAR_BUSINESS_PRICING!;
const ENTERPRISE_PLAN = process.env.POLAR_PRICE_ENTERPRISE!;

type Feature = GeneralFeature;

export const PLAN_NAMES: { [productId: string]: string } = {
  [START_PLAN]: "Starter",
  [BUSINESS_PLAN]: "Business",
  [ENTERPRISE_PLAN]: "Enterprise",
};

export const getPlanNameByProductId = (productId: string): string | null => {
  return PLAN_NAMES[productId] || null;
};

// Define the hierarchy of plans (lowest to highest)
const PLAN_HIERARCHY = [START_PLAN, BUSINESS_PLAN, ENTERPRISE_PLAN];

export const featureAccessConfig: { [productId: string]: Feature[] } = {
  [START_PLAN]: [GeneralFeature.Inbox, GeneralFeature.Integration],
  [BUSINESS_PLAN]: [GeneralFeature.Agent, GeneralFeature.Analytics],
  [ENTERPRISE_PLAN]: [GeneralFeature.Feedback, GeneralFeature.Integration],
};

/**
 * Finds the lowest-tier plan name that includes the specified feature.
 * @param feature The feature to check for.
 * @returns The name of the required plan, or null if the feature is not found in any plan.
 */
export const getRequiredPlanForFeature = (feature: Feature): string | null => {
  for (const planId of PLAN_HIERARCHY) {
    if (featureAccessConfig[planId]?.includes(feature)) {
      return PLAN_NAMES[planId] || null;
    }
  }
  return null; // Should not happen if config is correct
};
