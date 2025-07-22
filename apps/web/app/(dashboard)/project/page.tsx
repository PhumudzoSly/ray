import * as projectActions from "@/actions/project";
import getQueryClient from "@/lib/query/getQueryClient";
import { getSession } from "@/actions/account/user";
import ProjectClient from "./project-client";
import Header from "@/components/shared/header";
import { CreateProjectDialog } from "@/components/create-project-dialog";

export default async function ProjectsPage() {
  const queryClient = getQueryClient();
  const { org } = await getSession();

  await queryClient.prefetchQuery({
    queryKey: ["projects", org],
    queryFn: () => projectActions.getProjects(),
  });

  return (
    <>
      <Header
        crumb={[
          {
            title: "Projects",
            url: "/project",
          },
        ]}
      >
        <CreateProjectDialog />
      </Header>
      <ProjectClient />
    </>
  );
}
