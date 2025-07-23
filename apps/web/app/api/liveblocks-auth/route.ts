import { getSession } from "@/actions/account/user";
import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  if (!process.env.LIVEBLOCKS_SECRET_KEY) {
    return new NextResponse("Missing LIVEBLOCKS_SECRET_KEY", { status: 403 });
  }

  try {
    // Get organization members
    const user = await getSession();

    // Create a session for the current user (access token auth)
    const session = liveblocks.prepareSession(user.userId, {
      userInfo: {
        name: user.name || "Anonymous",
        avatar: user.image || "",
      },
    });

    // Use a naming pattern to allow access to rooms with a wildcard
    session.allow(`rayai:room:*`, session.FULL_ACCESS);

    const { status, body } = await session.authorize();
    return new NextResponse(body, { status });
  } catch (error) {
    console.error("Error in Liveblocks auth:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
