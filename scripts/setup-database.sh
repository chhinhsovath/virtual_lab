#!/bin/bash

# Virtual Lab Database Setup Script
# This script sets up the database and runs all migrations

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment is specified
if [ -z "$1" ]; then
    print_error "Usage: $0 [local|production]"
    exit 1
fi

ENVIRONMENT=$1

# Set environment variables based on argument
if [ "$ENVIRONMENT" = "local" ]; then
    print_status "Setting up LOCAL database..."
    export PGUSER=postgres
    export PGHOST=localhost
    export PGDATABASE=virtual_lab
    export PGPASSWORD=12345
    export PGPORT=5432
elif [ "$ENVIRONMENT" = "production" ]; then
    print_status "Setting up PRODUCTION database..."
    export PGUSER=postgres
    export PGHOST=137.184.109.21
    export PGDATABASE=virtual_lab
    export PGPASSWORD="P@ssw0rd"
    export PGPORT=5432
else
    print_error "Invalid environment. Use 'local' or 'production'"
    exit 1
fi

print_status "Environment: $ENVIRONMENT"
print_status "Database: $PGDATABASE"
print_status "Host: $PGHOST"
print_status "User: $PGUSER"

# Check if PostgreSQL client is installed
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL client (psql) is not installed"
    print_status "Install it with: brew install postgresql (macOS) or apt-get install postgresql-client (Ubuntu)"
    exit 1
fi

# Test database connection
print_status "Testing database connection..."
if ! psql -h "$PGHOST" -U "$PGUSER" -d postgres -c "SELECT 1;" &> /dev/null; then
    print_error "Cannot connect to database server"
    print_status "Please check your connection settings and ensure the database server is running"
    exit 1
fi

# Create database if it doesn't exist
print_status "Creating database '$PGDATABASE' if it doesn't exist..."
psql -h "$PGHOST" -U "$PGUSER" -d postgres -c "CREATE DATABASE $PGDATABASE;" 2>/dev/null || {
    print_warning "Database '$PGDATABASE' might already exist or creation failed"
}

# Check if we can connect to the target database
print_status "Verifying connection to target database..."
if ! psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -c "SELECT 1;" &> /dev/null; then
    print_error "Cannot connect to database '$PGDATABASE'"
    exit 1
fi

print_status "✅ Database connection successful!"

# Create migrations directory if it doesn't exist
MIGRATIONS_DIR="$(dirname "$0")/../migrations"
if [ ! -d "$MIGRATIONS_DIR" ]; then
    print_error "Migrations directory not found: $MIGRATIONS_DIR"
    exit 1
fi

print_status "Found migrations directory: $MIGRATIONS_DIR"

# Function to check if migration was already applied
migration_exists() {
    local migration_name=$1
    local result=$(psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -t -c "
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_name = 'schema_migrations';
    " 2>/dev/null || echo "0")
    
    if [ "$(echo $result | tr -d ' ')" = "0" ]; then
        return 1  # migrations table doesn't exist
    fi
    
    local count=$(psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -t -c "
        SELECT COUNT(*) FROM schema_migrations 
        WHERE migration_name = '$migration_name';
    " 2>/dev/null || echo "0")
    
    [ "$(echo $count | tr -d ' ')" != "0" ]
}

# Create schema_migrations table if it doesn't exist
print_status "Creating schema_migrations table..."
psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -c "
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) UNIQUE NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
" > /dev/null

# Create update_updated_at_column function if it doesn't exist
print_status "Creating helper functions..."
psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -c "
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
\$\$ language 'plpgsql';
" > /dev/null

# Run migrations in order
print_status "Running database migrations..."

# Get list of migration files sorted by name
MIGRATION_FILES=$(find "$MIGRATIONS_DIR" -name "*.sql" -type f | sort)

if [ -z "$MIGRATION_FILES" ]; then
    print_warning "No migration files found in $MIGRATIONS_DIR"
    exit 0
fi

APPLIED_COUNT=0
SKIPPED_COUNT=0

for migration_file in $MIGRATION_FILES; do
    migration_name=$(basename "$migration_file" .sql)
    
    if migration_exists "$migration_name"; then
        print_status "⏭️  Skipping $migration_name (already applied)"
        SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
        continue
    fi
    
    print_status "🚀 Applying migration: $migration_name"
    
    # Run the migration
    if psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -f "$migration_file" > /dev/null 2>&1; then
        # Record successful migration
        psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -c "
            INSERT INTO schema_migrations (migration_name) VALUES ('$migration_name');
        " > /dev/null
        print_status "✅ Successfully applied: $migration_name"
        APPLIED_COUNT=$((APPLIED_COUNT + 1))
    else
        print_error "❌ Failed to apply migration: $migration_name"
        print_status "Check the migration file for syntax errors: $migration_file"
        exit 1
    fi
done

print_status "🎉 Database setup completed!"
print_status "Applied: $APPLIED_COUNT migrations"
print_status "Skipped: $SKIPPED_COUNT migrations"

# Verify key tables exist
print_status "Verifying database schema..."
EXPECTED_TABLES=(
    "users"
    "lms_courses" 
    "lms_labs"
    "lab_sessions"
    "lab_submissions"
    "lab_scores"
    "curriculums"
    "curriculum_labs"
    "lab_skills"
)

MISSING_TABLES=()
for table in "${EXPECTED_TABLES[@]}"; do
    if ! psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -t -c "
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = '$table';
    " | grep -q 1; then
        MISSING_TABLES+=("$table")
    fi
done

if [ ${#MISSING_TABLES[@]} -eq 0 ]; then
    print_status "✅ All expected tables are present"
else
    print_warning "Missing tables: ${MISSING_TABLES[*]}"
fi

# Show database statistics
print_status "Database Statistics:"
psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -c "
SELECT 
    schemaname,
    COUNT(*) as table_count
FROM pg_tables 
WHERE schemaname = 'public'
GROUP BY schemaname;
"

print_status "🎯 Setup complete for $ENVIRONMENT environment!"
print_status "Database URL: postgresql://$PGUSER:***@$PGHOST:$PGPORT/$PGDATABASE"