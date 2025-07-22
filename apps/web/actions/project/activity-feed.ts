"use server";

import { EntityTypeType, prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export const getFeed = async ({
  entityId,
  entityType,
}: {
  entityId: string;
  entityType: EntityTypeType;
}) => {
  const { org } = await getSession();

  if (!entityId && !entityType) {
    throw new Error("Failed to get activity feed");
  }

  const feed = await prisma.activityFeed.findMany({
    where: {
      organizationId: org,
      entityId,
      entityType,
    },
    include: {
      user: true,
    },
    take: 25,
    orderBy: {
      createdAt: "desc",
    },
  });

  return feed;
};
