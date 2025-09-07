import { getSession } from "@/actions/account/user";
import React from "react";
import Chat from "./Chat";
import Header from "@/components/shared/header";
import { redis } from "@/lib/redis";
import { UIMessage } from "ai";
import { WithFeature } from "@/components/with-feature";
import { GeneralFeature } from "@/types/features";

const AgentPage = async () => {
  //

  const { org, userId } = await getSession();

  const key = `chat:history:user:${userId}:org:${org}`;
  const messages =
    (await redis.get<UIMessage[]>(key)) ||
    (await redis.get<UIMessage[]>(`chat:history:${userId}-${org}`)) ||
    [];

  return (
    <>
      <Header crumb={[{ title: "Agent", url: "/agent" }]}>{null}</Header>
      <WithFeature
        feature={GeneralFeature.CoPilot}
        requireFullPage
        message="CoPilot feature is only available for users on higher plans"
      >
        <Chat initialMessages={messages} org={org} userId={userId} />
      </WithFeature>
    </>
  );
};

export default AgentPage;
