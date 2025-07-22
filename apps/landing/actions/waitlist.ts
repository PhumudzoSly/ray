"use server";

import { prisma } from "@workspace/backend";
import { z } from "zod";

const joinWaitlistSchema = z.object({
  waitlistId: z.string().min(1, "Waitlist ID is required"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email is too long"),
  name: z.string().max(100, "Name is too long").optional(),
  referredBy: z.string().max(20, "Referral code is too long").optional(),
  utmSource: z.string().max(50, "UTM source is too long").optional(),
  utmMedium: z.string().max(50, "UTM medium is too long").optional(),
  utmCampaign: z.string().max(100, "UTM campaign is too long").optional(),
});

const getWaitlistBySlugSchema = z.object({
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
 * Get a public waitlist by slug, with stats
 * No auth required
 */
export const getWaitlistBySlug = async (slug: string) => {
  try {
    // Validate input
    const validatedSlug = getWaitlistBySlugSchema.parse({ slug });

    console.log("validatedSlug", validatedSlug);

    const waitlist = await prisma.waitlist.findFirst({
      where: { slug: validatedSlug.slug, isPublic: true },
      include: { project: { select: { name: true } } },
    });

    if (!waitlist) {
      return { success: false, error: "Waitlist not found or is not public" };
    }

    // Fetch stats
    const totalEntries = await prisma.waitlistEntry.count({
      where: { waitlistId: waitlist.id },
    });
    const verifiedCount = await prisma.waitlistEntry.count({
      where: { waitlistId: waitlist.id, verifiedAt: { not: null } },
    });
    const todayCount = await prisma.waitlistEntry.count({
      where: {
        waitlistId: waitlist.id,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    return {
      success: true,
      data: {
        ...waitlist,
        stats: {
          totalEntries,
          verifiedCount,
          todayCount,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching waitlist:", error);
    return { success: false, error: "Failed to fetch waitlist" };
  }
};

/**
 * Join a waitlist
 * No auth required
 */

export const joinWaitlist = async (
  data: z.infer<typeof joinWaitlistSchema>
) => {
  try {
    // Sanitize input data
    const sanitizedData = {
      ...data,
      email: data.email.toLowerCase().trim(),
      name: data.name?.trim(),
      referredBy: data.referredBy?.trim(),
      utmSource: data.utmSource?.trim(),
      utmMedium: data.utmMedium?.trim(),
      utmCampaign: data.utmCampaign?.trim(),
    };

    const validatedData = joinWaitlistSchema.parse(sanitizedData);

    // Rate limiting: Check if this email has tried to join recently
    const recentAttempts = await prisma.waitlistEntry.findMany({
      where: {
        email: validatedData.email,
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }, // Last 5 minutes
      },
    });

    if (recentAttempts.length > 0) {
      return {
        success: false,
        error: "Please wait a few minutes before trying again",
      };
    }

    // Check if waitlist exists and is public
    const waitlist = await prisma.waitlist.findFirst({
      where: { id: validatedData.waitlistId, isPublic: true },
    });

    if (!waitlist) {
      return { success: false, error: "Waitlist not found or is not public" };
    }

    // Check if email already exists
    const existingEntry = await prisma.waitlistEntry.findFirst({
      where: {
        waitlistId: validatedData.waitlistId,
        email: validatedData.email,
      },
    });

    if (existingEntry) {
      return {
        success: false,
        error: "Email already registered for this waitlist",
      };
    }

    // Get current position
    const currentPosition = await prisma.waitlistEntry.count({
      where: { waitlistId: validatedData.waitlistId },
    });

    // Create entry
    const entry = await prisma.waitlistEntry.create({
      data: {
        waitlistId: validatedData.waitlistId,
        email: validatedData.email,
        name: validatedData.name,
        position: currentPosition + 1,
        status: "pending",
        utmSource: validatedData.utmSource,
        utmMedium: validatedData.utmMedium,
        utmCampaign: validatedData.utmCampaign,
        referralCode: "", // Will be updated after creation
        referredBy: validatedData.referredBy || null, // Store who referred them
        referralCount: 0,
        ipAddress: "unknown", // Default value since field is required
      },
    });

    // Generate referral code (simple implementation)
    const referralCode = `REF${entry.id.slice(-6).toUpperCase()}`;

    console.log("Generated referral code:", {
      entryId: entry.id,
      referralCode: referralCode,
    });

    // Update entry with referral code
    await prisma.waitlistEntry.update({
      where: { id: entry.id },
      data: { referralCode },
    });

    // If referred by someone, update their referral count
    // This must happen AFTER the referral code is set
    if (validatedData.referredBy) {
      console.log("Processing referral:", {
        waitlistId: validatedData.waitlistId,
        referralCode: validatedData.referredBy,
      });

      // First, let's check if the referrer exists
      const referrer = await prisma.waitlistEntry.findFirst({
        where: {
          waitlistId: validatedData.waitlistId,
          referralCode: validatedData.referredBy,
        },
      });

      console.log("Found referrer:", referrer);

      const updateResult = await prisma.waitlistEntry.updateMany({
        where: {
          waitlistId: validatedData.waitlistId,
          referralCode: validatedData.referredBy,
        },
        data: {
          referralCount: { increment: 1 },
        },
      });

      console.log("Referral count update result:", updateResult);
    }

    return {
      success: true,
      data: {
        entry,
        referralCode,
        position: currentPosition + 1,
      },
    };
  } catch (error) {
    console.error("Error joining waitlist:", error);
    return { success: false, error: "Failed to join waitlist" };
  }
};

const checkWaitlistEntrySchema = z.object({
  waitlistId: z.string().min(1, "Waitlist ID is required"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email is too long"),
});

/**
 * Check if a user has already joined a waitlist and get their information
 * No auth required
 */
export const checkWaitlistEntry = async (
  data: z.infer<typeof checkWaitlistEntrySchema>
) => {
  try {
    const sanitizedData = {
      ...data,
      email: data.email.toLowerCase().trim(),
    };

    const validatedData = checkWaitlistEntrySchema.parse(sanitizedData);

    // Check if waitlist exists and is public
    const waitlist = await prisma.waitlist.findFirst({
      where: { id: validatedData.waitlistId, isPublic: true },
    });

    if (!waitlist) {
      return { success: false, error: "Waitlist not found or is not public" };
    }

    // Find the user's entry
    const entry = await prisma.waitlistEntry.findFirst({
      where: {
        waitlistId: validatedData.waitlistId,
        email: validatedData.email,
      },
    });

    if (!entry) {
      return { success: false, error: "Email not found on this waitlist" };
    }

    // Get people they referred
    const referredPeople = await prisma.waitlistEntry.findMany({
      where: {
        waitlistId: validatedData.waitlistId,
        referredBy: entry.referralCode,
      },
      select: {
        id: true,
        email: true,
        name: true,
        position: true,
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Get current position (might have changed due to referrals)
    const currentPosition = await prisma.waitlistEntry.count({
      where: {
        waitlistId: validatedData.waitlistId,
        position: { lt: entry.position },
      },
    });

    return {
      success: true,
      data: {
        entry: {
          id: entry.id,
          email: entry.email,
          name: entry.name,
          position: currentPosition + 1,
          referralCode: entry.referralCode,
          referralCount: entry.referralCount,
          status: entry.status,
          createdAt: entry.createdAt,
          verifiedAt: entry.verifiedAt,
        },
        referredPeople,
        waitlist: {
          id: waitlist.id,
          name: waitlist.name,
          slug: waitlist.slug,
          description: waitlist.description,
        },
      },
    };
  } catch (error) {
    console.error("Error checking waitlist entry:", error);
    return { success: false, error: "Failed to check waitlist entry" };
  }
};
