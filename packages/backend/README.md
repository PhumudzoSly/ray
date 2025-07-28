# Backend Package - Prisma Database Management

This package contains the shared Prisma schema and database client used by both the `landing` and `web` applications.

## Database Migration Workflow

### Development Environment

1. **Generate Prisma Client** (after schema changes):
   ```bash
   pnpm db:generate
   ```

2. **Create and apply migrations**:
   ```bash
   pnpm db:migrate
   ```

3. **Open Prisma Studio** (for database inspection):
   ```bash
   pnpm db:studio
   ```

### Production Environment

#### Option 1: Using Migrations (Recommended)

1. **Deploy migrations** (applies pending migrations):
   ```bash
   pnpm db:migrate:deploy
   ```

2. **Generate Prisma Client** (if needed):
   ```bash
   pnpm db:generate
   ```

#### Option 2: Using Database Push (Development/Staging only)

⚠️ **Warning**: Only use this for development or staging environments. Never use `db:push` in production as it can cause data loss.

```bash
pnpm db:push
```

## Environment Variables

Ensure your production environment has the following variables:

```env
DATABASE_URL="postgresql://username:password@host:port/database"
```

## Migration Best Practices

1. **Always test migrations locally** before deploying to production
2. **Use migrations for production** - never use `db:push` in production
3. **Backup your database** before running migrations
4. **Run migrations during low-traffic periods**
5. **Monitor migration logs** for any errors

## Deployment Checklist

Before deploying to production:

- [ ] Test migrations locally with production-like data
- [ ] Ensure all apps are using the same Prisma client version
- [ ] Verify environment variables are correctly set
- [ ] Backup production database
- [ ] Run `pnpm db:migrate:deploy` in production
- [ ] Verify database schema matches expectations

## Troubleshooting

### Common Issues

1. **Migration conflicts**: Reset local migrations and recreate them
2. **Client generation issues**: Clear node_modules and regenerate
3. **Connection issues**: Verify DATABASE_URL and network connectivity

### Commands for Debugging

```bash
# Check migration status
npx prisma migrate status

# Reset local database (development only)
npx prisma migrate reset

# View migration history
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma
``` 