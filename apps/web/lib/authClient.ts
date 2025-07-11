import { createAuthClient } from "better-auth/client";
import { polarClient } from "@polar-sh/better-auth";
import {
  organizationClient,
  passkeyClient,
  magicLinkClient,
} from "better-auth/client/plugins";

export const client = createAuthClient({
  plugins: [
    polarClient(),
    organizationClient(),
    passkeyClient(),
    magicLinkClient(),
  ],
});

export const {
  changeEmail,
  changePassword,
  forgetPassword,
  deleteUser,
  linkSocial,
  listAccounts,
  listSessions,
  signOut,
  signUp,
  resetPassword,
  revokeOtherSessions,
  revokeSession,
  revokeSessions,
  sendVerificationEmail,
  signIn,
  updateUser,
  verifyEmail,
  organization,
  unlinkAccount,
  $Infer,
  polar,
  usage,
  customer,
  checkout,
  useSession: useBetterAuthSession,
  useActiveOrganization,
  useListOrganizations,
  useActiveMember,
  refreshToken,
  magicLink,
} = client;
