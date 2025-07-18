import * as projectActions from "@/actions/project";
import getQueryClient from "@/lib/query/getQueryClient";
import { getSession } from "@/actions/account/user";
import ProjectClient from "./project-client";

export default async function ProjectsPage() {
  const queryClient = getQueryClient();
  const { org } = await getSession();

  // Prefetch the projects data
  await queryClient.prefetchQuery({
    queryKey: ["projects", org],
    queryFn: () => projectActions.getProjects(),
  });

  return <ProjectClient />;
}
