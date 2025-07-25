import { use } from "react";
import React from "react";
import { StorageTldraw } from "./_components/storageDraw";
import { Comments } from "@/components/liveblocks/comments";
import { Inbox } from "lucide-react";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import { Room } from "@/components/liveblocks/room";

const BoardPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return (
    <ExpandedLayoutContainer
      sidebar={
        <div className="gap-3">
          <div className="flex items-center gap-2 p-3 bg-background  border-b text-foreground z-50 sticky top-0">
            <Inbox size={18} />
            <h1 className="font-medium text-lg text-foreground">Comments</h1>
          </div>
          <div className="overflow-y-auto p-2 h-[calc(100vh-102px)]">
            <Room id={`${id}-board-comments`}>
              <Comments id={`${id}-board-comments`} />
            </Room>
          </div>
        </div>
      }
    >
      <Room id={`${id}-board`}>
        <StorageTldraw id={id} />
      </Room>
    </ExpandedLayoutContainer>
  );
};

export default BoardPage;
