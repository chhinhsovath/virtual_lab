#!/bin/bash

# Database Migration Script
# This script helps manage database migrations for the Virtual Lab project

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="local"
MIGRATIONS_DIR="./migrations"
DRY_RUN=false
FORCE=false

# Function to display usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --env ENVIRONMENT    Environment to migrate (local|production|staging) [default: local]"
    echo "  -d, --database DB_URL    Database connection URL (overrides environment)"
    echo "  -m, --migration FILE     Run specific migration file"
    echo "  -l, --list              List all migrations and their status"
    echo "  -n, --dry-run           Show what would be executed without running"
    echo "  -f, --force             Force re-run migrations (use with caution)"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e production        # Migrate production database"
    echo "  $0 -l                   # List migration status"
    echo "  $0 -m 024_add_student_profile_fields.sql  # Run specific migration"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -d|--database)
            DATABASE_URL="$2"
            shift 2
            ;;
        -m|--migration)
            SPECIFIC_MIGRATION="$2"
            shift 2
            ;;
        -l|--list)
            LIST_ONLY=true
            shift
            ;;
        -n|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Set database URL based on environment if not provided
if [ -z "$DATABASE_URL" ]; then
    case $ENVIRONMENT in
        local)
            if [ -f .env.local ]; then
                export $(cat .env.local | grep DATABASE_URL | xargs)
            else
                echo -e "${RED}Error: .env.local file not found${NC}"
                exit 1
            fi
            ;;
        production)
            if [ -z "$PRODUCTION_DATABASE_URL" ]; then
                echo -e "${RED}Error: PRODUCTION_DATABASE_URL environment variable not set${NC}"
                echo "Please set your production database URL:"
                echo "export PRODUCTION_DATABASE_URL='postgresql://user:password@host:port/database'"
                exit 1
            fi
            DATABASE_URL="$PRODUCTION_DATABASE_URL"
            ;;
        staging)
            if [ -z "$STAGING_DATABASE_URL" ]; then
                echo -e "${RED}Error: STAGING_DATABASE_URL environment variable not set${NC}"
                exit 1
            fi
            DATABASE_URL="$STAGING_DATABASE_URL"
            ;;
        *)
            echo -e "${RED}Error: Unknown environment: $ENVIRONMENT${NC}"
            usage
            ;;
    esac
fi

# Verify database connection
echo -e "${BLUE}Checking database connection...${NC}"
if ! psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to database${NC}"
    echo "Database URL: $DATABASE_URL"
    exit 1
fi

echo -e "${GREEN}Successfully connected to $ENVIRONMENT database${NC}"

# Create migration tracking table if it doesn't exist
if [ "$DRY_RUN" = false ]; then
    echo -e "${BLUE}Ensuring migration tracking table exists...${NC}"
    psql "$DATABASE_URL" -f "$MIGRATIONS_DIR/000_create_migration_tracking.sql" -q
fi

# Function to check if migration was already applied
is_migration_applied() {
    local migration_name=$1
    local result=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM schema_migrations WHERE migration_name = '$migration_name'" 2>/dev/null || echo "0")
    [ "$result" -gt 0 ]
}

# Function to record migration
record_migration() {
    local migration_name=$1
    local execution_time=$2
    psql "$DATABASE_URL" -c "INSERT INTO schema_migrations (migration_name, execution_time_ms, applied_by) VALUES ('$migration_name', $execution_time, '$(whoami)')" -q 2>/dev/null || \
    psql "$DATABASE_URL" -c "INSERT INTO schema_migrations (migration_name, applied_by) VALUES ('$migration_name', '$(whoami)')" -q
}

# Function to list migrations
list_migrations() {
    echo -e "${BLUE}Migration Status:${NC}"
    echo "=================="
    
    for migration_file in $(ls -1 "$MIGRATIONS_DIR"/*.sql | sort); do
        migration_name=$(basename "$migration_file")
        
        # Skip the tracking migration
        if [ "$migration_name" = "000_create_migration_tracking.sql" ]; then
            continue
        fi
        
        if is_migration_applied "$migration_name"; then
            applied_info=$(psql "$DATABASE_URL" -t -c "SELECT applied_at FROM schema_migrations WHERE migration_name = '$migration_name'" 2>/dev/null)
            echo -e "${GREEN}✓${NC} $migration_name - Applied on: $applied_info"
        else
            echo -e "${YELLOW}○${NC} $migration_name - Not applied"
        fi
    done
}

# Function to run a single migration
run_migration() {
    local migration_file=$1
    local migration_name=$(basename "$migration_file")
    
    if [ ! -f "$migration_file" ]; then
        echo -e "${RED}Error: Migration file not found: $migration_file${NC}"
        return 1
    fi
    
    # Check if already applied (unless forcing)
    if [ "$FORCE" = false ] && is_migration_applied "$migration_name"; then
        echo -e "${YELLOW}Skipping $migration_name (already applied)${NC}"
        return 0
    fi
    
    echo -e "${BLUE}Running migration: $migration_name${NC}"
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY RUN] Would execute: $migration_file${NC}"
        echo "--- Migration content preview ---"
        head -20 "$migration_file"
        echo "..."
        return 0
    fi
    
    # Execute migration and measure time
    start_time=$(date +%s)
    if psql "$DATABASE_URL" -f "$migration_file"; then
        end_time=$(date +%s)
        execution_time=$((end_time - start_time))
        
        # Record successful migration
        if [ "$FORCE" = false ]; then
            record_migration "$migration_name" "$execution_time"
        fi
        
        echo -e "${GREEN}✓ Successfully applied: $migration_name (${execution_time}ms)${NC}"
    else
        echo -e "${RED}✗ Failed to apply: $migration_name${NC}"
        return 1
    fi
}

# Main execution
if [ "$LIST_ONLY" = true ]; then
    list_migrations
    exit 0
fi

# Confirm before running on production
if [ "$ENVIRONMENT" = "production" ] && [ "$DRY_RUN" = false ]; then
    echo -e "${RED}WARNING: You are about to run migrations on PRODUCTION database${NC}"
    echo -e "Database: $DATABASE_URL"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Migration cancelled"
        exit 0
    fi
fi

# Run specific migration or all pending migrations
if [ -n "$SPECIFIC_MIGRATION" ]; then
    # Run specific migration
    migration_path="$MIGRATIONS_DIR/$SPECIFIC_MIGRATION"
    run_migration "$migration_path"
else
    # Run all pending migrations
    echo -e "${BLUE}Checking for pending migrations...${NC}"
    pending_count=0
    
    for migration_file in $(ls -1 "$MIGRATIONS_DIR"/*.sql | sort); do
        migration_name=$(basename "$migration_file")
        
        # Skip the tracking migration
        if [ "$migration_name" = "000_create_migration_tracking.sql" ]; then
            continue
        fi
        
        if [ "$FORCE" = false ] && is_migration_applied "$migration_name"; then
            continue
        fi
        
        ((pending_count++))
        run_migration "$migration_file"
    done
    
    if [ $pending_count -eq 0 ]; then
        echo -e "${GREEN}All migrations are up to date!${NC}"
    else
        echo -e "${GREEN}Completed $pending_count migration(s)${NC}"
    fi
fi

# Show final status
echo ""
echo -e "${BLUE}Migration Summary:${NC}"
list_migrations