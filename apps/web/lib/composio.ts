import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";

export const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY!,
  provider: new VercelProvider(),
});

const getComposioAccount = async ({
  userIdentifier,
  authConfigId,
}: {
  userIdentifier: string;
  authConfigId: string;
}) => {
  const connectionRequest = await composio.connectedAccounts.initiate(
    userIdentifier,
    authConfigId
  );

  // redirect the user to the OAuth flow
  const redirectUrl = connectionRequest.redirectUrl;
  console.log(redirectUrl);

  // wait for connection to be established
  const connectedAccount = await connectionRequest.waitForConnection();

  return connectedAccount;
};

const composioConfigs = {
  gmail: "ac_hjsE8WOF342U",
  slack: "ac_aWGhWlHPvmYk",
  github: "ac_IQ6baPwqnFGF",
  twitter: "ac_yqJvYNwQsmLX",
  stripe: "ac_OikGdAW35um_",
  vercel: "ac_puA3e--483ud",
  jira: "ac_8rcvClJehzy9",
};
