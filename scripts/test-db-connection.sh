#!/bin/bash

# Database Connection Test Script
# Tests both local and production database connections

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

test_connection() {
    local env=$1
    local host=$2
    local user=$3
    local database=$4
    local password=$5
    local port=$6
    
    print_status "Testing $env connection..."
    print_status "Host: $host"
    print_status "Database: $database"
    print_status "User: $user"
    print_status "Port: $port"
    
    # Set password for this connection
    export PGPASSWORD="$password"
    
    # Test basic connection
    if psql -h "$host" -U "$user" -d postgres -p "$port" -c "SELECT 1;" &> /dev/null; then
        print_status "✅ Server connection successful"
    else
        print_error "❌ Cannot connect to database server"
        return 1
    fi
    
    # Test database existence
    if psql -h "$host" -U "$user" -d "$database" -p "$port" -c "SELECT 1;" &> /dev/null; then
        print_status "✅ Database '$database' exists and is accessible"
    else
        print_warning "⚠️  Database '$database' does not exist or is not accessible"
        print_status "Creating database '$database'..."
        if psql -h "$host" -U "$user" -d postgres -p "$port" -c "CREATE DATABASE $database;" &> /dev/null; then
            print_status "✅ Database created successfully"
        else
            print_error "❌ Failed to create database"
            return 1
        fi
    fi
    
    # Test table creation permission
    print_status "Testing table creation permissions..."
    if psql -h "$host" -U "$user" -d "$database" -p "$port" -c "
        CREATE TABLE IF NOT EXISTS connection_test (
            id SERIAL PRIMARY KEY,
            test_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO connection_test DEFAULT VALUES;
        SELECT COUNT(*) FROM connection_test;
        DROP TABLE connection_test;
    " &> /dev/null; then
        print_status "✅ Table operations successful"
    else
        print_error "❌ Table operations failed"
        return 1
    fi
    
    print_status "🎉 $env database connection test passed!\n"
}

print_status "=== Virtual Lab Database Connection Test ==="
print_status "This script tests connectivity to both local and production databases\n"

# Test Local Database
print_status "--- LOCAL DATABASE TEST ---"
if test_connection "LOCAL" "localhost" "postgres" "virtual_lab" "12345" "5432"; then
    LOCAL_SUCCESS=true
else
    LOCAL_SUCCESS=false
fi

# Test Production Database  
print_status "--- PRODUCTION DATABASE TEST ---"
if test_connection "PRODUCTION" "137.184.109.21" "postgres" "virtual_lab" "P@ssw0rd" "5432"; then
    PRODUCTION_SUCCESS=true
else
    PRODUCTION_SUCCESS=false
fi

# Summary
print_status "=== SUMMARY ==="
if [ "$LOCAL_SUCCESS" = true ]; then
    print_status "✅ Local database: READY"
else
    print_error "❌ Local database: FAILED"
fi

if [ "$PRODUCTION_SUCCESS" = true ]; then
    print_status "✅ Production database: READY"
else
    print_error "❌ Production database: FAILED"
fi

if [ "$LOCAL_SUCCESS" = true ] && [ "$PRODUCTION_SUCCESS" = true ]; then
    print_status "🚀 Both databases are ready for migration!"
    print_status "Run: npm run db:setup:local (for local)"
    print_status "Run: npm run db:setup:production (for production)"
else
    print_error "Fix database connection issues before proceeding"
    exit 1
fi