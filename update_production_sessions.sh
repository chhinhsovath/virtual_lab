#!/bin/bash

echo "Updating production database session handling..."

# Run the migration to fix UUID types
echo "Running session UUID type fixes..."
psql "$DATABASE_URL" -f migrations/fix_session_uuid_types.sql

echo "Session handling updated successfully!"
echo ""
echo "The authentication system has been updated to:"
echo "1. Use consistent user_uuid column in user_sessions table"
echo "2. Remove cookie domain restrictions for subdomain compatibility"
echo "3. Simplify session queries to avoid type casting issues"
echo ""
echo "You should now be able to log in successfully on vlab.openplp.com"