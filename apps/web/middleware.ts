import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import { apiPrefix, authRoutes } from "./utils/config";

export default async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const session = getSessionCookie(request);
  const isProduction = process.env.NODE_ENV === "production";

  const isAuthApiRoute = request.nextUrl.pathname.startsWith(apiPrefix);
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Allow auth routes and API routes
  if (isAuthApiRoute || isAuthRoute) {
    return res;
  }

  // If no session, redirect to sign in
  if (!session) {
    return Response.redirect(new URL("/auth/sign-in", request.url));
  }

  // In production, redirect authenticated users to stay-tuned page
  // unless they're already on an auth route or the stay-tuned page itself
  if (isProduction && !request.nextUrl.pathname.startsWith("/stay-tuned")) {
    return Response.redirect(new URL("/stay-tuned", request.url));
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
