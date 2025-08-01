// Export Prisma client and types
export * as Prisma from "./prisma/generated/client/client";

// Export Zod schemas with namespace
export * as Zod from "./prisma/generated/zod";
export * from "./prisma/generated/zod";
export * as PROMPT from "./prompts/validation-sections";
export { prisma } from "./prisma/prisma";

// Export services
export * from "./services/demo-data-seeder";
