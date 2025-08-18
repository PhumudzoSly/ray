import { getSession } from "@/actions/account/user";
import React from "react";
import Chat from "./Chat";
import Header from "@/components/shared/header";
import { redis } from "@/lib/redis";
import { UIMessage } from "ai";



const AgentPage = async () => {
  const { org, userId } = await getSession();
  const key = `chat:history:user:${userId}:org:${org}`;
  const messages =
    (await redis.get<UIMessage[]>(key)) ||
    (await redis.get<UIMessage[]>(`chat:history:${userId}-${org}`)) ||
    []
  
  
  return (
    <>
      <Header crumb={[{ title: "Agent", url: "/agent" }]}>{null}</Header>
      <Chat initialMessages={messages} org={org} userId={userId} />
    </>
  );
};

export default AgentPage;
