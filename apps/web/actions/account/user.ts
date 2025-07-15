"use server";
import { headers } from "next/headers";
import { auth, polarClient } from "@/lib/auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { bugReportSchema } from "@/app/report-bugs/_components/bug-report-form";
import { supportFormSchema } from "@/app/support/_components/support-form";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import {
  generateApiKey,
  hashApiKey,
  getApiKeyPreview,
} from "@/lib/crypto-node";
import { api, Id } from "@workspace/backend";

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

  auth.api.setActiveOrganization({
    body: {
      organizationId: org?.id,
    },
    headers: headersList,
  });
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
    await auth.api.updateOrganization({
      params: {
        id: organizationId,
      },
      body: {
        data: {
          name,
        },
      },
      headers: await headers(),
    });

    return { success: true };
  } catch (error) {
    return { error: "Failed to update organization name" };
  }
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

export async function subscribeToUpdates(active: boolean) {
  const { userId, email, name } = await getSession();
}

export async function reportBug({
  data,
}: {
  data: z.infer<typeof bugReportSchema>;
}) {
  //
  const { userId } = await getSession();
}

export async function contactSuppport({
  data,
}: {
  data: z.infer<typeof supportFormSchema>;
}) {
  const { userId } = await getSession();
}

// API Key Management Functions

export async function createApiKey({
  name,
  permissions,
  expiresAt,
}: {
  name: string;
  permissions: string[];
  expiresAt?: number;
}) {
  const { token } = await getSession();

  try {
    // Generate the API key
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);
    const keyPreview = getApiKeyPreview(apiKey);

    // Create the API key record in Convex
    const keyId = await fetchMutation(api.apiKeys.createApiKey, {
      token,
      name,
      permissions,
      expiresAt,
    });

    // Update the key with hash and preview
    await fetchMutation(api.apiKeys.updateApiKeyHash, {
      token,
      keyId,
      keyHash,
      keyPreview,
    });

    // Return the key only once (it won't be shown again)
    return {
      success: true,
      apiKey,
      keyId,
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
  const { token } = await getSession();

  try {
    const apiKeys = await fetchQuery(api.apiKeys.listApiKeys, {
      token,
    });

    return {
      success: true,
      apiKeys,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list API keys",
    };
  }
}

export async function deleteApiKey(keyId: Id<"apiKeys">) {
  const { token } = await getSession();

  try {
    await fetchMutation(api.apiKeys.deleteApiKey, {
      token,
      keyId,
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

export async function deactivateApiKey(keyId: Id<"apiKeys">) {
  const { token } = await getSession();

  try {
    await fetchMutation(api.apiKeys.deactivateApiKey, {
      token,
      keyId,
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

export async function getConvexUser({
  userId,
  token,
}: {
  userId: string;
  token: string;
}) {


  const user = await fetchQuery(api.user.getUserById, {
    token,
    id: userId as Id<"user">,
  });

  return user;
}
