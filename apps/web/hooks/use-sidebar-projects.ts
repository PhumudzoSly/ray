import { useQuery } from "convex/react";
import { api } from "@workspace/backend";

export function useSidebarProjects(token: string) {
  const projects = useQuery(api.projects.list, {
    token,
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
