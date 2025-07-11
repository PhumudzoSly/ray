"use client";

import { useParams, useRouter } from "next/navigation";
import { Id } from "@workspace/backend";
import { BlockEditor } from "@/components/shared/block-editor";
import ActivityFeed from "@/components/shared/activity-feed";

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      <BlockEditor id={`project-${id}`} />

      <div className="container">
        <ActivityFeed
          entityId={id}
          entityType="project"
          emptyMessage="No activity yet"
          limit={20}
        />
      </div>
    </div>
  );
}
