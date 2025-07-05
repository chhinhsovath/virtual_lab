-- Migration 024: Fix student_simulation_progress table structure
-- This migration ensures the student_id column can handle both UUID and integer references

-- First, check if the table exists and what type student_id is
DO $$
DECLARE
    column_type TEXT;
BEGIN
    -- Get the current data type of student_id column
    SELECT data_type INTO column_type
    FROM information_schema.columns
    WHERE table_name = 'student_simulation_progress' 
    AND column_name = 'student_id';

    -- If column exists and is integer, we need to handle the conversion carefully
    IF column_type = 'integer' THEN
        -- Add a new UUID column
        ALTER TABLE student_simulation_progress 
        ADD COLUMN IF NOT EXISTS student_uuid UUID;
        
        -- Make student_id nullable
        ALTER TABLE student_simulation_progress 
        ALTER COLUMN student_id DROP NOT NULL;
        
        RAISE NOTICE 'Added student_uuid column to student_simulation_progress';
        
    ELSIF column_type = 'uuid' THEN
        -- If it's already UUID, ensure we have the student_uuid column
        ALTER TABLE student_simulation_progress 
        ADD COLUMN IF NOT EXISTS student_uuid UUID;
        
        -- Copy student_id to student_uuid if not already done
        UPDATE student_simulation_progress 
        SET student_uuid = student_id::UUID 
        WHERE student_uuid IS NULL AND student_id IS NOT NULL;
        
        RAISE NOTICE 'student_id is already UUID type';
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_progress_student_uuid 
ON student_simulation_progress(student_uuid) 
WHERE student_uuid IS NOT NULL;

-- If the table is empty, insert some demo data for student user
INSERT INTO student_simulation_progress (
    student_uuid,
    simulation_id,
    progress_percentage,
    time_spent,
    attempts,
    best_score,
    completed,
    last_accessed
)
SELECT 
    '41f7b48c-6a3b-4ff9-a67f-3a35841886a3'::UUID, -- Demo Student UUID from users table
    s.id,
    0,
    0,
    0,
    0.0,
    false,
    NOW()
FROM stem_simulations_catalog s
WHERE s.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM student_simulation_progress ssp 
    WHERE ssp.student_uuid = '41f7b48c-6a3b-4ff9-a67f-3a35841886a3'::UUID
    AND ssp.simulation_id = s.id
)
LIMIT 5; -- Only create progress for 5 simulations as demo data

-- Update the view or function that queries this table to use COALESCE
-- This allows it to work with either student_id or student_uuid
COMMENT ON TABLE student_simulation_progress IS 
'Tracks student progress in STEM simulations. Supports both integer student_id (legacy) and UUID student_uuid (new).';