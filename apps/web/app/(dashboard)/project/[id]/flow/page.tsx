"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { FlowEditor } from "@/components/flow/flow-editor";
import { Id } from "@workspace/backend";
import { useParams } from "next/navigation";
import { useSession } from "@/context/session-context";
import { ReactFlowProvider } from "reactflow";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import NoData from "@/components/shared/no-data";

export default function ProjectFlowPage() {
  const params = useParams();
  const id = params.id as string;
  const { token } = useSession();
  const project = useQuery(api.projects.get, {
    id: id as Id<"projects">,
    token,
  });

  if (project === undefined) {
    return <LoadingSpinner />;
  }

  if (project === null) {
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
