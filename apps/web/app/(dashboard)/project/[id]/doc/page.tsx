import { Comments } from "@/components/liveblocks/comments";
import { Room } from "@/components/liveblocks/room";
import Editor from "@/components/shared/editor";
import { Inbox } from "lucide-react";

interface DocPageProps {
  params: Promise<{ id: string }>;
}

export default async function DocPage({ params }: DocPageProps) {
  const id = (await params).id;

  return (
    <div>
      <Room id={id}>
        <Editor />
      </Room>
      <Room id={`${id}-comments`}>
        <div className="flex items-center gap-2 mt-10 mb-4">
          <Inbox size={18} />
          <h6>Comments</h6>
        </div>
        <Comments id={`${id}-comments`} />
      </Room>
    </div>
  );
}
