"use client";

import { useParams } from "next/navigation";
import { Id } from "@workspace/backend";
import { Comments } from "@/components/liveblocks/comments";
import { Room } from "@/components/liveblocks/room";
import Editor from "@/components/shared/editor";
import { Inbox } from "lucide-react";

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <Room id={id}>
      <div>
        <Editor />
        <div className="flex items-center gap-2 mt-10 mb-4">
          <Inbox size={18} />
          <h6>Comments</h6>
        </div>
        <Comments id={id} />
      </div>
    </Room>
  );
}
