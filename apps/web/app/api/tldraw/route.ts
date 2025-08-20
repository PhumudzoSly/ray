import { prisma } from "@workspace/backend/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { projectId, content } = await req.json();

  if (!projectId || !content) {
    return NextResponse.json(
      { error: "Missing projectId or content" },
      { status: 400 }
    );
  }

  try {
    const board = await prisma.board.upsert({
      where: { projectId },
      update: { content },
      create: { projectId, content },
    });

    return NextResponse.json(board);
  } catch (error) {
    console.error("Failed to save board:", error);
    return NextResponse.json(
      { error: "Failed to save board" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  try {
    const board = await prisma.board.findUnique({
      where: { projectId },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error("Failed to load board:", error);
    return NextResponse.json(
      { error: "Failed to load board" },
      { status: 500 }
    );
  }
}
