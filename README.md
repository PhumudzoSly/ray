# Ray Monorepo

A modern open-source monorepo for web, docs, and landing apps, powered by Next.js, TurboRepo, pnpm, and a custom UI package.

## About

Ray is an open-source SaaS idea validation and product development platform that combines project management with AI-powered market research and validation tools. It helps entrepreneurs and product teams validate their ideas, conduct market research, and build products users love.

## Monorepo Structure

```
apps/
  web/      # Main web app (Next.js)
  docs/     # Documentation app (Next.js + Fumadocs)
  landing/  # Marketing/landing app (Next.js)
packages/
  ui/       # Shared UI components
  backend/  # Prisma + Postgres backend
  typescript-config/ # Shared TS configs
  eslint-config/     # (removed, replaced by Biome)
```

## Tooling

- **pnpm**: Fast monorepo package manager
- **TurboRepo**: Task runner for builds, lint, dev, etc.
- **Biome**: Linting and formatting (replaces ESLint/Prettier)
- **Husky**: Pre-commit hooks for code quality
- **TypeScript**: Strict typing everywhere
- **Postgres and Prisma**: Backend as a service

## Getting Started

```sh
pnpm install           # Install all dependencies
pnpm dev               # Start all apps and backend in dev mode
pnpm lint              # Lint all packages with Biome
pnpm format            # Format all code with Biome
```

## Running Individual Apps

```sh
pnpm --filter web dev      # Start web app (http://localhost:3000)
pnpm --filter docs dev     # Start docs app (http://localhost:3001)
pnpm --filter landing dev  # Start landing app (http://localhost:3002)
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

Inspired by Linear, Notion, and shadcn/ui. High attention to detail, minimal UI, and best-in-class DX.
