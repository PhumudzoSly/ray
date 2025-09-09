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

// import { PrismaClient } from "./generated/client";

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };

// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     errorFormat: "pretty",
//   });

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = prisma;
// }
