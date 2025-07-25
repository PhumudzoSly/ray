import { prisma } from "@workspace/backend";
import { revalidatePath } from "next/cache";

export async function getCompetitiveLandscape(ideaId: string) {
  try {
    const marketResearch = await prisma.marketResearch.findFirst({
      where: { ideaId },
      include: {
        competitiveLandscape: {
          include: {
            competitors: {
              include: {
                pricing: true,
                moves: true,
                featureComparisons: true,
              },
            },
          },
        },
      },
    });

    return marketResearch?.competitiveLandscape || null;
  } catch (error) {
    console.error("Error fetching competitive landscape:", error);
    throw new Error("Failed to fetch competitive landscape");
  }
}

export async function getCompetitors(ideaId: string) {
  try {
    const marketResearch = await prisma.marketResearch.findFirst({
      where: { ideaId },
      include: {
        competitiveLandscape: {
          include: {
            competitors: {
              include: {
                pricing: true,
                moves: true,
                featureComparisons: true,
              },
            },
          },
        },
      },
    });

    return marketResearch?.competitiveLandscape?.competitors || [];
  } catch (error) {
    console.error("Error fetching competitors:", error);
    throw new Error("Failed to fetch competitors");
  }
}

export async function getCompetitorPricing(competitorId: string) {
  try {
    const competitor = await prisma.competitor.findUnique({
      where: { id: competitorId },
      include: {
        pricing: true,
      },
    });

    return competitor?.pricing || [];
  } catch (error) {
    console.error("Error fetching competitor pricing:", error);
    throw new Error("Failed to fetch competitor pricing");
  }
}

export async function getCompetitiveMoves(ideaId: string) {
  try {
    const marketResearch = await prisma.marketResearch.findFirst({
      where: { ideaId },
      include: {
        competitiveLandscape: {
          include: {
            competitors: {
              include: {
                moves: true,
              },
            },
          },
        },
      },
    });

    const allMoves =
      marketResearch?.competitiveLandscape?.competitors?.flatMap(
        (competitor) => competitor.moves || []
      ) || [];

    return allMoves;
  } catch (error) {
    console.error("Error fetching competitive moves:", error);
    throw new Error("Failed to fetch competitive moves");
  }
}

export async function getFeatureComparisons(ideaId: string) {
  try {
    const marketResearch = await prisma.marketResearch.findFirst({
      where: { ideaId },
      include: {
        competitiveLandscape: {
          include: {
            competitors: {
              include: {
                featureComparisons: true,
              },
            },
          },
        },
      },
    });

    const allComparisons =
      marketResearch?.competitiveLandscape?.competitors?.flatMap(
        (competitor) => competitor.featureComparisons || []
      ) || [];

    return allComparisons;
  } catch (error) {
    console.error("Error fetching feature comparisons:", error);
    throw new Error("Failed to fetch feature comparisons");
  }
}
