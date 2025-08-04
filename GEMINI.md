# Gemini Project: Ray Monorepo

## Project Overview

This is a modern monorepo for a web application, documentation site, and landing page. It is built with a focus on developer experience and performance, utilizing the following technologies:

*   **Frameworks:** Next.js for the `web`, `docs`, and `landing` applications.
*   **Monorepo Management:** pnpm and Turborepo for efficient package management and task running.
*   **Backend:** A PostgreSQL database with Prisma for the ORM, located in the `packages/backend` directory.
*   **UI:** A shared UI component library in `packages/ui`.
*   **Tooling:**
    *   **TypeScript** for static typing.
    *   **Biome** for linting and formatting.
    *   **Vitest** for testing.
    *   **Husky** for pre-commit hooks.

The project is structured as a monorepo with applications in the `apps` directory and shared packages in the `packages` directory.

## Building and Running

### Prerequisites

*   Node.js (>=20)
*   pnpm

### Installation

```sh
pnpm install
```

### Development

To run all applications in development mode:

```sh
pnpm dev
```

To run a specific application:

```sh
# Start the main web app (http://localhost:3000)
pnpm --filter web dev

# Start the documentation site (http://localhost:3001)
pnpm --filter docs dev

# Start the landing page (http://localhost:3002)
pnpm --filter landing dev
```

### Building

To build all applications for production:

```sh
pnpm build
```

### Testing

To run the test suite:

```sh
pnpm test
```

### Database

The backend uses Prisma for database management. The following commands are available:

*   `pnpm db:generate`: Generate Prisma client.
*   `pnpm db:migrate`: Run database migrations.
*   `pnpm db:push`: Push the Prisma schema to the database.
*   `pnpm db:studio`: Open Prisma Studio.

## Development Conventions

*   **Code Style:** Code is formatted and linted using Biome. Use `pnpm format` to format and `pnpm lint` to lint.
*   **Commits:** Pre-commit hooks are managed by Husky to ensure code quality before committing.
*   **Contributing:** Contribution guidelines are available in `CONTRIBUTING.md`.
*   **Dependencies:** Use `pnpm` to manage dependencies. Shared dependencies are located in the `packages` directory.
