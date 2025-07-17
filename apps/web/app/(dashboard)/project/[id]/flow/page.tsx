"use client";

import { useQuery } from "@tanstack/react-query";
import { getProject } from "@/actions/project";
import { FlowEditor } from "@/components/flow/flow-editor";
import { useParams } from "next/navigation";
import { useSession } from "@/context/session-context";
import { ReactFlowProvider } from "reactflow";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import NoData from "@/components/shared/no-data";

export default function ProjectFlowPage() {
  const params = useParams();
  const id = params.id as string;
  const { token } = useSession();
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProject(id),
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!project) {
    return (
      <NoData
        title="Project not found"
        message="You can't access this project"
      />
    );
  }

  return (
    <ReactFlowProvider>
      <FlowEditor project={project as any} />
    </ReactFlowProvider>
  );
}
