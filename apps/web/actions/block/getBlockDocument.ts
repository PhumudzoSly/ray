import { prisma } from "@workspace/backend";

export async function getBlockDocument({ id }: { id: string }) {
    return prisma.blockDocument.findUnique({
        where: { id },
    });
} 