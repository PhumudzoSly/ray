import { prisma } from "@workspace/backend";

export async function updateBlockDocument({ id, title, content }: { id: string; title?: string; content?: any }) {
  return prisma.blockDocument.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(content !== undefined ? { content } : {}),
    },
  });
} 