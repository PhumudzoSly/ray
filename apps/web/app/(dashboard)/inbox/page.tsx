import Header from "@/components/shared/header";
import React from "react";
import Notifications from "./AllNotifications";

const InboxPage = () => {
  return (
    <div>
      <Header crumb={[{ title: "Inbox" }]}>{null}</Header>
      <div className="mx-auto max-w-4xl p-6">
        <Notifications />
      </div>
    </div>
  );
};

export default InboxPage;
