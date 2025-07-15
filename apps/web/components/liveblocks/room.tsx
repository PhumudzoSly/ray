"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { useSession } from "@/context/session-context";

export function Room({ children, id }: { children: ReactNode; id: string }) {
  const user = useSession();

  return (
    <RoomProvider id={id}>
      <ClientSideSuspense fallback={<div>Loading…</div>}>
        {children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
