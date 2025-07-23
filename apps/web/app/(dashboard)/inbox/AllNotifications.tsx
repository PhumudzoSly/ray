"use client";
import { useInboxNotifications } from "@liveblocks/react";
import { InboxNotification } from "@liveblocks/react-ui";

function Notifications() {
  const { inboxNotifications } = useInboxNotifications();

  return (
    <>
      {inboxNotifications?.map((inboxNotification) => (
        <InboxNotification
          key={inboxNotification.id}
          inboxNotification={inboxNotification}
        />
      ))}
    </>
  );
}

export default Notifications;
