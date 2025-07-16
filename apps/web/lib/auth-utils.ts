import { prisma } from "@/prisma/prisma";

/**
 * Check if a user has permission to access a project
 * @param userId - The ID of the user
 * @param projectId - The ID of the project
 * @returns boolean indicating if the user has access
 */
export async function ensureUserCanAccessProject(
  userId: string,
  projectId: string
): Promise<boolean> {
  if (!userId || !projectId) return false;

  // Check if user is a member of the project
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (member) return true;

  // Check if user is the creator of the project
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });

  if (project) return true;

  // Check if user is part of the organization that owns the project
  const orgProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      organization: {
        members: {
          some: {
            userId,
          },
        },
      },
    },
  });

  return !!orgProject;
}
