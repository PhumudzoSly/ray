"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";
import { GitHubIntegrationConfig } from "@/types/github-integration";

/**
 * Connect a GitHub repository to a project
 */
export const connectRepositoryToProject = async (
  integrationId: string,
  repositoryName: string,
  projectId: string
) => {
  try {
    const { org } = await getSession();

    // Verify the integration exists and belongs to the organization
    const integration = await prisma.integration.findFirst({
      where: {
        id: integrationId,
        organizationId: org,
        type: "GITHUB",
      },
    });

    if (!integration) {
      throw new Error("GitHub integration not found");
    }

    // Verify the project exists and belongs to the organization
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: org,
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const config = integration.config as unknown as GitHubIntegrationConfig;

    if (!config.repositories.includes(repositoryName)) {
      throw new Error("Repository is not connected to this integration");
    }

    // Check if repository is already connected to this project
    const existingConnection = await prisma.codeRepository.findFirst({
      where: {
        projectId,
        repositoryName,
      },
    });

    if (existingConnection) {
      return { success: true, data: existingConnection };
    }

    // Create the repository connection
    const repositoryConnection = await prisma.codeRepository.create({
      data: {
        projectId,
        repositoryUrl: `https://github.com/${repositoryName}`,
        repositoryName,
        accessToken: config.accessToken, // This should be encrypted in production
        isActive: true,
      },
    });

    return { success: true, data: repositoryConnection };
  } catch (error) {
    console.error("Error connecting repository to project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Get all repository connections for a project
 */
export const getProjectRepositories = async (projectId: string) => {
  try {
    const { org } = await getSession();

    // Verify the project exists and belongs to the organization
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: org,
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const repositories = await prisma.codeRepository.findMany({
      where: { projectId },
      include: {
        analyses: {
          orderBy: { analyzedAt: "desc" },
          take: 1, // Get the latest analysis
        },
        issues: {
          where: { status: "OPEN" },
          take: 5, // Get a few recent issues
        },
      },
    });

    return { success: true, data: repositories };
  } catch (error) {
    console.error("Error fetching project repositories:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Disconnect a repository from a project
 */
export const disconnectRepositoryFromProject = async (repositoryId: string) => {
  try {
    const { org } = await getSession();

    // Verify the repository exists and belongs to a project in the organization
    const repository = await prisma.codeRepository.findFirst({
      where: {
        id: repositoryId,
        project: {
          organizationId: org,
        },
      },
    });

    if (!repository) {
      throw new Error("Repository connection not found");
    }

    // Delete the repository connection (this will cascade delete analyses and issues)
    await prisma.codeRepository.delete({
      where: { id: repositoryId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error disconnecting repository from project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Get available repositories from GitHub integrations that can be connected to a project
 */
export const getAvailableRepositoriesForProject = async (projectId: string) => {
  try {
    const { org } = await getSession();

    // Verify the project exists and belongs to the organization
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: org,
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Get all GitHub integrations for the organization
    const integrations = await prisma.integration.findMany({
      where: {
        organizationId: org,
        type: "GITHUB",
        isActive: true,
      },
    });

    // Get already connected repositories for this project
    const connectedRepositories = await prisma.codeRepository.findMany({
      where: { projectId },
      select: { repositoryName: true },
    });

    const connectedRepoNames = connectedRepositories.map(
      (r) => r.repositoryName
    );

    // Collect all available repositories from integrations
    const availableRepositories = integrations.flatMap((integration) => {
      const config = integration.config as unknown as GitHubIntegrationConfig;
      return config.repositories
        .filter((repoName) => !connectedRepoNames.includes(repoName))
        .map((repoName) => ({
          integrationId: integration.id,
          integrationName: integration.name,
          repositoryName: repoName,
          githubUsername: config.githubUsername,
        }));
    });

    return { success: true, data: availableRepositories };
  } catch (error) {
    console.error("Error fetching available repositories:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Update repository settings
 */
export const updateRepositorySettings = async (
  repositoryId: string,
  settings: {
    isActive?: boolean;
    webhookId?: string;
  }
) => {
  try {
    const { org } = await getSession();

    // Verify the repository exists and belongs to a project in the organization
    const repository = await prisma.codeRepository.findFirst({
      where: {
        id: repositoryId,
        project: {
          organizationId: org,
        },
      },
    });

    if (!repository) {
      throw new Error("Repository connection not found");
    }

    // Update the repository settings
    const updatedRepository = await prisma.codeRepository.update({
      where: { id: repositoryId },
      data: settings,
    });

    return { success: true, data: updatedRepository };
  } catch (error) {
    console.error("Error updating repository settings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
