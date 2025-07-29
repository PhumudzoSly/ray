import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import { apiPrefix, authRoutes } from "./utils/config";

export default async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const session = getSessionCookie(request);
  const isProduction = process.env.NODE_ENV === "production";

  // Debug logging
  console.log("🔍 Middleware Debug:");
  console.log("  - Pathname:", request.nextUrl.pathname);
  console.log("  - NODE_ENV:", process.env.NODE_ENV);
  console.log("  - Is Production:", isProduction);
  console.log("  - Has Session:", !!session);

  const isAuthApiRoute = request.nextUrl.pathname.startsWith(apiPrefix);
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  console.log("  - Is Auth API Route:", isAuthApiRoute);
  console.log("  - Is Auth Route:", isAuthRoute);

  // Allow auth routes and API routes
  if (isAuthApiRoute || isAuthRoute) {
    console.log("  - ✅ Allowing auth/API route");
    return res;
  }

  // If no session, redirect to sign in
  if (!session) {
    console.log("  - 🔄 Redirecting to sign-in (no session)");
    return Response.redirect(new URL("/auth/sign-in", request.url));
  }

  // In production, redirect authenticated users to stay-tuned page
  // unless they're already on an auth route or the stay-tuned page itself
  if (isProduction && !request.nextUrl.pathname.startsWith("/stay-tuned")) {
    console.log("  - 🔄 Redirecting to stay-tuned (production mode)");
    return Response.redirect(new URL("/stay-tuned", request.url));
  }

  console.log("  - ✅ Allowing request through");
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
