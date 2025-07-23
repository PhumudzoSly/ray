import { getOrgMembers } from "@/actions/account/user";
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
    const members = await getOrgMembers();

    if (!members || members.length === 0) {
      return new NextResponse("No organization members found", { status: 404 });
    }

    // We're generating random users from organization members here.
    // In a real-world scenario, this is where you'd assign the
    // user based on their real identity from your auth provider.
    const userIndex = Math.floor(Math.random() * members.length);

    // Create a session for the current user (access token auth)
    const session = liveblocks.prepareSession(`user-${userIndex}`, {
      userInfo: {
        name: members[userIndex]?.user.name || "Anonymous",
        avatar: `https://liveblocks.io/avatars/avatar-${Math.floor(
          Math.random() * 30
        )}.png`,
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
