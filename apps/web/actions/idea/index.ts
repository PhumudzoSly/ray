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

export const getAllIdeas = async () => {


	const { org } = await getSession();

	const ideas = await prisma.idea.findMany({ where: { organizationId: org } })
	return ideas
}

/**
 * Get a single idea by ID (scoped to org)
 */
export const getSingleIdea = async (id: string) => {
	const { org } = await getSession();
	const idea = await prisma.idea.findFirst({
		where: { id, organizationId: org },
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

export const updateDescription = async ({ id, description }: { id: string, description: string }) => {
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

export const changeStatus = async ({ id, status }: { id: string; status: string }) => {
	await getSession();
	return prisma.idea.update({
		where: { id },
		data: { status },
	});
};

// Trigger AI validation for an idea (stub)
export const triggerValidation = async ({ ideaId }: { ideaId: string }) => {
	// TODO: Implement AI validation logic
	// For now, return a stub result
	return {
		success: true,
		results: {
			overallScore: 80,
			recommendation: "Strong validation (stub)",
			// Add more fields as needed
		},
	};
};

// Get detailed validation results for an idea
export const getValidationDetails = async ({ ideaId }: { ideaId: string }) => {
	// Fetch the idea and related validation fields
	const idea = await prisma.idea.findUnique({
		where: { id: ideaId },
		include: {
			aiOverallValidation: true,
			// Add more relations as needed
		},
	});
	// Return a shape similar to what the component expects
	return {
		validation: idea?.aiOverallValidation || null,
		// Add more fields as needed
	};
};

