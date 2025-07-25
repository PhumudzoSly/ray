"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "@/actions/account/user";

export async function getFinancialProjection(ideaId: string) {
  try {
    const { token } = await getSession();
    if (!token) {
      throw new Error("Unauthorized");
    }

    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        marketResearch: {
          include: {
            financialProjection: {
              include: {
                fundingRounds: true,
              },
            },
          },
        },
      },
    });

    if (!idea?.marketResearch?.financialProjection) {
      return null;
    }

    return idea.marketResearch.financialProjection;
  } catch (error) {
    console.error("Error fetching financial projection:", error);
    throw new Error("Failed to fetch financial projection");
  }
}

export async function getFundingRounds(ideaId: string) {
  try {
    const { token } = await getSession();
    if (!token) {
      throw new Error("Unauthorized");
    }

    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        marketResearch: {
          include: {
            financialProjection: {
              include: {
                fundingRounds: {
                  orderBy: { timeline: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!idea?.marketResearch?.financialProjection?.fundingRounds) {
      return [];
    }

    return idea.marketResearch.financialProjection.fundingRounds;
  } catch (error) {
    console.error("Error fetching funding rounds:", error);
    throw new Error("Failed to fetch funding rounds");
  }
}

export async function updateFinancialProjection(
  ideaId: string,
  data: {
    projectedRevenue?: number;
    revenueGrowthRate?: number;
    breakEvenPoint?: number;
    developmentCosts?: number;
    marketingCosts?: number;
    operationalCosts?: number;
    customerAcquisitionCost?: number;
    averageRevenuePerUser?: number;
    customerLifetimeValue?: number;
    paybackPeriod?: number;
    fundingNeeded?: number;
  }
) {
  try {
    const { token } = await getSession();
    if (!token) {
      throw new Error("Unauthorized");
    }

    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        marketResearch: {
          include: {
            financialProjection: true,
          },
        },
      },
    });

    if (!idea?.marketResearch) {
      throw new Error("Market research not found");
    }

    const updatedProjection = await prisma.financialProjection.upsert({
      where: { marketResearchId: idea.marketResearch.id },
      update: data,
      create: {
        marketResearchId: idea.marketResearch.id,
        ...data,
      },
    });

    return updatedProjection;
  } catch (error) {
    console.error("Error updating financial projection:", error);
    throw new Error("Failed to update financial projection");
  }
}

export async function createFundingRound(
  ideaId: string,
  data: {
    roundName: string;
    amount: number;
    equity?: number;
    valuation?: number;
    timeline?: number;
    investorType: "ANGEL" | "VENTURE_CAPITAL" | "PRIVATE_EQUITY" | "CORPORATE" | "CROWDFUNDING";
    investorName?: string;
    developmentAllocation?: number;
    marketingAllocation?: number;
    operationsAllocation?: number;
  }
) {
  try {
    const { token } = await getSession();
    if (!token) {
      throw new Error("Unauthorized");
    }

    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        marketResearch: {
          include: {
            financialProjection: true,
          },
        },
      },
    });

    if (!idea?.marketResearch?.financialProjection) {
      throw new Error("Financial projection not found");
    }

    const fundingRound = await prisma.fundingRound.create({
      data: {
        financialProjectionId: idea.marketResearch.financialProjection.id,
        ...data,
      },
    });

    return fundingRound;
  } catch (error) {
    console.error("Error creating funding round:", error);
    throw new Error("Failed to create funding round");
  }
}

export async function updateFundingRound(
  roundId: string,
  data: {
    roundName?: string;
    amount?: number;
    equity?: number;
    valuation?: number;
    timeline?: number;
    investorType?: "ANGEL" | "VENTURE_CAPITAL" | "PRIVATE_EQUITY" | "CORPORATE" | "CROWDFUNDING";
    investorName?: string;
    developmentAllocation?: number;
    marketingAllocation?: number;
    operationsAllocation?: number;
  }
) {
  try {
    const { token } = await getSession();
    if (!token) {
      throw new Error("Unauthorized");
    }

    const fundingRound = await prisma.fundingRound.update({
      where: { id: roundId },
      data,
    });

    return fundingRound;
  } catch (error) {
    console.error("Error updating funding round:", error);
    throw new Error("Failed to update funding round");
  }
}

export async function deleteFundingRound(roundId: string) {
  try {
    const { token } = await getSession();
    if (!token) {
      throw new Error("Unauthorized");
    }

    await prisma.fundingRound.delete({
      where: { id: roundId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting funding round:", error);
    throw new Error("Failed to delete funding round");
  }
} 