"use server";
import { prisma, Zod } from "@workspace/backend";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { z } from "zod";
import type { bugReportSchema } from "@/app/report-bugs/_components/bug-report-form";
import type { supportFormSchema } from "@/app/support/_components/support-form";
import { auth, polarClient } from "@/lib/auth";
import {
  generateApiKey,
  hashApiKey,
  getApiKeyPreview,
} from "@/lib/api-key-utils";
import {
  seedDemoData,
  shouldSeedDemoData,
  isUserMemberOfOtherOrgs,
} from "@workspace/backend";

export async function createOrg({ name }: { name: string }) {
  const headersList = await headers();

  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.session || !session.user)
    throw new Error("You are not authenticated");

  const org = await auth.api.createOrganization({
    body: {
      name,
      slug: `${name.toLowerCase().replace(/\s/g, "-")}-${session.session.userId}`,
    },
    headers: headersList,
  });

  if (!org) throw new Error("Failed to create organization");

  // Set the new organization as active
  await auth.api.setActiveOrganization({
    body: {
      organizationId: org?.id,
    },
    headers: headersList,
  });

  // Check if this user needs demo data seeding
  try {
    // Check if user is not a member of any other organization and if the new org needs demo data
    const [isNewUser, needsDemoData] = await Promise.all([
      isUserMemberOfOtherOrgs(session.user.id, org.id).then(
        (result) => !result
      ),
      shouldSeedDemoData(org.id),
    ]);

    // Seed demo data if this is a new user and the organization is empty
    if (isNewUser && needsDemoData) {
      console.log(`Seeding demo data for new organization: ${org.id}`);
      await seedDemoData({
        organizationId: org.id,
        userId: session.user.id,
      });
      console.log(`Demo data seeded successfully for organization: ${org.id}`);
    }
  } catch (error) {
    // Don't fail organization creation if demo data seeding fails
    console.error("Failed to seed demo data:", error);
  }
}

export async function getSession() {
  const headersList = await headers();

  const [data, member, activeOrg] = await Promise.all([
    auth.api.getSession({ headers: headersList }),
    auth.api.getActiveMember({ headers: headersList }),
    (async () => {
      const sessionData = await auth.api.getSession({ headers: headersList });
      if (!sessionData?.session.activeOrganizationId) return null;
      return auth.api.getFullOrganization({
        params: {
          id: sessionData.session.activeOrganizationId,
        },

        headers: headersList,
      });
    })(),
  ]);

  if (!data?.session) {
    redirect("/auth/sign-in");
  }

  const { session, user } = data;

  if (!session.activeOrganizationId || !activeOrg || !member) {
    redirect("/switch-org");
  }

  return {
    userId: user.id,
    org: session.activeOrganizationId,
    email: user.email,
    name: user.name,
    image: user.image,
    role: member.role,
    orgName: activeOrg.name,
    memberId: member.id,
    token: session.token,
  };
}

export async function getMyOrgs() {
  const myOrgs = await auth.api.listOrganizations({
    headers: await headers(),
  });

  return myOrgs;
}

export async function switchOrg(id: string) {
  await getSession();
  const headersList = await headers();

  await Promise.all([
    auth.api.setActiveOrganization({
      body: {
        organizationId: id,
      },
      headers: headersList,
    }),
    auth.api.setActiveOrganization({
      body: {
        organizationId: id,
      },
      headers: headersList,
    }),
  ]);

  return { success: true };
}

export async function getCurrentOrg() {
  const data = await auth.api.getFullOrganization({
    headers: await headers(),
  });
  return data;
}

export async function getOrgMembers() {
  const { org } = await getSession();

  const data = await auth.api.getFullOrganization({
    params: {
      id: org,
    },
    headers: await headers(),
  });

  return data?.members;
}

export async function updateOrganizationName(
  organizationId: string,
  name: string
) {
  try {
    await prisma.organization.update({
      where: { id: organizationId },
      data: { name },
    });

    return { success: true };
  } catch (error) {
    return { error: "Failed to update organization name" };
  }
}

export async function acceptInvitation(invitationId: string) {
  await getSession();
  const headersList = await headers();

  const data = await auth.api.acceptInvitation({
    body: {
      invitationId,
    },
    headers: headersList,
  });

  return data;
}

export async function getInvitations() {
  const headersList = await headers();

  const session = await auth.api.getSession({ headers: headersList });
  if (!session) throw new Error("Session invalid");
  const data = await prisma.invitation.findMany({
    where: {
      email: session?.user.email,
    },
    include: {
      organization: true,
    },
  });

  return data;
}

export async function deleteAccount() {
  const { userId } = await getSession();
  const sub = await polarClient.customers.getStateExternal({
    externalId: userId,
  });

  if (sub && sub.activeSubscriptions.length !== 0) {
    const subscriptions = sub.activeSubscriptions;
    subscriptions.forEach(async (activeSub) => {
      await polarClient.subscriptions.revoke({
        id: activeSub.id,
      });
    });
  }
}

export async function reportBug({
  data,
}: {
  data: z.infer<typeof bugReportSchema>;
}) {
  await getSession();
}

export async function contactSuppport({
  data,
}: {
  data: z.infer<typeof supportFormSchema>;
}) {
  await getSession();
}

export async function createApiKey({
  name,
  permissions,
}: {
  name: string;
  permissions: Zod.ApiPermissionType[];
}) {
  const { userId, org } = await getSession();

  const apiKey = generateApiKey();
  const keyHash = hashApiKey(apiKey);
  const keyPreview = getApiKeyPreview(apiKey);

  try {
    const api = await prisma.apiKey.create({
      data: {
        organizationId: org,
        name,
        permissions,
        keyHash,
        isActive: true,
        keyPreview,
        createdAt: new Date(),
        createdBy: userId,
      },
    });

    return {
      success: true,
      apiKey,
      data: api,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create API key",
    };
  }
}

export async function listApiKeys() {
  const { userId, org } = await getSession();

  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        organizationId: org,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to match the expected interface
    const transformedApiKeys = apiKeys.map((key) => ({
      ...key,
      createdAt: key.createdAt.getTime(),
      lastUsed: key.lastUsed?.getTime(),
      expiresAt: key.expiresAt?.getTime(),
    }));

    return {
      success: true,
      apiKeys: transformedApiKeys,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list API keys",
    };
  }
}

export async function deleteApiKey(keyId: string) {
  const { userId, org } = await getSession();

  try {
    await prisma.apiKey.delete({
      where: {
        id: keyId,
        organizationId: org,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete API key",
    };
  }
}

export async function deactivateApiKey(keyId: string) {
  const { userId, org } = await getSession();

  try {
    await prisma.apiKey.update({
      where: {
        id: keyId,
        organizationId: org,
      },
      data: {
        isActive: false,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to deactivate API key",
    };
  }
}

export async function getUser(id: string) {
  await getSession();

  const user = await prisma.user.findFirst({
    where: {
      id,
    },
  });

  return user;
}
