import { useQuery } from "@tanstack/react-query";
import { prisma } from "@workspace/backend";

export function useSidebarProjects(org: string) {
  const projects = useQuery({
    queryKey: ["projects-sidebar", org],
    queryFn: async () => {
      const projects = await prisma.idea.findMany({
        where: {
          orgId: orgId,
        },
      });
    },
  });

  // Filter projects by org if needed (assuming projects have org field)
  // For now, just return the first 10 projects
  const recentProjects = projects?.slice(0, 10) || [];

  return {
    data: recentProjects,
    isLoading: projects === undefined,
    error: null,
  };
}
