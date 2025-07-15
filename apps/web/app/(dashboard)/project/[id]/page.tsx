"use client";

import { useParams } from "next/navigation";
import { Id } from "@workspace/backend";
import { BlockEditor, ActivityFeed } from "@/components/shared";
import { Comments } from "@/components/liveblocks/comments";
import { Room } from "@/components/liveblocks/room";
import Editor from "@/components/shared/editor";

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <Room id={id}>
      <div>
        {/* <BlockEditor id={`project-${id}`} /> */}
        <Editor />
        {/* <Comments id={id} /> */}
      </div>
    </Room>
  );
}
