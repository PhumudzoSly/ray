"use server";

import { getSession } from "./user";
import { getSubscription } from "./subscription";
import { prisma } from "@workspace/backend";
import {
  PROJECTS_LIMITS,
  TEAM_LIMITS,
  AI_LIMITS,
  API_LIMITS,
  ALL_LIMITS,
} from "@/types/limits";

/**
 * Checks if the organization has reached its team member limit based on subscription
 * @returns Object containing limit information and whether the limit is reached
 */
export async function checkTeamMemberLimit() {
  // Get current organization and subscription
  const { org } = await getSession();
  const subscription = await getSubscription();

  if (!subscription) {
    return {
      currentCount: 0,
      maxAllowed: 0,
      limitReached: true,
    };
  }

  // Get team limits for the current subscription
  const teamLimits = TEAM_LIMITS[subscription.productId];

  if (!teamLimits) {
    // Default to most restrictive if product not found in config
    return {
      currentCount: 0,
      maxAllowed: 0,
      limitReached: true,
    };
  }

  const organization = await prisma.organization.findUnique({
    where: { id: org },
    include: { members: true },
  });

  const currentMemberCount = organization?.members.length || 0;

  return {
    currentCount: currentMemberCount,
    maxAllowed: teamLimits.maxTeamMembers,
    limitReached: currentMemberCount >= teamLimits.maxTeamMembers,
  };
}

/**
 * Checks if the organization has reached its project limit based on subscription
 * @returns Object containing limit information and whether the limit is reached
 */
export async function checkProjectLimit() {
  const { org } = await getSession();
  const subscription = await getSubscription();

  if (!subscription) {
    return {
      currentCount: 0,
      maxAllowed: 0,
      limitReached: true,
    };
  }

  const projectLimits = PROJECTS_LIMITS[subscription.productId];

  if (!projectLimits) {
    return {
      currentCount: 0,
      maxAllowed: 0,
      limitReached: true,
    };
  }

  const projectCount = await prisma.project.count({
    where: { organizationId: org },
  });

  return {
    currentCount: projectCount,
    maxAllowed: projectLimits.maxProject,
    limitReached: projectCount >= projectLimits.maxProject,
  };
}

/**
 * Checks if the organization has reached its AI validation limit based on subscription
 * @returns Object containing limit information and whether the limit is reached
 */
export async function checkAIValidationLimit() {
  const { org } = await getSession();
  const subscription = await getSubscription();

  if (!subscription) {
    return {
      currentCount: 0,
      maxAllowed: 0,
      limitReached: true,
    };
  }

  const aiLimits = AI_LIMITS[subscription.productId];

  if (!aiLimits) {
    return {
      currentCount: 0,
      maxAllowed: 0,
      limitReached: true,
    };
  }

  // Get current month's validation count
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const validationCount = await prisma.researchSession.count({
    where: {
      idea: {
        organizationId: org,
      },
      createdAt: {
        gte: startOfMonth,
      },
    },
  });

  return {
    currentCount: validationCount,
    maxAllowed: aiLimits.maxValidations,
    limitReached: validationCount >= aiLimits.maxValidations,
  };
}

/**
 * Checks if the organization has reached its API call limit based on subscription
 * @returns Object containing limit information and whether the limit is reached
 */
export async function checkAPICallLimit() {
  const { org } = await getSession();
  const subscription = await getSubscription();

  if (!subscription) {
    return {
      currentCount: 0,
      maxAllowed: 0,
      limitReached: true,
    };
  }

  const apiLimits = API_LIMITS[subscription.productId];

  if (!apiLimits) {
    return {
      currentCount: 0,
      maxAllowed: 0,
      limitReached: true,
    };
  }

  // Get current month's API call count
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const apiCallCount = await prisma.apiCall.count({
    where: {
      organizationId: org,
      createdAt: {
        gte: startOfMonth,
      },
    },
  });

  return {
    currentCount: apiCallCount,
    maxAllowed: apiLimits.maxCalls,
    limitReached: apiCallCount >= apiLimits.maxCalls,
  };
}

/**
 * Gets all limits for the current organization's subscription
 * @returns Object containing all limit information
 */
export async function getAllLimits() {
  //

  const subscription = await getSubscription();

  if (!subscription) {
    return {
      teamMembers: { currentCount: 0, maxAllowed: 0, limitReached: true },
      projects: { currentCount: 0, maxAllowed: 0, limitReached: true },
      aiValidations: { currentCount: 0, maxAllowed: 0, limitReached: true },
      apiCalls: { currentCount: 0, maxAllowed: 0, limitReached: true },
    };
  }

  const allLimits = ALL_LIMITS[subscription.productId];

  if (!allLimits) {
    return {
      teamMembers: { currentCount: 0, maxAllowed: 0, limitReached: true },
      projects: { currentCount: 0, maxAllowed: 0, limitReached: true },
      aiValidations: { currentCount: 0, maxAllowed: 0, limitReached: true },
      apiCalls: { currentCount: 0, maxAllowed: 0, limitReached: true },
    };
  }

  // Get all current counts
  const [teamMembers, projects, aiValidations, apiCalls] = await Promise.all([
    checkTeamMemberLimit(),
    checkProjectLimit(),
    checkAIValidationLimit(),
    checkAPICallLimit(),
  ]);

  return {
    teamMembers,
    projects,
    aiValidations,
    apiCalls,
  };
}
