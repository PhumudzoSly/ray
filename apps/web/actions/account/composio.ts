"use server";

import { composio, composioConfigs } from "@/lib/composio";
import { getSession } from "./user";

export const getComposioAccount = async ({
  userIdentifier,
  authConfigId,
}: {
  userIdentifier: string;
  authConfigId: string;
}) => {
  let appName: string = "";
  switch (authConfigId) {
    case "slack":
      appName = composioConfigs.slack;
      break;
    case "github":
      appName = composioConfigs.github;
    case "twitter":
      appName = composioConfigs.twitter;

    default:
      break;
  }

  await getSession();

  const connectionRequest = await composio.connectedAccounts.initiate(
    userIdentifier,
    appName
  );

  // redirect the user to the OAuth flow
  const redirectUrl = connectionRequest.redirectUrl;
  console.log(redirectUrl);

  return { redirectUrl };
};

export const deleteComposioAccount = async ({ id }: { id: string }) => {
  await getSession();
  await composio.connectedAccounts.delete(id);
};
