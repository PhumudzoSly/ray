import { useQuery } from "@tanstack/react-query";
import * as projectActions from "@/actions/project";
import { useSession } from "@/context/session-context";
import { ProjectStatusSelector } from "@/components/ui/selectors/project-status-selector";

export function Badge({ id }: { id: string }) {
  const { token } = useSession();
  const { data: project } = useQuery({
    queryKey: ["simpleProject", id],
    queryFn: () => projectActions.getSimpleProject(id),
    enabled: !!id,
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
