# 🚀 Contributing to Ray Monorepo

> **Building world-class open-source software with uncompromising quality**

Thank you for your interest in contributing to Ray! We maintain the highest standards for code quality, developer experience, and UI consistency. This guide will help you contribute effectively to our Linear/Notion-inspired open-source monorepo.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Health Checks](#-health-checks)
- [Code Standards](#-code-standards)
- [UI Guidelines](#-ui-guidelines)
- [Development Workflow](#-development-workflow)
- [Quality Assurance](#-quality-assurance)
- [Package Management](#-package-management)
- [Pull Request Process](#-pull-request-process)
- [Community Guidelines](#-community-guidelines)
- [Troubleshooting](#-troubleshooting)

## 🏁 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (required for workspace management)
- **Git** with proper SSH/HTTPS setup

### Initial Setup

```bash
# Clone the repository
git clone <repo-url>
cd ray

# Install all dependencies (this may take a few minutes)
pnpm install

# Verify installation
pnpm run health-check

# Start development environment
pnpm dev
```

## 🏥 Health Checks

We provide comprehensive health checks to ensure your development environment is properly configured:

### Manual Health Checks

```bash
# Run all health checks
pnpm run health-check

# Individual checks
pnpm run typecheck        # TypeScript compilation
pnpm run lint             # Biome linting
pnpm run format:check     # Code formatting
pnpm run test             # Unit tests (if available)
pnpm run build            # Production build test
```

### Automated Health Monitoring

```bash
# Watch mode for development
pnpm run dev:health       # Runs dev with health monitoring

# Pre-commit health check (runs automatically via Husky)
pnpm run pre-commit       # Lint + format + typecheck
```

### Health Check Indicators

- ✅ **Green**: All systems operational
- ⚠️ **Yellow**: Warnings present (review recommended)
- ❌ **Red**: Critical issues (must fix before committing)

## 📐 Code Standards

### TypeScript Excellence

- **Strict Mode**: All code must pass `strict: true` TypeScript checks
- **No `any` Types**: Use proper typing or `unknown` with type guards
- **Explicit Return Types**: For all public functions and methods
- **Interface Over Type**: Prefer interfaces for object shapes

```typescript
// ✅ Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

function getUserProfile(id: string): Promise<UserProfile> {
  // implementation
}

// ❌ Bad
function getUserProfile(id: any): any {
  // implementation
}
```

### Code Quality Tools

- **Biome**: Our primary linter and formatter
- **Husky**: Pre-commit hooks for quality gates
- **TypeScript**: Strict type checking
- **Turbo**: Build system optimization

### File Organization

```
packages/
├── ui/                   # Shared UI components
├── backend/              # Prisma + Postgres backend
└── typescript-config/    # Shared TS configs

apps/
├── web/                  # Main web application
├── docs/                 # Documentation site
└── landing/              # Landing page
```

## 🎨 UI Guidelines

### Design System Principles

- **Minimal**: Clean, uncluttered interfaces
- **Consistent**: Uniform spacing, typography, and interactions
- **Accessible**: WCAG 2.1 AA compliance
- **Responsive**: Mobile-first design approach

### Shadcn/UI Standards

``tsx
// ✅ Use shadcn color variables
className = "bg-background text-foreground border-border";

// ❌ Never use custom colors
className = "bg-blue-500 text-white border-gray-300";

````

### Component Guidelines

- **No Card Overuse**: Prefer clean layouts with proper spacing
- **Icon Integration**: Use Lucide React icons consistently
- **Interactive States**: Proper hover, focus, and active states
- **Loading States**: Skeleton components for better UX

### Quality Checklist

- [ ] Uses only shadcn color variables
- [ ] Follows Linear/Notion aesthetic
- [ ] Responsive across all breakpoints
- [ ] Accessible keyboard navigation
- [ ] Proper loading and error states
- [ ] Consistent spacing (4px grid system)

## 🔄 Development Workflow

### Branch Strategy

```bash
# Feature branches
git checkout -b feat/user-authentication
git checkout -b feat/tiptap-editor-improvements

# Bug fixes
git checkout -b fix/editor-crash-on-paste

# Documentation
git checkout -b docs/contributing-guide

# Refactoring
git checkout -b refactor/api-client-structure
````

### Commit Convention

We follow [Conventional Commits](https://conventionalcommits.org/):

```bash
# Features
git commit -m "feat: add slash command support to editor"

# Bug fixes
git commit -m "fix: resolve editor crash on table insertion"

# Documentation
git commit -m "docs: update contributing guidelines"

# Refactoring
git commit -m "refactor: extract editor extensions to separate files"

# Breaking changes
git commit -m "feat!: migrate to new authentication system"
```

## 🔍 Quality Assurance

### Pre-Commit Checklist

Before every commit, ensure:

- [ ] Code passes all linting rules
- [ ] TypeScript compilation succeeds
- [ ] Code is properly formatted
- [ ] No console.log statements in production code
- [ ] All imports are used and properly ordered
- [ ] Component props are properly typed

### Testing Strategy

```bash
# Unit tests
pnpm run test

# Type checking
pnpm run typecheck

# Integration tests (if available)
pnpm run test:integration

# E2E tests (if available)
pnpm run test:e2e
```

### Performance Monitoring

- **Bundle Analysis**: Regular bundle size monitoring
- **Core Web Vitals**: LCP, FID, CLS optimization
- **Lighthouse Scores**: Target 90+ for all metrics
- **Memory Usage**: Monitor for memory leaks

## 📦 Package Management

### Adding Dependencies

```bash
# Add to specific workspace
pnpm add react-query --filter=web

# Add to root (affects all workspaces)
pnpm add -w typescript

# Add dev dependency
pnpm add -D @types/node --filter=web
```

### Package Creation

```bash
# Create new package
mkdir packages/my-package
cd packages/my-package

# Initialize with workspace template
pnpm init
# Add to pnpm-workspace.yaml
```

### Dependency Health

- **Regular Updates**: Use Renovate for automated updates
- **Security Audits**: Regular `pnpm audit` checks
- **License Compliance**: Ensure all dependencies are properly licensed

## 🔀 Pull Request Process

### PR Checklist

- [ ] **Branch**: Created from latest `main`
- [ ] **Health**: All health checks pass
- [ ] **Tests**: New features include tests
- [ ] **Docs**: Documentation updated if needed
- [ ] **Breaking**: Breaking changes documented
- [ ] **Performance**: No performance regressions

### PR Template

```
## 🎯 Purpose

Brief description of what this PR accomplishes.

## 🔄 Changes

- List of specific changes made
- Any breaking changes highlighted

## 🧪 Testing

- How the changes were tested
- Any new test cases added

## 📸 Screenshots

Visual changes (if applicable)

## 🔗 Related Issues

Closes #123
```

### Review Process

1. **Automated Checks**: Must pass all CI/CD checks
2. **Code Review**: At least one approval required
3. **Design Review**: UI changes reviewed by design team
4. **Performance Review**: Performance impact assessed

## 🛠️ Troubleshooting

### Common Issues

#### Dependency Problems

```bash
# Clear all node_modules and reinstall
pnpm clean
pnpm install

# Reset pnpm cache
pnpm store prune
```

#### TypeScript Errors

```bash
# Restart TypeScript server
# In VS Code: Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"

# Check TypeScript version alignment
pnpm run typecheck --verbose
```

#### Build Failures

```bash
# Clean build cache
pnpm run clean
pnpm run build

# Check for circular dependencies
pnpm run build --verbose
```

### Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Code Review**: Tag `@maintainers` for urgent reviews

## 🌟 Excellence Standards

> "Quality is not an act, it is a habit" - Aristotle

We don't compromise on quality. Every line of code should reflect our commitment to excellence:

- **Code Quality**: Clean, readable, maintainable
- **User Experience**: Intuitive, fast, accessible
- **Developer Experience**: Well-documented, easy to contribute
- **Performance**: Optimized, efficient, scalable
- **Security**: Secure by design, regular audits

## 🤝 Community Guidelines

As an open-source project, we welcome contributions from everyone. Please adhere to our community guidelines:

- **Be Respectful**: Treat all contributors with respect and kindness
- **Be Inclusive**: Welcome people of all backgrounds and identities
- **Be Constructive**: Provide helpful feedback and criticism
- **Be Collaborative**: Work together to solve problems
- **Follow Standards**: Adhere to our coding and contribution standards

### Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Harassment, discrimination, or offensive behavior will not be tolerated
- All communication should be appropriate for a professional audience
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism

## 🎖️ Recognition

We appreciate every contribution! Contributors are recognized through:

- **GitHub Contributors**: Listed in repository
- **Changelog**: Major contributions highlighted
- **Community**: Shoutouts in project updates

Thank you for helping us build something extraordinary! 🚀

---

_Last updated: $(date)_
_For questions, open an issue or start a discussion._
