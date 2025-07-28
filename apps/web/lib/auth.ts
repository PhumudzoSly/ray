import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, twoFactor, magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "better-auth/plugins/passkey";
import { APP_NAME } from "@/utils/config";
import { Polar } from "@polar-sh/sdk";
import { polar, portal, webhooks, checkout } from "@polar-sh/better-auth";
import { prisma } from "@workspace/backend";

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    nextCookies(),
    polar({
      client: polarClient,
      createCustomerOnSignUp: process.env.NODE_ENV === "production",
      use: [
        portal(),
        checkout({
          authenticatedUsersOnly: true,
          successUrl: process.env.NODE_ENV === "production" ? "/stay-tuned" : "/dashboard",
        }),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET || "", // We need to enable webhooks on Polar as well
          onPayload: async ({ data, type }) => {
            if (
              type === "subscription.created" ||
              type === "subscription.active" ||
              type === "subscription.canceled" ||
              type === "subscription.revoked" ||
              type === "subscription.uncanceled" ||
              type === "subscription.updated"
            ) {
              const org = await prisma.organization.findUnique({
                where: { id: data.metadata.org as string },
              });
              if (!org) throw new Error("Error, something happened");
              await prisma.subscription.upsert({
                create: {
                  status: data.status,
                  organisation_id: org?.id,
                  subscription_id: data.id,
                  product_id: data.productId,
                  userId: data.customer.externalId,
                },
                update: {
                  status: data.status,
                  organisation_id: org?.id,
                  subscription_id: data.id,
                  product_id: data.productId,
                  userId: data.customer.externalId,
                },
                where: {
                  organisation_id: org.id,
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
    }),
    passkey(),
    twoFactor({
      issuer: APP_NAME,
      otpOptions: {
        sendOTP: async ({ user }) => {},
      },
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {},
    }),
  ],
  account: {
    accountLinking: {
      trustedProviders: ["google"],
    },
  },
  appName: APP_NAME,
  emailAndPassword: {
    async sendResetPassword({ user, token, url }) {},
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {},
      },
      update: {
        after: async (user) => {},
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
