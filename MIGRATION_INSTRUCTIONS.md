# Database Migration Instructions for Vercel Deployment

Since Vercel doesn't allow running shell scripts, here are three ways to run the student ID type migration:

## Option 1: Via Admin UI (Easiest)

1. Deploy the latest code to Vercel
2. Log in as an admin user
3. Navigate to: https://vlab.openplp.com/admin/migrate
4. Click "Run Migration"
5. Verify the migration completed successfully

## Option 2: Using psql from your local machine

```bash
# Get your database URL from Vercel environment variables
# Go to: https://vercel.com/dashboard/[project]/settings/environment-variables

# Run the migration
psql "postgresql://user:password@host:port/database?sslmode=require" -f migrations/fix_student_id_types.sql
```

## Option 3: Direct SQL execution

Run this SQL in your database client (pgAdmin, TablePlus, etc.):

```sql
-- Add student_uuid columns
ALTER TABLE student_simulation_progress ADD COLUMN IF NOT EXISTS student_uuid UUID;
ALTER TABLE student_exercise_submissions ADD COLUMN IF NOT EXISTS student_uuid UUID;
ALTER TABLE student_achievements ADD COLUMN IF NOT EXISTS student_uuid UUID;

-- Make student_id nullable
ALTER TABLE student_simulation_progress ALTER COLUMN student_id DROP NOT NULL;
ALTER TABLE student_exercise_submissions ALTER COLUMN student_id DROP NOT NULL;
ALTER TABLE student_achievements ALTER COLUMN student_id DROP NOT NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_student_simulation_progress_student_uuid ON student_simulation_progress(student_uuid);
CREATE INDEX IF NOT EXISTS idx_student_exercise_submissions_student_uuid ON student_exercise_submissions(student_uuid);
CREATE INDEX IF NOT EXISTS idx_student_achievements_student_uuid ON student_achievements(student_uuid);

-- Verify the changes
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('student_simulation_progress', 'student_exercise_submissions', 'student_achievements')
AND column_name IN ('student_id', 'student_uuid')
ORDER BY table_name, column_name;
```

## What this migration does:

1. Adds `student_uuid` columns to handle UUID-based authentication
2. Makes existing `student_id` columns nullable for backward compatibility
3. Creates indexes for performance
4. Allows the system to work with both integer and UUID student IDs

## After migration:

The system will automatically detect and use the correct column based on the ID format:
- UUIDs (with hyphens) → uses `student_uuid` column
- Integers → uses `student_id` column