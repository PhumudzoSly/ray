import { NextRequest, NextResponse } from "next/server";
import { apiPrefix, authRoutes } from "./utils/config";
import { getSessionCookie } from "better-auth/cookies";

export default async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  const session = getSessionCookie(request);

  const isAuthApiRoute = request.nextUrl.pathname.startsWith(apiPrefix);
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isAuthApiRoute || isAuthRoute) {
    return res;
  }

  if (!session) {
    return Response.redirect(new URL("/auth/sign-in", request.url));
  }

  return res;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
