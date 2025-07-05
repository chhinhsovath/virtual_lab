#!/bin/bash

# Virtual Lab Production Migration Script
# This script handles all database setup and migration

set -e  # Exit on error

echo "========================================="
echo "Virtual Lab Production Migration"
echo "========================================="

# Set database connection
export PRODUCTION_DATABASE_URL="postgresql://postgres:P@ssw0rd@localhost:5432/virtual_lab"

# Test database connection
echo "Testing database connection..."
if psql $PRODUCTION_DATABASE_URL -c "SELECT 1" > /dev/null 2>&1; then
    echo "✓ Database connection successful"
else
    echo "✗ Cannot connect to database"
    exit 1
fi

# Create temporary directory for scripts
TEMP_DIR="/tmp/vlab_migration_$(date +%s)"
mkdir -p $TEMP_DIR
cd $TEMP_DIR

echo ""
echo "Downloading migration scripts..."

# Download all necessary scripts from GitHub
curl -s -O https://raw.githubusercontent.com/chhinhsovath/virtual_lab/main/setup_production_users.sql
curl -s -O https://raw.githubusercontent.com/chhinhsovath/virtual_lab/main/setup_virtual_lab_minimal.sql
curl -s -O https://raw.githubusercontent.com/chhinhsovath/virtual_lab/main/fix_production_auth.sql
curl -s -O https://raw.githubusercontent.com/chhinhsovath/virtual_lab/main/production_db_check.sql

echo "✓ Scripts downloaded"

echo ""
echo "========================================="
echo "STEP 1: Fixing Authentication System"
echo "========================================="
psql $PRODUCTION_DATABASE_URL -f fix_production_auth.sql

echo ""
echo "========================================="
echo "STEP 2: Creating Users"
echo "========================================="
psql $PRODUCTION_DATABASE_URL -f setup_production_users.sql

echo ""
echo "========================================="
echo "STEP 3: Setting up Virtual Lab Tables"
echo "========================================="
psql $PRODUCTION_DATABASE_URL -f setup_virtual_lab_minimal.sql

echo ""
echo "========================================="
echo "STEP 4: Running Production Check"
echo "========================================="
psql $PRODUCTION_DATABASE_URL -f production_db_check.sql > /tmp/production_check_results.txt

echo ""
echo "========================================="
echo "MIGRATION COMPLETE!"
echo "========================================="
echo ""
echo "Users created:"
echo "- student@vlab.edu.kh (password: demo123)"
echo "- teacher@vlab.edu.kh (password: demo123)"
echo "- admin@vlab.edu.kh (password: demo123)"
echo ""
echo "Check results saved to: /tmp/production_check_results.txt"
echo ""

# Show key results
echo "Current database status:"
psql $PRODUCTION_DATABASE_URL -c "SELECT email, role, is_active FROM users WHERE email LIKE '%vlab.edu.kh' ORDER BY email;"

# Clean up
rm -rf $TEMP_DIR

echo ""
echo "Next steps:"
echo "1. Restart your application: pm2 restart all (or your restart command)"
echo "2. Test login at https://vlab.openplp.com/auth/login"
echo "3. Use credentials: student@vlab.edu.kh / demo123"