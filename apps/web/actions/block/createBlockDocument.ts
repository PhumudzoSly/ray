import { prisma } from "@workspace/backend";

export async function createBlockDocument({ title, content, ownerId }: { title?: string; content: any; ownerId?: string }) {
  return prisma.blockDocument.create({
    data: {
      title,
      content,
      ownerId,
    },
  });
} 