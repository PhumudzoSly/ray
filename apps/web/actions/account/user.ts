"use server";
import { prisma } from "@workspace/backend";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { z } from "zod";
import type { bugReportSchema } from "@/app/report-bugs/_components/bug-report-form";
import type { supportFormSchema } from "@/app/support/_components/support-form";
import { auth, polarClient } from "@/lib/auth";
import {
	generateApiKey,
	getApiKeyPreview,
	hashApiKey,
} from "@/lib/crypto-node";

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
	name: string,
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
	permissions: string[];
}) {
	const { userId, org } = await getSession();

	const apiKey = generateApiKey();
	const keyHash = hashApiKey(apiKey);
	const keyPreview = getApiKeyPreview(apiKey);

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

	return api;
}

export async function listApiKeys() {
	const { userId, org } = await getSession();

	try {
		const apiKeys = await prisma.apiKey.findMany({
			where: {
				organizationId: org,
			},
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

export async function deleteApiKey(keyId: string) {
	const { userId, org } = await getSession();

	try {
		await prisma.apiKey.delete({
			where: {
				id: keyId,
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
