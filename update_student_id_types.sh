#!/bin/bash

echo "Updating student ID types to handle UUIDs..."

# Run the migration
psql "$DATABASE_URL" -f migrations/fix_student_id_types.sql

echo ""
echo "Migration completed. The system now handles both integer and UUID student IDs."
echo ""
echo "Updated tables:"
echo "- student_simulation_progress"
echo "- student_exercise_submissions" 
echo "- student_achievements"
echo ""
echo "The API will automatically detect and use the correct column based on the ID format."