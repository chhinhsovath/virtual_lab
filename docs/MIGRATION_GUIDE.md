# Database Migration Guide

This guide explains how to migrate your Virtual Lab database from local development to production.

## Prerequisites

1. PostgreSQL client tools installed (`psql` command)
2. Access to both local and production databases
3. Production database connection string

## Setting Up

### 1. Set Production Database URL

First, export your production database URL as an environment variable:

```bash
export PRODUCTION_DATABASE_URL='postgresql://username:password@host:port/database_name'
```

For security, you can also add this to your shell profile (`~/.bashrc` or `~/.zshrc`).

### 2. Check Current Migration Status

List all migrations and see which ones have been applied:

```bash
./scripts/migrate-database.sh -l
```

## Migration Process

### Option 1: Migrate All Pending Migrations (Recommended)

This will apply all migrations that haven't been run yet:

```bash
# Dry run first to see what will be executed
./scripts/migrate-database.sh -e production --dry-run

# If everything looks good, run the actual migration
./scripts/migrate-database.sh -e production
```

### Option 2: Migrate Specific Migrations

If you want to run specific migrations:

```bash
# Run a single migration
./scripts/migrate-database.sh -e production -m 024_add_student_profile_fields.sql
```

### Option 3: Manual Migration (Alternative)

If you prefer to run migrations manually:

```bash
# Connect to production database
psql $PRODUCTION_DATABASE_URL

# First, create the migration tracking table
\i migrations/000_create_migration_tracking.sql

# Then run each migration in order
\i migrations/001_create_tables.sql
\i migrations/004_create_simulation_tables.sql
\i migrations/005_create_exercise_tables.sql
# ... continue with other migrations
```

## Important Migrations for Virtual Lab

Based on your current setup, these are the critical migrations for the simulation features:

1. **000_create_migration_tracking.sql** - Migration tracking system
2. **001_create_tables.sql** - Base TaRL tables
3. **004_create_simulation_tables.sql** - Simulation tracking tables
4. **005_create_exercise_tables.sql** - Exercise system tables
5. **019_virtual_lab_schema_transformation.sql** - Virtual lab transformations
6. **020_stem_simulations_seed_data.sql** - Simulation seed data
7. **021_user_roles_virtual_lab.sql** - User roles for virtual lab
8. **022_complete_virtual_lab_transformation.sql** - Complete transformation
9. **023_create_student_tables.sql** - Student-specific tables
10. **024_add_student_profile_fields.sql** - Student profile enhancements

## Safety Checks

Before running migrations on production:

1. **Backup your database**:
   ```bash
   pg_dump $PRODUCTION_DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Test on staging** (if available):
   ```bash
   ./scripts/migrate-database.sh -e staging
   ```

3. **Review migration files** to ensure they won't conflict with existing data

## Troubleshooting

### Connection Issues

If you can't connect to the production database:
- Verify the connection string is correct
- Check if your IP is whitelisted (for cloud databases)
- Ensure SSL is configured if required

### Migration Failures

If a migration fails:
1. Check the error message for details
2. The script will stop at the failed migration
3. Fix the issue and re-run (already applied migrations will be skipped)

### Rollback

To rollback migrations, you'll need to:
1. Create rollback scripts for each migration
2. Run them in reverse order
3. Remove entries from `schema_migrations` table

## Best Practices

1. **Always backup before migrating production**
2. **Test migrations on a staging environment first**
3. **Run migrations during low-traffic periods**
4. **Monitor application logs after migration**
5. **Have a rollback plan ready**

## Quick Commands Reference

```bash
# List migration status
./scripts/migrate-database.sh -l

# Dry run on production
./scripts/migrate-database.sh -e production --dry-run

# Run all pending migrations on production
./scripts/migrate-database.sh -e production

# Run specific migration
./scripts/migrate-database.sh -e production -m 024_add_student_profile_fields.sql

# Force re-run migrations (use with caution!)
./scripts/migrate-database.sh -e production --force
```

## After Migration

1. Verify all tables were created correctly:
   ```sql
   -- Connect to production database
   psql $PRODUCTION_DATABASE_URL
   
   -- List all tables
   \dt
   
   -- Check specific tables
   \d lms_simulations
   \d lms_exercises
   \d student_simulation_progress
   ```

2. Test the application functionality
3. Monitor error logs for any issues
4. Update your deployment documentation