import { createAuthClient } from "better-auth/client";
import {
  organizationClient,
  passkeyClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { dodopaymentsClient } from "@dodopayments/better-auth";

export const client = createAuthClient({
  plugins: [
    passkeyClient(),
    organizationClient(),
    twoFactorClient(),
    dodopaymentsClient(),
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
  organization,
  passkey,
  resetPassword,
  revokeOtherSessions,
  revokeSession,
  revokeSessions,
  sendVerificationEmail,
  signIn,
  updateUser,
  useActiveMember,
  useActiveOrganization,
  useListOrganizations,
  useListPasskeys,
  useSession,
  verifyEmail,
  unlinkAccount,
  twoFactor,
  $Infer,
  getAccessToken,
  dodopayments,
  accountInfo,
} = client;
