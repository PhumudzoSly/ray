import { action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  ConvexHandler,
  type ConvexReturnType,
} from "@better-auth-kit/convex/handler";

const { betterAuth, query, insert, update, delete_, count, getSession } =
  ConvexHandler({
    action,
    internalQuery,
    internalMutation,
    internal,
  }) as ConvexReturnType;

export { betterAuth, query, insert, update, delete_, count, getSession };

export type ConvexSession = Partial<{
  _creationTime: number;
  _id: string;
  activeOrganizationId: string;
  expiresAt: string;
  ipAddress: string;
  updatedAt: string;
  userAgent: string;
  userId: string;
  token: string;
}>;
