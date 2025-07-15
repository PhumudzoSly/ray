"use client";
import { useOthers, useSelf } from "@liveblocks/react/suspense";
import { useSession } from "@/context/session-context";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { cn } from "@/lib/utils";
import { getInitials } from "@/utils/helpers";

export function Avatars() {
  const { userId } = useSession();

  const users = useOthers();
  const currentUser = useSelf();

  return (
    <div className={cn("flex items-center gap-2")}>
      {users?.map(({ connectionId, info, id }) => {
        if (id === userId) return null;
        return (
          <Avatar key={connectionId}>
            <AvatarImage src={info?.avatar || ""} />
            <AvatarFallback>{getInitials(info?.name || "")}</AvatarFallback>
          </Avatar>
        );
      })}

      {currentUser && (
        <Avatar>
          <AvatarImage src={currentUser.info.avatar || ""} />
          <AvatarFallback>{getInitials(currentUser.info.name)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
