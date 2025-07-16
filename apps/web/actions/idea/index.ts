"use server";

import { prisma, IdeaOptionalDefaults } from "@workspace/backend";
import { getSession } from "../account/user";

export const createIdea = async (data: IdeaOptionalDefaults) => {
	const { org } = await getSession();

	const idea = await prisma.idea.create({
		data: {
			status: data.status || "INVALIDATED",
			organizationId: org,
			name: data.name,
			description: data.description,
			industry: data.industry,
			internal: data.internal,
			openSource: data.openSource,
			problemSolved: data.problemSolved,
			solutionOffered: data.solutionOffered,
		},
	});

	return idea;
};

export const updateIdea = async (data: IdeaOptionalDefaults) => {
	await getSession();

	const idea = await prisma.idea.update({
		where: {
			id: data.id,
		},
		data: {
			status: data.status || "INVALIDATED",
			name: data.name,
			description: data.description,
			industry: data.industry,
			internal: data.internal,
		},
	});
};

export const deleteIdea = async (id: string) => {
	await getSession();
	await prisma.idea.delete({
		where: {
			id,
		},
	});
};

export const updateName = async ({ id, name }: { id: string; name: string }) => {
	await getSession();

	await prisma.idea.update({
		where: {
			id,
		},
		data: {
			name,
		},
	});
};

export const updateDescription = async ({id, description}:{id:string, description:string}) => {
	await getSession();

	await prisma.idea.update({
		where: {
			id,
		},
		data: {
			description,
		},
	});
};

export const updateIndustry = async ({ id, industry }: { id: string; industry: string }) => {
	await getSession();

	await prisma.idea.update({	
		where: {
			id,
		},
		data: {
			industry,
		},
	});
};

export const updateInternal = async ({ id, internal }: { id: string; internal: boolean }) => {
	await getSession();

	await prisma.idea.update({
		where: {
			id,
		},
		data: {
			internal,
		},
	});
};

export const updateOpenSource = async ({ id, openSource }: { id: string; openSource: boolean }) => {
	await getSession();

	await prisma.idea.update({
		where: {
			id,
		},
		data: {
			openSource,
		},
	});
};

export const updateProblemSolved = async ({ id, problemSolved }: { id: string; problemSolved: string }) => {
	await getSession();

	await prisma.idea.update({
		where: {
			id,
		},
		data: {
			problemSolved,
		},
	});
};

export const updateSolutionOffered = async ({ id, solutionOffered }: { id: string; solutionOffered: string }) => {
	await getSession();

	await prisma.idea.update({
		where: {
			id,
		},
		data: {
			solutionOffered,
		},
	});
};

