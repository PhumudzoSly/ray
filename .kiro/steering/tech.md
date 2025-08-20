# Technology Stack

## Build System & Package Management

- **pnpm**: Fast monorepo package manager (v10.4.1+)
- **TurboRepo**: Task runner and build system optimization
- **Node.js**: Runtime environment (>=20)
- **TypeScript**: Strict typing throughout (v5.8.3)

## Frontend Stack

- **Next.js**: React framework (v15.4.4) with App Router
- **React**: UI library (v19.1.0)
- **Tailwind CSS**: Utility-first styling (v4.1.11)
- **shadcn/ui**: Component library via @workspace/ui
- **Framer Motion**: Animations and interactions
- **Radix UI**: Accessible component primitives

## Backend & Database

- **Prisma**: Database ORM and migrations
- **PostgreSQL**: Primary database
- **Redis**: Caching and session storage (@upstash/redis)
- **Better Auth**: Authentication system

## AI & Research Tools

- **OpenAI SDK**: AI model integration (@ai-sdk/openai)
- **Google AI SDK**: Alternative AI provider (@ai-sdk/google)
- **Inngest**: Workflow orchestration for research processes
- **Exa**: Web search and data collection

## Real-time & Collaboration

- **BlockNote**: Rich text editor with collaboration
- **React Query**: Server state management

## Code Quality & Formatting

- **Biome**: Linting and formatting (replaces ESLint/Prettier)
- **Husky**: Git hooks for pre-commit checks
- **Vitest**: Testing framework

## Common Commands

### Development

```bash
pnpm install           # Install all dependencies
pnpm dev               # Start all apps in development
pnpm build             # Build all packages and apps
pnpm start             # Start production builds
```

### Individual Apps

```bash
pnpm --filter web dev      # Web app (localhost:3000)
pnpm --filter docs dev     # Docs (localhost:3001)
pnpm --filter landing dev  # Landing (localhost:3002)
```

### Code Quality

```bash
pnpm lint              # Lint all packages with Biome
pnpm format            # Format all code with Biome
pnpm typecheck         # TypeScript compilation check
pnpm test              # Run all tests
pnpm health            # Complete health check
```

### Database Operations

```bash
pnpm db:generate       # Generate Prisma client
pnpm db:migrate        # Run database migrations
pnpm db:push           # Push schema changes
pnpm db:studio         # Open Prisma Studio
```

### Package Management

```bash
pnpm dedupe            # Remove duplicate dependencies
pnpm outdated          # Check for outdated packages
pnpm update            # Update all dependencies
pnpm depcheck          # Check for circular dependencies
```

## Architecture Patterns

- **Monorepo**: Shared packages with workspace references
- **Component-driven**: Reusable UI components in @workspace/ui
- **Type-safe**: Zod schemas for runtime validation
- **Server Actions**: Next.js server actions for mutations
- **Workflow-based**: Inngest for complex research orchestration
