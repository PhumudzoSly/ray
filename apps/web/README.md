# Ray Web App

This is the main web application for Ray, built with Next.js.

## Environment Variables

Create a `.env.local` file in the `apps/web` directory with the following variables:

### Required for Production

```bash

# Database
DATABASE_URL=your_database_url_here

# Authentication
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Dodo (Billing)
DODO_PAYMENTS_API_KEY=dodo_payments_api_key
DODO_WEBHOOK_SECRET=your_dodo_webhook_secret
DODO_STARTER_PLAN=your_starter_plan_id
DODO_PRO_PLAN=your_business_plan_id
DODO_ENTERPRISE_PLAN=your_enterprise_plan_id

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com

# GitHub Integration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret



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
