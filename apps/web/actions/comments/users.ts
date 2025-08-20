"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "@/actions/account/user";
import type { OrganizationMember, ResolvedUser } from "@/types/comments";

/**
 * Batch resolves user information from user IDs
 */
export async function resolveUsers(userIds: string[]) {
  try {
    const { org } = await getSession();

    if (userIds.length === 0) {
      return { success: true, users: [] };
    }

    // Get users that are members of the current organization
    const members = await prisma.member.findMany({
      where: {
        organizationId: org,
        userId: { in: userIds },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Also get users that might not be members anymore but were mentioned
    const allUsers = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    // Create a map of active members
    const activeMemberIds = new Set(
      members.filter((m) => m.user).map((m) => m.user!.id)
    );

    // Resolve all users with active status
    const resolvedUsers: ResolvedUser[] = allUsers.map((user) => ({
      id: user.id,
      name: user.name,
      image: user.image || undefined,
      isActive: activeMemberIds.has(user.id),
    }));

    return { success: true, users: resolvedUsers };
  } catch (error) {
    console.error("Error resolving users:", error);
    return { success: false, error: "Failed to resolve users" };
  }
}

/**
 * Gets organization members for mention autocomplete
 */
export async function getOrganizationMembers(searchQuery?: string) {
  try {
    const { org } = await getSession();

    // Build search conditions
    const searchConditions = searchQuery
      ? {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" as const } },
            { email: { contains: searchQuery, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Get organization members with user details
    const members = await prisma.member.findMany({
      where: {
        organizationId: org,
        user: {
          ...searchConditions,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
      take: 20, // Limit results for performance
    });

    // Filter out members without user data and format response
    const organizationMembers: OrganizationMember[] = members
      .filter((member) => member.user)
      .map((member) => ({
        id: member.user!.id,
        name: member.user!.name,
        email: member.user!.email,
        image: member.user!.image || undefined,
      }));

    return { success: true, members: organizationMembers };
  } catch (error) {
    console.error("Error fetching organization members:", error);
    return { success: false, error: "Failed to fetch organization members" };
  }
}
