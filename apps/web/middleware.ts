import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import { apiPrefix, authRoutes } from "./utils/config";

export default async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const session = getSessionCookie(request);

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

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
