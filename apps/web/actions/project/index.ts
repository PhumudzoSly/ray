'use server'

import { ProjectOptionalDefaults, prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export const getProjects = async () => {
    const { org } = await getSession()

    const projects = await prisma.project.findMany({
        where: {
            organizationId: org,
        },
    });

    return projects
};

export const getProject = async (id: string) => {
    await getSession()

    const project = await prisma.project.findUnique({
        where: {
            id,
        },
    })

    return project
}

export const createProject = async (data: ProjectOptionalDefaults) => {
    const { org } = await getSession()

    const project = await prisma.project.create({
        data: {
            ...data,
            organizationId: org,
        },
    })

    return project
}

export const updateProject = async (id: string, data: ProjectOptionalDefaults) => {
    const { org } = await getSession()

    const project = await prisma.project.update({
        where: { id },
        data: {
            ...data,
            organizationId: org,
        },
    })

    return project
}

export const deleteProject = async (id: string) => {
    const { org } = await getSession()

    const project = await prisma.project.delete({
        where: { id, organizationId: org },
    })

    return project
}



