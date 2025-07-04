#!/bin/bash

# Virtual Lab Database Verification Script
# Verifies that all essential tables and data are properly set up

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

verify_database() {
    local env=$1
    local host=$2
    local user=$3
    local database=$4
    local password=$5
    local port=$6
    
    print_status "=== Verifying $env Database ==="
    
    export PGPASSWORD="$password"
    
    # Test connection
    if ! psql -h "$host" -U "$user" -d "$database" -p "$port" -c "SELECT 1;" &> /dev/null; then
        print_error "❌ Cannot connect to $env database"
        return 1
    fi
    
    # Check essential tables
    print_status "Checking essential tables..."
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
        if ! psql -h "$host" -U "$user" -d "$database" -p "$port" -t -c "
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = '$table';
        " | grep -q 1; then
            MISSING_TABLES+=("$table")
        fi
    done
    
    if [ ${#MISSING_TABLES[@]} -eq 0 ]; then
        print_status "✅ All essential tables present"
    else
        print_error "❌ Missing tables: ${MISSING_TABLES[*]}"
        return 1
    fi
    
    # Check demo users
    print_status "Checking demo users..."
    USER_COUNT=$(psql -h "$host" -U "$user" -d "$database" -p "$port" -t -c "
        SELECT COUNT(*) FROM users;
    " | tr -d ' ')
    
    if [ "$USER_COUNT" -gt 0 ]; then
        print_status "✅ Found $USER_COUNT demo users"
        
        # Show user details
        psql -h "$host" -U "$user" -d "$database" -p "$port" -c "
            SELECT email, name, role FROM users ORDER BY role;
        "
    else
        print_warning "⚠️  No demo users found"
    fi
    
    # Check demo course and lab
    print_status "Checking demo content..."
    COURSE_COUNT=$(psql -h "$host" -U "$user" -d "$database" -p "$port" -t -c "
        SELECT COUNT(*) FROM lms_courses;
    " | tr -d ' ')
    
    LAB_COUNT=$(psql -h "$host" -U "$user" -d "$database" -p "$port" -t -c "
        SELECT COUNT(*) FROM lms_labs;
    " | tr -d ' ')
    
    SKILL_COUNT=$(psql -h "$host" -U "$user" -d "$database" -p "$port" -t -c "
        SELECT COUNT(*) FROM lab_skills;
    " | tr -d ' ')
    
    print_status "✅ Found $COURSE_COUNT course(s), $LAB_COUNT lab(s), $SKILL_COUNT skill(s)"
    
    # Database statistics
    print_status "Database Statistics:"
    psql -h "$host" -U "$user" -d "$database" -p "$port" -c "
        SELECT 
            schemaname,
            COUNT(*) as table_count
        FROM pg_tables 
        WHERE schemaname = 'public'
        GROUP BY schemaname;
    "
    
    print_status "🎉 $env database verification completed successfully!\n"
    return 0
}

print_status "Virtual Lab LMS - Database Verification"
print_status "======================================="

# Verify Local Database
if verify_database "LOCAL" "localhost" "postgres" "virtual_lab" "12345" "5432"; then
    LOCAL_SUCCESS=true
else
    LOCAL_SUCCESS=false
fi

# Verify Production Database  
if verify_database "PRODUCTION" "137.184.109.21" "postgres" "virtual_lab" "P@ssw0rd" "5432"; then
    PRODUCTION_SUCCESS=true
else
    PRODUCTION_SUCCESS=false
fi

# Final Summary
print_status "=== FINAL SUMMARY ==="
if [ "$LOCAL_SUCCESS" = true ]; then
    print_status "✅ Local database: READY FOR DEVELOPMENT"
else
    print_error "❌ Local database: NEEDS ATTENTION"
fi

if [ "$PRODUCTION_SUCCESS" = true ]; then
    print_status "✅ Production database: READY FOR DEPLOYMENT"
else
    print_error "❌ Production database: NEEDS ATTENTION"
fi

if [ "$LOCAL_SUCCESS" = true ] && [ "$PRODUCTION_SUCCESS" = true ]; then
    print_status ""
    print_status "🚀 Virtual Lab LMS is ready to use!"
    print_status ""
    print_status "Next steps:"
    print_status "1. For local development: npm run dev"
    print_status "2. For production build: npm run build && npm start"
    print_status ""
    print_status "Demo credentials:"
    print_status "- Admin: admin@virtuallab.com"
    print_status "- Teacher: teacher@virtuallab.com" 
    print_status "- Student: student@virtuallab.com"
    print_status "- Parent: parent@virtuallab.com"
    print_status "(Password: demo.hash.for.testing - update in production!)"
else
    print_error "Fix database issues before proceeding"
    exit 1
fi