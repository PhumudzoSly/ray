"use server";

import { prisma } from "@workspace/backend";
import { revalidatePath } from "next/cache";

export async function saveBoard(projectId: string, content: number[]) {
  if (!projectId || !content) {
    throw new Error("Missing projectId or content");
  }

  try {
    await prisma.board.upsert({
      where: { projectId },
      update: { content: Buffer.from(new Uint8Array(content)) },
      create: { projectId, content: Buffer.from(new Uint8Array(content)) },
    });

    revalidatePath(`/project/${projectId}/board`);
  } catch (error) {
    console.error("Failed to save board:", error);
    throw new Error("Failed to save board");
  }
}

export async function getOrCreateBoard(projectId: string) {
    if (!projectId) {
        throw new Error('Missing projectId');
    }

    try {
        let board = await prisma.board.findUnique({
            where: { projectId },
        });

        if (!board) {
            board = await prisma.board.create({
                data: { projectId, content: Buffer.from([]) },
            });
        }

        if (board && board.content) {
            return { ...board, content: Array.from(board.content) };
        }

        return board;
    } catch (error) {
        console.error('Failed to get or create board:', error);
        throw new Error('Failed to get or create board');
    }
}

export async function getBoard(projectId: string) {
  if (!projectId) {
    throw new Error("Missing projectId");
  }

  try {
    const board = await prisma.board.findUnique({
      where: { projectId },
    });

    if (board && board.content) {
      return { ...board, content: Array.from(board.content) };
    }

    return board;
  } catch (error) {
    console.error("Failed to load board:", error);
    throw new Error("Failed to load board");
  }
}
