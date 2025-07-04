#!/bin/bash

# TaRL System Migration Script
# This script runs all migration files in order to update the database with the new user and role system

set -e  # Exit on any error

# Load environment variables
if [ -f .env.local ]; then
    source .env.local
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL in your .env.local file"
    exit 1
fi

echo "🚀 Starting TaRL System Migration..."
echo "Database: $(echo $DATABASE_URL | cut -d'@' -f2)"

# Function to run a SQL file
run_migration() {
    local file=$1
    local name=$2
    
    echo "📁 Running migration: $name"
    echo "   File: $file"
    
    if [ ! -f "$file" ]; then
        echo "   ❌ File not found: $file"
        exit 1
    fi
    
    # Run the migration
    if psql "$DATABASE_URL" -f "$file" > /dev/null 2>&1; then
        echo "   ✅ Migration completed successfully"
    else
        echo "   ❌ Migration failed"
        echo "   Please check the error above and fix any issues"
        exit 1
    fi
    
    echo ""
}

# Function to check if psql is available
check_psql() {
    if ! command -v psql &> /dev/null; then
        echo "❌ psql command not found"
        echo "Please install PostgreSQL client tools"
        exit 1
    fi
}

# Function to test database connection
test_connection() {
    echo "🔍 Testing database connection..."
    if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ Database connection successful"
    else
        echo "❌ Database connection failed"
        echo "Please check your DATABASE_URL and ensure the database is running"
        exit 1
    fi
    echo ""
}

# Main migration process
main() {
    check_psql
    test_connection
    
    echo "📋 Migration Plan:"
    echo "   1. Create new user and role tables (005_users_roles_refactor.sql)"
    echo "   2. Seed user data (006_seed_users_data.sql)"
    echo ""
    
    read -p "🤔 Do you want to proceed with the migration? (y/N): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Migration cancelled."
        exit 0
    fi
    
    echo ""
    echo "🏗️  Running migrations..."
    echo ""
    
    # Run migrations in order
    run_migration "migrations/005_users_roles_refactor.sql" "Users and Roles Schema"
    run_migration "migrations/006_seed_users_data.sql" "Seed User Data"
    
    echo "🎉 All migrations completed successfully!"
    echo ""
    echo "📊 Migration Summary:"
    echo "   ✅ Created flexible user and role system"
    echo "   ✅ Migrated from hardcoded authentication"
    echo "   ✅ Added proper permission management"
    echo "   ✅ Created audit trails and session management"
    echo ""
    echo "🔑 Default Login Credentials:"
    echo "   Admin: admin / admin123"
    echo "   Super Admin: superadmin / admin123"
    echo "   Mentor 1: mentor1 / mentor123"
    echo "   Mentor 2: mentor2 / mentor123"
    echo "   Teachers: teacher_[ID] / teacher123"
    echo ""
    echo "⚠️  Next Steps:"
    echo "   1. Update your frontend to use new API endpoints"
    echo "   2. Test all authentication flows"
    echo "   3. Change default passwords in production"
    echo "   4. Review user permissions and school access"
}

# Run the main function
main