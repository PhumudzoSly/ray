# Production Redirection System Documentation

## Overview

This document explains the production redirection system implemented to restrict user access in production. When `NODE_ENV=production`, authenticated users are redirected to a "Stay Tuned" page instead of accessing the dashboard, while unauthenticated users can only access `/auth/` pages.

## How It Works

### Environment Detection
The system uses `process.env.NODE_ENV === "production"` to detect when the app is running in production mode.

### User Flow
1. **Unauthenticated users** → Redirected to `/auth/sign-in`
2. **Authenticated users in production** → Redirected to `/stay-tuned`
3. **Authenticated users in development** → Normal dashboard access

## Files Modified

### 1. Middleware (`apps/web/middleware.ts`)
**Purpose**: Main routing protection logic

**Changes Made**:
```typescript
// Added production environment check
const isProduction = process.env.NODE_ENV === "production";

// Added production redirect logic
if (isProduction && !request.nextUrl.pathname.startsWith("/stay-tuned")) {
  return Response.redirect(new URL("/stay-tuned", request.url));
}

// Added debugging logs for troubleshooting
console.log("🔍 Middleware Debug:");
console.log("  - Pathname:", request.nextUrl.pathname);
console.log("  - NODE_ENV:", process.env.NODE_ENV);
console.log("  - Is Production:", isProduction);
console.log("  - Has Session:", !!session);
```

**What it does**:
- Checks if the app is running in production
- Redirects authenticated users to `/stay-tuned` unless they're already on that page
- Maintains normal auth route protection
- Provides detailed logging for debugging

**Updated Matcher**:
```typescript
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
```

### 2. Main Page (`apps/web/app/page.tsx`)
**Purpose**: Root page redirect logic

**Changes Made**:
```typescript
// In production, redirect to stay-tuned page
if (process.env.NODE_ENV === "production") {
  redirect("/stay-tuned");
}

// In development, redirect to dashboard
return redirect("/dashboard");
```

**What it does**:
- Redirects authenticated users to `/stay-tuned` in production
- Redirects to `/dashboard` in development

### 3. Dashboard Layout (`apps/web/app/(dashboard)/layout.tsx`)
**Purpose**: Dashboard route group protection

**Changes Made**:
```typescript
// In production, redirect authenticated users to stay-tuned page
if (process.env.NODE_ENV === "production") {
  redirect("/stay-tuned");
}
```

**What it does**:
- Provides an additional layer of protection for all dashboard routes
- Ensures that even if middleware is bypassed, dashboard access is still blocked in production
- Works as a fallback protection mechanism

### 4. Configuration (`apps/web/utils/config.ts`)
**Purpose**: Route configuration and redirect defaults

**Changes Made**:
```typescript
// Added stay-tuned to allowed routes
export const authRoutes = [
  // ... existing routes
  "/stay-tuned",
];

// Updated default login redirect
export const DEFAULT_LOGIN_REDIRECT = process.env.NODE_ENV === "production" ? "/stay-tuned" : "/switch-org";
```

**What it does**:
- Adds `/stay-tuned` to the list of allowed routes
- Updates default redirect behavior based on environment

### 5. Auth Configuration (`apps/web/lib/auth.ts`)
**Purpose**: Authentication flow configuration

**Changes Made**:
```typescript
checkout({
  authenticatedUsersOnly: true,
  successUrl: process.env.NODE_ENV === "production" ? "/stay-tuned" : "/dashboard",
}),
```

**What it does**:
- Updates checkout success URL to redirect to `/stay-tuned` in production

### 6. Feature Page (`apps/web/app/(dashboard)/features/[id]/page.tsx`)
**Purpose**: Feature-specific redirect logic

**Changes Made**:
```typescript
if (!feature) {
  return redirect(process.env.NODE_ENV === "production" ? "/stay-tuned" : "/dashboard");
}
```

**What it does**:
- Redirects to `/stay-tuned` in production when a feature doesn't exist

### 7. Stay Tuned Page (`apps/web/app/stay-tuned/page.tsx`)
**Purpose**: New page for production users

**Features**:
- Beautiful, modern UI with shadcn components
- Encourages users to think about their next SaaS idea
- Provides "Go Back" and "Sign Out" functionality
- Matches Linear/Noton aesthetic

### 8. Test Page (`apps/web/app/test-middleware/page.tsx`)
**Purpose**: Debugging and testing middleware functionality

**Features**:
- Displays current NODE_ENV value
- Shows production status
- Displays request headers for debugging
- Helps verify middleware execution

## Multi-Layer Protection System

The production redirection system now implements **three layers of protection**:

1. **Middleware Layer** (`middleware.ts`)
   - First line of defense
   - Catches requests before they reach the app
   - Redirects to `/stay-tuned` in production

2. **Main Page Layer** (`page.tsx`)
   - Second line of defense
   - Handles root route redirects
   - Ensures proper routing based on environment

3. **Dashboard Layout Layer** (`(dashboard)/layout.tsx`)
   - Third line of defense
   - Fallback protection for dashboard routes
   - Ensures dashboard access is blocked even if middleware is bypassed

## How to Revert When Launching

### Option 1: Environment-Based Revert (Recommended)

