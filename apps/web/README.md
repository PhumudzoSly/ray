# Ray Web App

This is the main web application for Ray, built with Next.js.

## Environment Variables

Create a `.env.local` file in the `apps/web` directory with the following variables:

### Required for Production

```bash
# Inngest Configuration
INNGEST_EVENT_KEY=your_inngest_event_key_here

# Database
DATABASE_URL=your_database_url_here

# Authentication
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Polar (Billing)
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
POLAR_STARTER_PRICING=your_starter_plan_id
POLAR_BUSINESS_PRICING=your_business_plan_id
POLAR_PRICE_ENTERPRISE=your_enterprise_plan_id

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com

# GitHub Integration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret

# Liveblocks
LIVEBLOCKS_SECRET_KEY=your_liveblocks_secret_key

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Link Preview API
LINK_PREVIEW_API_KEY=your_link_preview_api_key
```

### Development Only

For local development, you can run without some of these variables, but you'll need:

```bash
# Required for development
DATABASE_URL=your_local_database_url
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional for development (features will be disabled if not provided)
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
```

## Inngest Configuration

The app uses Inngest for background job processing. In development mode, Inngest can run without an event key for local testing. In production, you need to:

1. Sign up for Inngest Cloud at https://cloud.inngest.com
2. Create a new app
3. Get your event key from the dashboard
4. Set the `INNGEST_EVENT_KEY` environment variable

## Running the App

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Features

- User authentication with Google OAuth
- Organization management
- Idea validation with AI
- Project management
- Roadmap planning
- Waitlist management
- GitHub integration
- Real-time collaboration with Liveblocks 