"use server";

import { prisma } from "@workspace/backend";
import { z } from "zod";

const getRoadmapBySlugSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug is too long")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
});

/**
 * Get a public roadmap by slug (no auth required)
 */
export const getRoadmapBySlug = async (slug: string) => {
  try {
    // Validate input
    const validatedSlug = getRoadmapBySlugSchema.parse({ slug });

    const roadmap = await prisma.publicRoadmap.findFirst({
      where: {
        slug: validatedSlug.slug,
        isPublic: true,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            platform: true,
            createdAt: true,
          },
        },
      },
    });

    if (!roadmap) {
      return { success: false, error: "Roadmap not found or is not public" };
    }

    return {
      success: true,
      data: roadmap,
    };
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    return { success: false, error: "Failed to fetch roadmap" };
  }
};

/**
 * Get all roadmap items for a public roadmap (no auth required)
 */
export const getAllRoadmapItems = async (roadmapId: string) => {
  try {
    // Validate input
    if (!roadmapId || typeof roadmapId !== "string") {
      return { success: false, error: "Invalid roadmap ID" };
    }

    // Ensure the roadmap exists and is public
    const roadmap = await prisma.publicRoadmap.findFirst({
      where: { id: roadmapId, isPublic: true },
    });

    if (!roadmap) {
      return {
        success: false,
        error: "Roadmap not found or is not public",
      };
    }

    const items = await prisma.roadmapItem.findMany({
      where: {
        roadmapId,
        isPublic: true, // Only show public items
      },
      include: {
        _count: {
          select: {
            votes: true,
            feedback: true, // Count all feedback for public roadmaps
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
    console.error("Error fetching roadmap items:", error);
    return { success: false, error: "Failed to fetch roadmap items" };
  }
};

/**
 * Get all changelogs for a public roadmap (no auth required)
 */
export const getAllRoadmapChangelogs = async (roadmapId: string) => {
  try {
    // Validate input
    if (!roadmapId || typeof roadmapId !== "string") {
      return { success: false, error: "Invalid roadmap ID" };
    }

    // Ensure the roadmap exists and is public
    const roadmap = await prisma.publicRoadmap.findFirst({
      where: { id: roadmapId, isPublic: true },
    });

    if (!roadmap) {
      return {
        success: false,
        error: "Roadmap not found or is not public",
      };
    }

    const changelogs = await prisma.roadmapChangelog.findMany({
      where: {
        roadmapId,
        isPublished: true, // Only show published changelogs
      },
      include: {
      },
      orderBy: { publishDate: "desc" }, // Newest first
    });

    return { success: true, data: changelogs };
  } catch (error) {
    console.error("Error fetching roadmap changelogs:", error);
    return { success: false, error: "Failed to fetch roadmap changelogs" };
  }
};

const createRoadmapVoteSchema = z.object({
  roadmapItemId: z.string().min(1, "Roadmap item ID is required"),
  ipAddress: z.string().min(1, "IP address is required"),
});

/**
 * Create a new roadmap vote (no auth required, uses IP address)
 */
export const createRoadmapVote = async (data: {
  roadmapItemId: string;
  ipAddress: string;
}) => {
  try {
    // Validate input
    const validatedData = createRoadmapVoteSchema.parse(data);

    // Ensure the roadmap item exists and belongs to a public roadmap
    const item = await prisma.roadmapItem.findFirst({
      where: {
        id: validatedData.roadmapItemId,
        isPublic: true,
        roadmap: { isPublic: true, allowVoting: true },
      },
    });

    if (!item) {
      return {
        success: false,
        error: "Roadmap item not found, not public, or voting not allowed",
      };
    }

    // Check for existing vote from this IP
    const existingVote = await prisma.roadmapVote.findFirst({
      where: {
        roadmapItemId: validatedData.roadmapItemId,
        ipAddress: validatedData.ipAddress,
      },
    });

    if (existingVote) {
      return {
        success: false,
        error: "You have already voted for this item",
      };
    }

    // Create the vote
    const vote = await prisma.roadmapVote.create({
      data: {
        ...validatedData,
        userId: null, // No user authentication for public votes
        createdAt: new Date(),
      },
    });

    return { success: true, data: vote };
  } catch (error) {
    console.error("Error creating roadmap vote:", error);
    return { success: false, error: "Failed to record vote" };
  }
};

const createRoadmapFeedbackSchema = z.object({
  roadmapItemId: z.string().min(1, "Roadmap item ID is required"),
  ipAddress: z.string().min(1, "IP address is required"),
  content: z
    .string()
    .min(1, "Feedback content is required")
    .max(1000, "Feedback is too long"),
  sentiment: z.enum(["positive", "neutral", "negative"]),
});

/**
 * Create a new roadmap feedback (no auth required, uses IP address)
 */
export const createRoadmapFeedback = async (data: {
  roadmapItemId: string;
  ipAddress: string;
  content: string;
  sentiment: "positive" | "neutral" | "negative";
  isApproved?: boolean;
}) => {
  try {
    // Validate input
    const validatedData = createRoadmapFeedbackSchema.parse(data);

    // Ensure the roadmap item exists and belongs to a public roadmap
    const item = await prisma.roadmapItem.findFirst({
      where: {
        id: validatedData.roadmapItemId,
        isPublic: true,
        roadmap: { isPublic: true, allowFeedback: true },
      },
    });

    if (!item) {
      return {
        success: false,
        error: "Roadmap item not found, not public, or feedback not allowed",
      };
    }

    // Rate limiting: Check if this IP has submitted feedback recently
    const recentFeedback = await prisma.roadmapFeedback.findMany({
      where: {
        ipAddress: validatedData.ipAddress,
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }, // Last 5 minutes
      },
    });

    if (recentFeedback.length >= 3) {
      return {
        success: false,
        error: "Please wait a few minutes before submitting more feedback",
      };
    }

    // Create the feedback
    const feedback = await prisma.roadmapFeedback.create({
      data: {
        ...validatedData,
        userId: null, // No user authentication for public feedback
        isApproved: false, // Always require approval for public feedback
        createdAt: new Date(),
      },
    });

    // Trigger background sentiment analysis
    try {
      // Use fetch to call the API endpoint asynchronously
      fetch(`/api/feedback/analyze-sentiment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedbackId: feedback.id }),
      }).catch((error) => {
        console.error("Background sentiment analysis failed:", error);
      });
    } catch (error) {
      console.error("Failed to trigger sentiment analysis:", error);
    }

    return { success: true, data: feedback };
  } catch (error) {
    console.error("Error creating roadmap feedback:", error);
    return { success: false, error: "Failed to submit feedback" };
  }
};

const createFeatureRequestSchema = z.object({
  roadmapId: z.string().min(1, "Roadmap ID is required"),
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description is too long"),
  category: z.string().min(1, "Category is required"),
  email: z.string().email("Valid email is required"),
  name: z.string().max(100, "Name is too long").optional(),
  ipAddress: z.string().min(1, "IP address is required"),
});

/**
 * Create a new feature request (no auth required, uses IP address)
 */
export const createFeatureRequest = async (data: {
  roadmapId: string;
  title: string;
  description: string;
  category: string;
  email: string;
  name?: string;
  ipAddress: string;
}) => {
  try {
    // Validate input
    const validatedData = createFeatureRequestSchema.parse(data);

    // Ensure the roadmap exists and is public
    const roadmap = await prisma.publicRoadmap.findFirst({
      where: { id: validatedData.roadmapId, isPublic: true },
    });

    if (!roadmap) {
      return {
        success: false,
        error: "Roadmap not found or is not public",
      };
    }

    // Rate limiting: Check if this IP has submitted feature requests recently
    const recentRequests = await prisma.featureRequest.findMany({
      where: {
        ipAddress: validatedData.ipAddress,
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) }, // Last 10 minutes
      },
    });

    if (recentRequests.length >= 2) {
      return {
        success: false,
        error:
          "Please wait a few minutes before submitting another feature request",
      };
    }

    // Create the feature request
    const featureRequest = await prisma.featureRequest.create({
      data: {
        roadmapId: validatedData.roadmapId,
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        email: validatedData.email,
        name: validatedData.name,
        ipAddress: validatedData.ipAddress,
        status: "pending",
        priority: "medium",
        isPublic: true,
        createdAt: new Date(),
      },
    });

    return { success: true, data: featureRequest };
  } catch (error) {
    console.error("Error creating feature request:", error);
    return { success: false, error: "Failed to submit feature request" };
  }
};
