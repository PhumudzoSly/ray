"use client";

import { ClientSideSuspense, RoomProvider } from "@liveblocks/react/suspense";
import { ReactNode } from "react";
import { Loading } from "./Loading";
import { ErrorBoundary } from "react-error-boundary";

export function Room({
  children,
  roomId,
}: {
  children: ReactNode;
  roomId: string;
}) {
  return (
    <RoomProvider id={`rayai:room:${roomId}`}>
      <ErrorBoundary
        fallback={
          <div className="absolute flex h-screen w-screen place-content-center items-center">
            There was an error while getting threads.
          </div>
        }
      >
        <ClientSideSuspense fallback={<Loading />}>
          {children}
        </ClientSideSuspense>
      </ErrorBoundary>
    </RoomProvider>
  );
}
