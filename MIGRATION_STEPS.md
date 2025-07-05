# Quick Migration Steps for Production

## 1. Set Production Database URL

```bash
export PRODUCTION_DATABASE_URL='postgresql://username:password@host:port/database_name'
```

## 2. Test Connection (Optional)

```bash
psql $PRODUCTION_DATABASE_URL -c "SELECT 1"
```

## 3. Backup Production Database (IMPORTANT!)

```bash
# Create backup
pg_dump $PRODUCTION_DATABASE_URL > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql
```

## 4. Run Dry Run First

This shows what will be executed without actually running it:

```bash
./scripts/migrate-database.sh -e production --dry-run
```

## 5. Run Actual Migration

If the dry run looks good, proceed with the actual migration:

```bash
./scripts/migrate-database.sh -e production
```

The script will:
- Create migration tracking table
- Apply all pending migrations in order
- Skip any migrations that were already applied
- Record execution time and who ran each migration

## 6. Verify Migration

After migration completes:

```bash
# Check migration status
./scripts/migrate-database.sh -e production -l

# Connect to verify tables
psql $PRODUCTION_DATABASE_URL

# In psql, check tables
\dt lms_*
\dt student_*
\d lms_simulations
\d lms_exercises
\q
```

## Important Notes

- The script will ask for confirmation before running on production
- Each migration is tracked, so you can safely re-run the script
- If a migration fails, the script stops (already applied migrations are safe)
- Always backup before migrating production!

## If You Need to Rollback

1. Restore from backup:
```bash
psql $PRODUCTION_DATABASE_URL < backup_before_migration_YYYYMMDD_HHMMSS.sql
```

## Migration Order

The critical migrations for your simulation features are:
1. 001_create_tables.sql - Base tables
2. 004_create_simulation_tables.sql - Simulation tracking
3. 005_create_exercise_tables.sql - Exercise system
4. 019-024 - Virtual lab specific tables and enhancements

All migrations will be applied in alphabetical order automatically.