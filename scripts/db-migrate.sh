#!/bin/bash

# Database Migration Script for Virtual Lab Cambodia
# Supports local development and Digital Ocean production environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Environment configurations
LOCAL_HOST="localhost"
LOCAL_USER="postgres"
LOCAL_DB="virtual_lab"
LOCAL_PASSWORD="12345"
LOCAL_PORT="5432"

PROD_SSH="root@137.184.109.21"
PROD_HOST="137.184.109.21"
PROD_USER="postgres"
PROD_DB="virtual_lab"
PROD_PASSWORD="P@ssw0rd"
PROD_PORT="5432"

# Create backups directory if it doesn't exist
mkdir -p backups

# Function to show usage
show_usage() {
    echo -e "${BLUE}Virtual Lab Cambodia - Database Migration Tool${NC}"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  backup-local      Create backup of local database"
    echo "  backup-prod       Create backup of production database"
    echo "  local-to-prod     Migrate local database to production"
    echo "  prod-to-local     Migrate production database to local"
    echo "  test-local        Test local database connection"
    echo "  test-prod         Test production database connection"
    echo "  run-migrations    Run migration scripts"
    echo "  help              Show this help message"
    echo ""
}

# Function to create timestamp
get_timestamp() {
    date +%Y%m%d_%H%M%S
}

# Function to test local connection
test_local() {
    echo -e "${BLUE}Testing local database connection...${NC}"
    if PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -U $LOCAL_USER -d $LOCAL_DB -c "SELECT version();" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Local database connection successful${NC}"
        return 0
    else
        echo -e "${RED}✗ Local database connection failed${NC}"
        return 1
    fi
}

# Function to test production connection
test_prod() {
    echo -e "${BLUE}Testing production database connection...${NC}"
    if ssh $PROD_SSH "PGPASSWORD=$PROD_PASSWORD psql -h localhost -U $PROD_USER -d $PROD_DB -c 'SELECT version();'" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Production database connection successful${NC}"
        return 0
    else
        echo -e "${RED}✗ Production database connection failed${NC}"
        return 1
    fi
}

# Function to backup local database
backup_local() {
    local timestamp=$(get_timestamp)
    local backup_file="backups/local_${timestamp}.sql"
    
    echo -e "${BLUE}Creating local database backup...${NC}"
    
    if test_local; then
        PGPASSWORD=$LOCAL_PASSWORD pg_dump -h $LOCAL_HOST -U $LOCAL_USER -d $LOCAL_DB > $backup_file
        echo -e "${GREEN}✓ Local backup saved as: $backup_file${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to create local backup${NC}"
        return 1
    fi
}

# Function to backup production database
backup_prod() {
    local timestamp=$(get_timestamp)
    local backup_file="backups/production_${timestamp}.sql"
    
    echo -e "${BLUE}Creating production database backup...${NC}"
    
    if test_prod; then
        ssh $PROD_SSH "PGPASSWORD=$PROD_PASSWORD pg_dump -h localhost -U $PROD_USER -d $PROD_DB" > $backup_file
        echo -e "${GREEN}✓ Production backup saved as: $backup_file${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to create production backup${NC}"
        return 1
    fi
}

# Function to migrate local to production
local_to_prod() {
    echo -e "${YELLOW}⚠️  WARNING: This will overwrite the production database!${NC}"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Migration cancelled${NC}"
        return 1
    fi
    
    # Create backups first
    echo -e "${BLUE}Creating safety backups...${NC}"
    backup_local
    backup_prod
    
    # Migrate
    echo -e "${BLUE}Starting migration from local to production...${NC}"
    
    local temp_file="/tmp/virtual_lab_migration_$(get_timestamp).sql"
    
    # Export local database
    echo -e "${BLUE}Exporting local database...${NC}"
    PGPASSWORD=$LOCAL_PASSWORD pg_dump -h $LOCAL_HOST -U $LOCAL_USER -d $LOCAL_DB > $temp_file
    
    # Upload to production server
    echo -e "${BLUE}Uploading to production server...${NC}"
    scp $temp_file $PROD_SSH:/tmp/
    
    # Import to production database
    echo -e "${BLUE}Importing to production database...${NC}"
    ssh $PROD_SSH "PGPASSWORD=$PROD_PASSWORD psql -h localhost -U $PROD_USER -d $PROD_DB < $temp_file"
    
    # Cleanup
    rm $temp_file
    ssh $PROD_SSH "rm $temp_file"
    
    echo -e "${GREEN}✓ Migration from local to production completed successfully!${NC}"
}

# Function to migrate production to local
prod_to_local() {
    echo -e "${YELLOW}⚠️  WARNING: This will overwrite the local database!${NC}"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Migration cancelled${NC}"
        return 1
    fi
    
    # Create backups first
    echo -e "${BLUE}Creating safety backups...${NC}"
    backup_local
    backup_prod
    
    # Migrate
    echo -e "${BLUE}Starting migration from production to local...${NC}"
    
    local temp_file="/tmp/virtual_lab_migration_$(get_timestamp).sql"
    
    # Export production database
    echo -e "${BLUE}Exporting production database...${NC}"
    ssh $PROD_SSH "PGPASSWORD=$PROD_PASSWORD pg_dump -h localhost -U $PROD_USER -d $PROD_DB" > $temp_file
    
    # Import to local database
    echo -e "${BLUE}Importing to local database...${NC}"
    PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -U $LOCAL_USER -d $LOCAL_DB < $temp_file
    
    # Cleanup
    rm $temp_file
    
    echo -e "${GREEN}✓ Migration from production to local completed successfully!${NC}"
}

# Function to run migration scripts
run_migrations() {
    echo -e "${BLUE}Running database migration scripts...${NC}"
    
    # Check if migrations directory exists
    if [ ! -d "migrations" ]; then
        echo -e "${RED}✗ Migrations directory not found${NC}"
        return 1
    fi
    
    # Run migrations on local
    echo -e "${BLUE}Running migrations on local database...${NC}"
    for migration in migrations/*.sql; do
        if [ -f "$migration" ]; then
            echo -e "  Running: $(basename $migration)"
            PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -U $LOCAL_USER -d $LOCAL_DB -f "$migration"
        fi
    done
    
    echo -e "${GREEN}✓ Local migrations completed${NC}"
    
    # Ask if user wants to run on production
    read -p "Run migrations on production? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Running migrations on production database...${NC}"
        for migration in migrations/*.sql; do
            if [ -f "$migration" ]; then
                echo -e "  Running: $(basename $migration)"
                scp "$migration" $PROD_SSH:/tmp/
                ssh $PROD_SSH "PGPASSWORD=$PROD_PASSWORD psql -h localhost -U $PROD_USER -d $PROD_DB -f /tmp/$(basename $migration)"
                ssh $PROD_SSH "rm /tmp/$(basename $migration)"
            fi
        done
        echo -e "${GREEN}✓ Production migrations completed${NC}"
    fi
}

# Main script logic
case "$1" in
    "backup-local")
        backup_local
        ;;
    "backup-prod")
        backup_prod
        ;;
    "local-to-prod")
        local_to_prod
        ;;
    "prod-to-local")
        prod_to_local
        ;;
    "test-local")
        test_local
        ;;
    "test-prod")
        test_prod
        ;;
    "run-migrations")
        run_migrations
        ;;
    "help"|"")
        show_usage
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        show_usage
        exit 1
        ;;
esac