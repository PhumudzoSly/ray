import { api, Id } from "@workspace/backend";
import { useQuery } from "convex/react";
import { useSession } from "@/context/session-context";
import { ProjectStatusSelector } from "@/components/ui/selectors/project-status-selector";

export function Badge({ id }: { id: string }) {
  const { token } = useSession();
  const project = useQuery(api.projects.getSimpleProject, {
    token,
    id: id as Id<"projects">,
  });

  return (
    <>
      {project ? (
        <div className="bg-primary/70 flex-col gap-2 flex items-center text-primary-foreground mx-2 p-2 rounded-lg">
          <h6>{project?.name}</h6>
        </div>
      ) : null}
    </>
  );
}
