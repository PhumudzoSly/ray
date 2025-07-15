"use client";

import { ReactNode } from "react";
import { LiveblocksProvider } from "@liveblocks/react/suspense";
import { useSession } from "@/context/session-context";
import { getConvexUser, getOrgMembers } from "@/actions/account/user";

export function LiveBlockProvider({ children }: { children: ReactNode }) {
  const user = useSession();

  if (!user) return <>{children}</>;

  return (
    <LiveblocksProvider
      publicApiKey={
        "pk_dev_OQg2ZgqlHmJ0Tvih6e35wn5hJPFnuqzQNBsw1I8_-v3VZ1QVdiMCj43yOxlQTMi0"
      }
      resolveUsers={async ({ userIds }) => {
        const users = await Promise.all(
          userIds.map((userId) => {
            return getConvexUser({ userId, token: user.token });
          })
        );
        const finalUsers = users.map((user) => {
          return {
            id: (user?._id as string) || "",
            name: user?.name || "",
            avatar: user?.image || "",
          };
        });
        return finalUsers || [];
      }}
      resolveMentionSuggestions={async ({ text, roomId }) => {
        let orgMembers = await getOrgMembers();
        if (text) {
          // Filter any way you'd like, e.g. checking if the name matches
          orgMembers = orgMembers?.filter(({ user }) =>
            user.name.includes(text)
          );
        }
        // Return the filtered `userIds`
        return orgMembers?.map((user) => user.userId) || [];
      }}
    >
      {children}
    </LiveblocksProvider>
  );
}
