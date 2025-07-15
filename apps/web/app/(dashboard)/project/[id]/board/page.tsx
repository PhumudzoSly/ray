"use client";
import { useParams } from "next/navigation";
import React from "react";
import { Room } from "./_components/Room";
import { StorageTldraw } from "./_components/storageDraw";
import { BoardContainer } from "./_components/container";
import { Comments } from "@/components/liveblocks/comments";
import { Inbox } from "lucide-react";

const BoardPage = () => {
  //

  const params = useParams();
  const id = params.id as string;

  return (
    <div>
      <BoardContainer
        sidebar={
          <div className="gap-3">
            <div className="flex items-center gap-2 p-3 bg-background  border-b text-foreground z-50 sticky top-0">
              <Inbox size={18} />
              <h1 className="font-medium text-lg text-foreground">Comments</h1>
            </div>
            <div className="overflow-y-auto p-2 h-[calc(100vh-64px)]">
              <Room roomId={`${id}-board-comments`}>
                <Comments id={`${id}-board-comments`} />
              </Room>
            </div>
          </div>
        }
      >
        <Room roomId={`${id}-board`}>
          <StorageTldraw id={id} />
        </Room>
      </BoardContainer>
    </div>
  );
};

export default BoardPage;
