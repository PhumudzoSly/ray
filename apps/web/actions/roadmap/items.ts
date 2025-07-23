"use server";
import { prisma, RoadmapItemOptionalDefaults } from "@workspace/backend";
import { getSession } from "../account/user";

/**
 * Create a new roadmap item
 */
export const createRoadmapItem = async (data: RoadmapItemOptionalDefaults) => {
  const { org } = await getSession();
  try {
    console.log(
      "Creating roadmap item with data:",
      JSON.stringify(data, null, 2)
    );
    console.log("Organization ID:", org);

    // Ensure the roadmap belongs to the org
    const roadmap = await prisma.publicRoadmap.findFirst({
      where: { id: data.roadmapId, project: { organizationId: org } },
    });

    console.log("Found roadmap:", roadmap ? roadmap.id : "NOT FOUND");

    if (!roadmap)
      return {
        success: false,
        error: "Roadmap not found or not in your organization",
      };

    const item = await prisma.roadmapItem.create({ data });
    console.log("Created roadmap item:", item.id);
    return { success: true, data: item };
  } catch (error) {
    console.error("Error creating roadmap item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Get a roadmap item by ID (scoped to org via parent roadmap)
 */
export const getRoadmapItem = async (id: string) => {
  const { org } = await getSession();
  try {
    const item = await prisma.roadmapItem.findFirst({
      where: { id, roadmap: { project: { organizationId: org } } },
    });
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * List all roadmap items for a roadmap (scoped to org) with rich data
 */
export const getAllRoadmapItems = async (roadmapId: string) => {
  const { org } = await getSession();
  try {
    // Ensure the roadmap belongs to the org
    const roadmap = await prisma.publicRoadmap.findFirst({
      where: { id: roadmapId, project: { organizationId: org } },
    });
    if (!roadmap)
      return {
        success: false,
        error: "Roadmap not found or not in your organization",
      };

    const items = await prisma.roadmapItem.findMany({
      where: { roadmapId },
      include: {
        _count: {
          select: {
            votes: true,
            feedback: true,
          },
        },
        feedback: {
          select: {
            sentiment: true,
          },
        },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    // Transform the data to include calculated fields
    const enrichedItems = items.map((item) => {
      const positiveFeedbackCount = item.feedback.filter(
        (f) => f.sentiment === "positive"
      ).length;
      const negativeFeedbackCount = item.feedback.filter(
        (f) => f.sentiment === "negative"
      ).length;
      const neutralFeedbackCount = item.feedback.filter(
        (f) => f.sentiment === "neutral"
      ).length;

      return {
        ...item,
        voteCount: item._count.votes,
        feedbackCount: item._count.feedback,
        positiveFeedbackCount,
        negativeFeedbackCount,
        neutralFeedbackCount,
        // Remove the raw arrays and _count to keep the response clean
        votes: undefined,
        feedback: undefined,
        _count: undefined,
      };
    });

    return { success: true, data: enrichedItems };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Update a roadmap item (scoped to org via parent roadmap)
 */
export const updateRoadmapItem = async (
  id: string,
  data: Partial<RoadmapItemOptionalDefaults>
) => {
  const { org } = await getSession();
  try {
    // Ensure the item belongs to a roadmap in the org
    const item = await prisma.roadmapItem.findFirst({
      where: { id, roadmap: { project: { organizationId: org } } },
    });
    if (!item)
      return {
        success: false,
        error: "Item not found or not in your organization",
      };
    const updated = await prisma.roadmapItem.update({ where: { id }, data });
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Delete a roadmap item (scoped to org via parent roadmap)
 */
export const deleteRoadmapItem = async (id: string) => {
  const { org } = await getSession();
  try {
    // Ensure the item belongs to a roadmap in the org
    const item = await prisma.roadmapItem.findFirst({
      where: { id, roadmap: { project: { organizationId: org } } },
    });
    if (!item)
      return {
        success: false,
        error: "Item not found or not in your organization",
      };
    await prisma.roadmapItem.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Get roadmap statistics and analytics
 */
export const getRoadmapStats = async (roadmapId: string) => {
  const { org } = await getSession();
  try {
    // Ensure the roadmap belongs to the org
    const roadmap = await prisma.publicRoadmap.findFirst({
      where: { id: roadmapId, project: { organizationId: org } },
    });
    if (!roadmap)
      return {
        success: false,
        error: "Roadmap not found or not in your organization",
      };

    // Get all items with their counts and feedback for sentiment analysis
    const items = await prisma.roadmapItem.findMany({
      where: { roadmapId },
      include: {
        _count: {
          select: {
            votes: true,
            feedback: true,
          },
        },
        feedback: {
          select: {
            sentiment: true,
          },
        },
      },
    });

    // Calculate statistics
    const totalItems = items.length;
    const totalVotes = items.reduce((sum, item) => sum + item._count.votes, 0);
    const totalFeedback = items.reduce(
      (sum, item) => sum + item._count.feedback,
      0
    );

    // Status breakdown
    const statusBreakdown = items.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Category breakdown
    const categoryBreakdown = items.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Priority breakdown
    const priorityBreakdown = items.reduce(
      (acc, item) => {
        acc[item.priority] = (acc[item.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Feedback sentiment breakdown
    const sentimentBreakdown = items.reduce(
      (acc, item) => {
        item.feedback.forEach((feedback) => {
          acc[feedback.sentiment] = (acc[feedback.sentiment] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>
    );

    // Public vs private breakdown
    const publicItems = items.filter((item) => item.isPublic).length;
    const privateItems = totalItems - publicItems;

    // Items with target dates
    const itemsWithTargetDate = items.filter((item) => item.targetDate).length;
    const overdueItems = items.filter(
      (item) =>
        item.targetDate &&
        new Date(item.targetDate) < new Date() &&
        item.status !== "DONE"
    ).length;

    // Most voted items
    const mostVotedItems = items
      .sort((a, b) => b._count.votes - a._count.votes)
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        title: item.title,
        voteCount: item._count.votes,
        status: item.status,
        category: item.category,
      }));

    // Most feedback items
    const mostFeedbackItems = items
      .sort((a, b) => b._count.feedback - a._count.feedback)
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        title: item.title,
        feedbackCount: item._count.feedback,
        status: item.status,
        category: item.category,
      }));

    // Category breakdown with vote and feedback counts
    const categoryStats = Object.entries(categoryBreakdown)
      .map(([category, count]) => {
        const categoryItems = items.filter(
          (item) => item.category === category
        );
        const totalVotes = categoryItems.reduce(
          (sum, item) => sum + item._count.votes,
          0
        );
        const totalFeedback = categoryItems.reduce(
          (sum, item) => sum + item._count.feedback,
          0
        );

        return {
          category,
          count,
          totalVotes,
          totalFeedback,
          avgVotes: count > 0 ? (totalVotes / count).toFixed(1) : "0",
          avgFeedback: count > 0 ? (totalFeedback / count).toFixed(1) : "0",
        };
      })
      .sort((a, b) => b.count - a.count);

    return {
      success: true,
      data: {
        totalItems,
        totalVotes,
        totalFeedback,
        statusBreakdown,
        categoryBreakdown,
        priorityBreakdown,
        sentimentBreakdown,
        publicItems,
        privateItems,
        itemsWithTargetDate,
        overdueItems,
        mostVotedItems,
        mostFeedbackItems,
        categoryStats,
      },
    };
  } catch (error) {
    return { success: false, error };
  }
};
