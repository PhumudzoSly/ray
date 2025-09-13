import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, twoFactor, magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "better-auth/plugins/passkey";
import { APP_NAME } from "@/utils/config";
import {
  dodopayments,
  checkout,
  portal,
  webhooks,
} from "@dodopayments/better-auth";
import DodoPayments from "dodopayments";
import { prisma } from "@workspace/backend";
import { loops } from "./loops";

export const dodoPayments = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment:
    process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    nextCookies(),
    dodopayments({
      client: dodoPayments,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "pdt_xxxxxxxxxxxxxxxxxxxxx",
              slug: "premium-plan",
            },
          ],
          successUrl: "/dashboard",
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
          onPayload: async (payload) => {
            if (
              payload.type === "subscription.active" ||
              payload.type === "subscription.cancelled" ||
              payload.type === "subscription.expired" ||
              payload.type === "subscription.failed" ||
              payload.type === "subscription.plan_changed" ||
              payload.type === "subscription.on_hold" ||
              payload.type === "subscription.paused" ||
              payload.type === "subscription.renewed"
            ) {
              await prisma.subscription.upsert({
                create: {
                  userId: payload?.data?.metadata?.userId!,
                  organisation_id: payload?.data?.metadata?.orgId!,
                  product_id: payload.data.product_id,
                  subscription_id: payload.data.subscription_id,
                  status: payload.data.status,
                },
                update: {
                  userId: payload?.data?.metadata?.userId!,
                  organisation_id: payload?.data?.metadata?.orgId!,
                  product_id: payload.data.product_id,
                  subscription_id: payload.data.subscription_id,
                  status: payload.data.status,
                },
                where: {
                  organisation_id: payload?.data?.metadata?.orgId!,
                },
              });
            }
          },
        }),
      ],
    }),
    organization({
      allowUserToCreateOrganization: true,
      membershipLimit: 50,
      sendInvitationEmail: async ({
        organization,
        email,
        role,
        inviter,
        invitation,
      }) => {
        await loops.sendTransactionalEmail({
          transactionalId: "cmdx3e2yl4iae070ifr1vlsmz",
          email,
          dataVariables: {
            org: organization.name,
            inviter: inviter.user.name,
            role,
            url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/join-org/${invitation.id}`,
          },
        });
      },
    }),
    passkey(),
    twoFactor({
      issuer: APP_NAME,
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          await loops.sendTransactionalEmail({
            transactionalId: "cmdx32i1t006kyp0ihrz8zk6i",
            email: user.email,
            dataVariables: {
              code: otp,
            },
          });
        },
      },
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await loops.sendTransactionalEmail({
          email,
          transactionalId: "cmdx2nsql1ik1wx0i5ogafg28",
          dataVariables: {
            url,
          },
        });
      },
    }),
  ],
  account: {
    accountLinking: {
      trustedProviders: ["google"],
    },
  },
  appName: APP_NAME,
  emailAndPassword: {
    async sendResetPassword({ user, token, url }) {
      await loops.sendTransactionalEmail({
        transactionalId: "cmdx2z18d00b0wo0i9v8pidv9",
        email: user.email,
        dataVariables: {
          url,
        },
      });
    },
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_SECRET_KEY || "",
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await loops.createContact(user.email, {
            name: user.name,
          });
        },
      },
      update: {
        after: async (user) => {
          await loops.updateContact(user.email, {
            name: user.name,
          });
        },
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 300,
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://rayai.dev",
    process.env.NEXT_PUBLIC_APP_URL || "",
  ],
});
