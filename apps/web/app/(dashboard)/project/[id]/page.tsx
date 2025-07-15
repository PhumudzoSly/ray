"use client";

import { useParams, useRouter } from "next/navigation";
import { Id } from "@workspace/backend";
import { BlockEditor, ActivityFeed, CommentsThread } from "@/components/shared";

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      <BlockEditor id={`project-${id}`} />

      <div className="container space-y-8">
        {/* Comments Section */}
        <div className="border-t pt-6">
          <CommentsThread
            entityType="project"
            entityId={id}
            emptyMessage="No comments yet"
          />
        </div>

        {/* Activity Feed Section */}
        <div className="border-t pt-6">
          <ActivityFeed
            entityId={id}
            entityType="project"
            emptyMessage="No activity yet"
            limit={20}
          />
        </div>
      </div>
    </div>
  );
}
