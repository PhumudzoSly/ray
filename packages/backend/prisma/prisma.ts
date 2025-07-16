import { PrismaClient } from "./generated/client";

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		errorFormat: "pretty",
	});

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}
