'use server'

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export const getProjectMilestones = async (projectId: string) => {
    const { org } = await getSession();
    return await prisma.milestone.findMany({
        where: { projectId, organizationId: org },
        select: { id: true, name: true, status: true, progress: true }, // add more fields as needed
    });
};

export const createMilestone = async ({
    name,
    description,
    projectId,
    startDate,
    endDate,
    ownerId,
}: {
    name: string;
    description?: string;
    projectId: string;
    startDate?: number;
    endDate?: number;
    ownerId?: string;
}) => {
    const { org } = await getSession();
    return await prisma.milestone.create({
        data: {
            name,
            description,
            projectId,
            organizationId: org,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            ownerId,
        },
    });
};

export const getMilestone = async (milestoneId: string) => {
    const { org } = await getSession();
    return await prisma.milestone.findUnique({
        where: { id: milestoneId, organizationId: org },
        include: {
            owner: true,
            dependsOn: true,
            blocking: true,
            issues: true,
            features: true,
        },
    });
};

export const updateMilestone = async (milestoneId: string, updates: any) => {
    const { org } = await getSession();
    return await prisma.milestone.update({
        where: { id: milestoneId, organizationId: org },
        data: updates,
    });
};

export const deleteMilestone = async (milestoneId: string) => {
    const { org } = await getSession();
    return await prisma.milestone.delete({
        where: { id: milestoneId, organizationId: org },
    });
};