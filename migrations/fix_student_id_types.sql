-- Fix student_id column types to handle UUIDs consistently
-- This migration updates tables that reference students to use UUID type

-- First, let's check and update student_simulation_progress
DO $$
BEGIN
    -- Check if student_id is integer type
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'student_simulation_progress' 
        AND column_name = 'student_id'
        AND data_type = 'integer'
    ) THEN
        -- Add a new student_uuid column
        ALTER TABLE student_simulation_progress ADD COLUMN IF NOT EXISTS student_uuid UUID;
        
        -- Update the column to reference users table properly
        -- Since we can't directly convert integer IDs to UUIDs, we'll need to handle this differently
        -- For now, we'll use the UUID column for new records
        
        -- Make student_id nullable temporarily
        ALTER TABLE student_simulation_progress ALTER COLUMN student_id DROP NOT NULL;
    END IF;

    -- Check and update student_exercise_submissions
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'student_exercise_submissions' 
        AND column_name = 'student_id'
        AND data_type = 'integer'
    ) THEN
        -- Add a new student_uuid column
        ALTER TABLE student_exercise_submissions ADD COLUMN IF NOT EXISTS student_uuid UUID;
        
        -- Make student_id nullable temporarily
        ALTER TABLE student_exercise_submissions ALTER COLUMN student_id DROP NOT NULL;
    END IF;

    -- Check and update simulation_achievements
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'student_achievements' 
        AND column_name = 'student_id'
        AND data_type = 'integer'
    ) THEN
        -- Add a new student_uuid column
        ALTER TABLE student_achievements ADD COLUMN IF NOT EXISTS student_uuid UUID;
        
        -- Make student_id nullable temporarily
        ALTER TABLE student_achievements ALTER COLUMN student_id DROP NOT NULL;
    END IF;

    RAISE NOTICE 'Student ID type migration completed';
END $$;

-- Add indexes for performance
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