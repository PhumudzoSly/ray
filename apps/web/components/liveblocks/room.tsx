"use client";

import { ReactNode } from "react";
import { RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { useSession } from "@/context/session-context";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { LiveMap } from "@liveblocks/core";

export function Room({ children, id }: { children: ReactNode; id: string }) {
  const user = useSession();

  return (
    <RoomProvider
      initialStorage={{
        records: new LiveMap(),
      }}
      id={`rayai:room:${id}`}
    >
      <ClientSideSuspense fallback={<LoadingSpinner />}>
        {children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
