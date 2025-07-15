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

    const user = await getSession()

    const session = liveblocks.prepareSession(`${user.userId}`, {
        userInfo: {
            name: user.name,
            avatar: user?.image || ""
        }
    });

    session.allow(`liveblocks:room:${user.userId}`, session.FULL_ACCESS);

    const { status, body } = await session.authorize();
    return new NextResponse(body, { status });
}