"use client";
import { useThreads } from "@liveblocks/react/suspense";
import { Composer, Thread } from "@liveblocks/react-ui";
import { Room } from "./room";

export function Comments({ id }: { id: string }) {
  const { threads } = useThreads();

  return (
    <div>
      <Composer className="bg-background border border-border text-foreground" />
      {threads.map((thread) => (
        <Thread
          className="bg-background text-foreground"
          key={thread.id}
          thread={thread}
        />
      ))}
    </div>
  );
}
