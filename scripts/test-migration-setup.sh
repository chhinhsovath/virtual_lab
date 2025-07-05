#!/bin/bash

# Test Migration Setup Script
# This script helps verify your migration setup before running on production

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Virtual Lab Migration Setup Test ===${NC}"
echo ""

# Check if psql is installed
echo -e "${BLUE}1. Checking PostgreSQL client...${NC}"
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓ psql is installed${NC}"
    psql --version
else
    echo -e "${RED}✗ psql is not installed${NC}"
    echo "Please install PostgreSQL client tools first"
    exit 1
fi

# Check if migration script exists
echo -e "\n${BLUE}2. Checking migration script...${NC}"
if [ -f "./scripts/migrate-database.sh" ]; then
    echo -e "${GREEN}✓ Migration script found${NC}"
else
    echo -e "${RED}✗ Migration script not found${NC}"
    exit 1
fi

# Check if migrations directory exists
echo -e "\n${BLUE}3. Checking migrations directory...${NC}"
if [ -d "./migrations" ]; then
    migration_count=$(ls -1 ./migrations/*.sql 2>/dev/null | wc -l)
    echo -e "${GREEN}✓ Migrations directory found with $migration_count migration files${NC}"
else
    echo -e "${RED}✗ Migrations directory not found${NC}"
    exit 1
fi

# Check local database connection
echo -e "\n${BLUE}4. Testing local database connection...${NC}"
if [ -f .env.local ]; then
    export $(cat .env.local | grep DATABASE_URL | xargs)
    if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Local database connection successful${NC}"
        
        # Get database info
        db_name=$(psql "$DATABASE_URL" -t -c "SELECT current_database()" 2>/dev/null | xargs)
        db_user=$(psql "$DATABASE_URL" -t -c "SELECT current_user" 2>/dev/null | xargs)
        echo "  Database: $db_name"
        echo "  User: $db_user"
    else
        echo -e "${RED}✗ Cannot connect to local database${NC}"
        echo "  Please check your DATABASE_URL in .env.local"
        exit 1
    fi
else
    echo -e "${RED}✗ .env.local file not found${NC}"
    exit 1
fi

# Check production database URL
echo -e "\n${BLUE}5. Checking production database configuration...${NC}"
if [ -n "$PRODUCTION_DATABASE_URL" ]; then
    echo -e "${GREEN}✓ Production database URL is set${NC}"
    
    # Try to connect (optional)
    echo -n "  Do you want to test production connection? (y/n): "
    read test_prod
    if [ "$test_prod" = "y" ]; then
        if psql "$PRODUCTION_DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
            echo -e "${GREEN}  ✓ Production database connection successful${NC}"
        else
            echo -e "${RED}  ✗ Cannot connect to production database${NC}"
            echo "  Please verify your PRODUCTION_DATABASE_URL"
        fi
    fi
else
    echo -e "${YELLOW}⚠ Production database URL not set${NC}"
    echo "  To set it, run:"
    echo "  export PRODUCTION_DATABASE_URL='postgresql://user:pass@host:port/dbname'"
fi

# List migration status on local
echo -e "\n${BLUE}6. Local migration status:${NC}"
./scripts/migrate-database.sh -l -e local | head -20

echo -e "\n${GREEN}=== Setup test complete ===${NC}"
echo ""
echo "Next steps:"
echo "1. Set your production database URL:"
echo "   export PRODUCTION_DATABASE_URL='your-production-url'"
echo ""
echo "2. Run a dry run to see what will be migrated:"
echo "   ./scripts/migrate-database.sh -e production --dry-run"
echo ""
echo "3. Backup your production database before migrating"
echo ""
echo "4. Run the actual migration:"
echo "   ./scripts/migrate-database.sh -e production"