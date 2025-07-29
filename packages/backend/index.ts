// Export Prisma client and types
export * as Prisma from "./prisma/generated/client";

// Export Zod schemas with namespace
export * as Zod from "./prisma/generated/zod";
export * from "./prisma/generated/zod";

// Export services
export * from "./src/services";

// Export prisma instance
export { prisma } from "./prisma/prisma";
