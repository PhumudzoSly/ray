# Project Structure

## Monorepo Organization

```
ray/
├── apps/                    # Applications
│   ├── web/                # Main SaaS application (port 3000)
│   ├── docs/               # Documentation site (port 3001)
│   └── landing/            # Marketing landing page (port 3002)
├── packages/               # Shared packages
│   ├── ui/                 # Shared UI components (@workspace/ui)
│   ├── backend/            # Prisma backend (@workspace/backend)
│   └── typescript-config/  # Shared TypeScript configs
└── [config files]         # Root configuration
```

## Application Structure

### Web App (`apps/web/`)

Main SaaS application with the following key directories:

- `app/` - Next.js App Router pages and layouts
- `components/` - App-specific React components
- `inngest/` - Workflow functions and research orchestration
- `lib/` - Utility functions and configurations
- `types/` - TypeScript type definitions
- `schemas/` - Zod validation schemas
- `actions/` - Server actions for mutations
- `hooks/` - Custom React hooks
- `context/` - React context providers

### Documentation (`apps/docs/`)

Built with Fumadocs for technical documentation:

- `app/` - Next.js pages
- `content/` - MDX documentation files
- `lib/` - Documentation utilities

### Landing Page (`apps/landing/`)

Marketing site with:

- `app/` - Next.js pages and layouts
- `components/` - Landing-specific components
- `actions/` - Server actions for forms/contact

## Shared Packages

### UI Package (`packages/ui/`)

Centralized component library:

- `src/components/` - Reusable UI components (shadcn/ui based)
- `src/lib/` - Utility functions
- `src/hooks/` - Shared React hooks
- `src/styles/` - Global CSS and Tailwind styles

### Backend Package (`packages/backend/`)

Database and backend utilities:

- `prisma/` - Database schema and migrations
- `prompts/` - AI prompt templates
- `index.ts` - Exported utilities and types

### TypeScript Config (`packages/typescript-config/`)

Shared TypeScript configurations:

- `base.json` - Base TypeScript config
- `nextjs.json` - Next.js specific config
- `react-library.json` - React library config

## Configuration Files

### Root Level

- `package.json` - Root package with workspace scripts
- `turbo.json` - TurboRepo task configuration
- `pnpm-workspace.yaml` - pnpm workspace definition
- `tsconfig.json` - Root TypeScript config
- `biome.json` - Biome linting/formatting config

### App Level

Each app contains:

- `package.json` - App-specific dependencies
- `next.config.mjs` - Next.js configuration
- `tsconfig.json` - App TypeScript config
- `components.json` - shadcn/ui configuration
- `postcss.config.mjs` - PostCSS configuration

## Import Patterns

### Workspace References

```typescript
// Import from shared UI package
import { Button } from "@workspace/ui/components/button";

// Import from backend package
import { prisma } from "@workspace/backend";
```

### Internal Imports

```typescript
// Relative imports within same app
import { validateInput } from "../lib/validation";
import { UserProfile } from "../types/user";

// Absolute imports from app root
import { api } from "@/lib/api";
```

## File Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Pages**: kebab-case (`user-settings/page.tsx`)
- **Types**: camelCase with descriptive names (`userTypes.ts`)
- **Schemas**: camelCase ending in Schema (`userSchema.ts`)

## Key Directories to Know

- `apps/web/inngest/` - Research workflow orchestration
- `packages/backend/prisma/` - Database schema and migrations
- `packages/ui/src/components/` - Reusable UI components
- `.kiro/` - Kiro-specific configuration and specs
- `.husky/` - Git hooks configuration
