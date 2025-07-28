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
```

**What it does**:
- Checks if the app is running in production
- Redirects authenticated users to `/stay-tuned` unless they're already on that page
- Maintains normal auth route protection

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

### 3. Configuration (`apps/web/utils/config.ts`)
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

### 4. Auth Configuration (`apps/web/lib/auth.ts`)
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

### 5. Feature Page (`apps/web/app/(dashboard)/features/[id]/page.tsx`)
**Purpose**: Feature-specific redirect logic

**Changes Made**:
```typescript
if (!feature) {
  return redirect(process.env.NODE_ENV === "production" ? "/stay-tuned" : "/dashboard");
}
```

**What it does**:
- Redirects to `/stay-tuned` in production when a feature doesn't exist

### 6. Stay Tuned Page (`apps/web/app/stay-tuned/page.tsx`)
**Purpose**: New page for production users

**Features**:
- Beautiful, modern UI with shadcn components
- Encourages users to think about their next SaaS idea
- Provides "Go Back" and "Sign Out" functionality
- Matches Linear/Noton aesthetic

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

#### Step 3: Update Configuration
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

#### Step 4: Restore Auth Configuration
```typescript
// In apps/web/lib/auth.ts:
checkout({
  authenticatedUsersOnly: true,
  successUrl: "/dashboard",
}),
```

#### Step 5: Restore Feature Page
```typescript
// In apps/web/app/(dashboard)/features/[id]/page.tsx:
if (!feature) {
  return redirect("/dashboard");
}
```

#### Step 6: Remove Stay Tuned Page (Optional)
```bash
rm -rf apps/web/app/stay-tuned/
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

## Monitoring and Debugging

### Check Current Environment
```typescript
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Is Production:", process.env.NODE_ENV === "production");
```

### Debug Middleware
Add logging to `apps/web/middleware.ts`:
```typescript
console.log("Request path:", request.nextUrl.pathname);
console.log("Is production:", isProduction);
console.log("Has session:", !!session);
```

## Security Considerations

- The system only affects the frontend routing
- API routes are not affected by this restriction
- Authentication still works normally
- Users can still sign up and sign in
- The restriction is purely for user experience

## Rollback Checklist

When you're ready to launch:

- [ ] Set `NODE_ENV` to production
- [ ] Verify dashboard access is restored
- [ ] Test authentication flow
- [ ] Verify all redirects work correctly
- [ ] Remove or update the stay-tuned page
- [ ] Update any hardcoded references to stay-tuned

## Notes

- The stay-tuned page is designed to be beautiful and engaging
- Users can still sign out and access auth pages
- The system is designed to be easily reversible
- All changes are environment-aware and won't affect development

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Status**: Active in Production 