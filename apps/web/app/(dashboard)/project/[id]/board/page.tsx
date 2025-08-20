import React from "react";
import { StorageTldraw } from "./_components/storageDraw";
import { Inbox } from "lucide-react";
import { getOrCreateBoard } from "./_actions/board-actions";
import { CommentThread } from "@/components/comments/comment-thread";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";

const BoardPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const board = await getOrCreateBoard(id);

  return (
    <ExpandedLayoutContainer
      sidebar={
        <div className="gap-3">
          <div className="flex items-center gap-2 p-3 bg-background  border-b text-foreground z-50 sticky top-0">
            <Inbox size={18} />
            <h1 className="font-medium text-lg text-foreground">Comments</h1>
          </div>
          <div className="overflow-y-auto p-2 h-[calc(100vh-102px)]">
            <CommentThread entityType="board" entityId={board.id} />
          </div>
        </div>
      }
    >
      <StorageTldraw id={id} />
    </ExpandedLayoutContainer>
  );
};

export default BoardPage;
