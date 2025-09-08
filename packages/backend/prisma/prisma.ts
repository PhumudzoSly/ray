import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter =
  process.env.NODE_ENV === "development"
    ? new PrismaPg({ connectionString })
    : new PrismaNeon({ connectionString });

// @ts-expect-error: prisma adapter is not typed
export const prisma = new PrismaClient({ adapter });