Simply set `NODE_ENV` to something other than "production" (e.g., "staging" or "development") and the system will automatically allow normal dashboard access.

### Option 2: Complete Removal

If you want to completely remove the production restrictions:

#### Step 1: Remove Production Checks from Middleware
```typescript
// In apps/web/middleware.ts, remove these lines:
const isProduction = process.env.NODE_ENV === "production";

// And remove this block:
if (isProduction && !request.nextUrl.pathname.startsWith("/stay-tuned")) {
  return Response.redirect(new URL("/stay-tuned", request.url));
}

// Also remove debug logging:
console.log("🔍 Middleware Debug:");
// ... all console.log statements
```

#### Step 2: Restore Main Page Redirect
```typescript
// In apps/web/app/page.tsx, replace with:
export default async function Page() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  
  if (!session) {
    redirect("/auth/sign-in");
  }
  
  return redirect("/dashboard");
}
```

#### Step 3: Remove Production Check from Dashboard Layout
```typescript
// In apps/web/app/(dashboard)/layout.tsx, remove this block:
// In production, redirect authenticated users to stay-tuned page
if (process.env.NODE_ENV === "production") {
  redirect("/stay-tuned");
}
```

#### Step 4: Update Configuration
```typescript
// In apps/web/utils/config.ts:
export const authRoutes = [
  // AUTH PAGES
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/reset-password",
  "/auth/new-password",
  "/verify-email",

  //PUBLIC
  "/",
  "/rm",
  "/home",
  "/api/inngest",
  // Remove "/stay-tuned" from this list
];

export const DEFAULT_LOGIN_REDIRECT = "/switch-org";
```

#### Step 5: Restore Auth Configuration
```typescript
// In apps/web/lib/auth.ts:
checkout({
  authenticatedUsersOnly: true,
  successUrl: "/dashboard",
}),
```

#### Step 6: Restore Feature Page
```typescript
// In apps/web/app/(dashboard)/features/[id]/page.tsx:
if (!feature) {
  return redirect("/dashboard");
}
```

#### Step 7: Remove Test and Stay Tuned Pages (Optional)
```bash
rm -rf apps/web/app/stay-tuned/
rm -rf apps/web/app/test-middleware/
```

### Option 3: Feature Flag Approach

Instead of removing the code, you can add a feature flag:

```typescript
// Add to your environment variables
NEXT_PUBLIC_ENABLE_PRODUCTION_RESTRICTION=false

// Then update the middleware check:
const isProduction = process.env.NODE_ENV === "production" && 
                    process.env.NEXT_PUBLIC_ENABLE_PRODUCTION_RESTRICTION === "true";
```

## Testing the System

### Test Production Mode Locally
```bash
NODE_ENV=production npm run dev
```

### Test Development Mode
```bash
NODE_ENV=development npm run dev
# or just
npm run dev
```

### Test Middleware Functionality
Visit `/test-middleware` to see:
- Current NODE_ENV value
- Production status
- Request headers
- Middleware execution status

## Monitoring and Debugging

### Check Current Environment
```typescript
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Is Production:", process.env.NODE_ENV === "production");
```

### Debug Middleware
The middleware now includes comprehensive logging:
```typescript
console.log("🔍 Middleware Debug:");
console.log("  - Pathname:", request.nextUrl.pathname);
console.log("  - NODE_ENV:", process.env.NODE_ENV);
console.log("  - Is Production:", isProduction);
console.log("  - Has Session:", !!session);
console.log("  - Is Auth API Route:", isAuthApiRoute);
console.log("  - Is Auth Route:", isAuthRoute);
```

### Common Issues and Solutions

1. **Dashboard still accessible in production**
   - Check if NODE_ENV is set to "production"
   - Verify middleware is being executed (check logs)
   - Ensure dashboard layout has production check

2. **Infinite redirect loops**
   - Check that `/stay-tuned` is in authRoutes
   - Verify middleware matcher is correct
   - Ensure stay-tuned page exists

3. **Middleware not executing**
   - Check middleware matcher configuration
   - Verify file is in correct location (`apps/web/middleware.ts`)
   - Check for syntax errors in middleware

## Security Considerations

- The system only affects the frontend routing
- API routes are not affected by this restriction
- Authentication still works normally
- Users can still sign up and sign in
- The restriction is purely for user experience
- Multiple layers of protection ensure robust blocking

## Rollback Checklist

When you're ready to launch:

- [ ] Set `NODE_ENV` to production
- [ ] Verify dashboard access is restored
- [ ] Test authentication flow
- [ ] Verify all redirects work correctly
- [ ] Remove or update the stay-tuned page
- [ ] Remove test middleware page
- [ ] Update any hardcoded references to stay-tuned
- [ ] Remove debug logging from middleware

## Notes

- The stay-tuned page is designed to be beautiful and engaging
- Users can still sign out and access auth pages
- The system is designed to be easily reversible
- All changes are environment-aware and won't affect development
- Multiple protection layers ensure robust blocking
- Debug logging helps troubleshoot issues in production

---

**Last Updated**: [Current Date]
**Version**: 2.0
**Status**: Active in Production with Multi-Layer Protection 