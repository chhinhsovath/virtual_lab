-- Simple fix for student_simulation_progress table
-- Add missing columns and indexes

-- Add student_uuid column if missing
ALTER TABLE student_simulation_progress 
ADD COLUMN IF NOT EXISTS student_uuid UUID;

-- Add new schema columns if missing
ALTER TABLE student_simulation_progress 
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;

ALTER TABLE student_simulation_progress 
ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0;

ALTER TABLE student_simulation_progress 
ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0;

ALTER TABLE student_simulation_progress 
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0;

ALTER TABLE student_simulation_progress 
ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMPTZ DEFAULT NOW();

-- Update completed column based on completed_at
UPDATE student_simulation_progress 
SET completed = true 
WHERE completed_at IS NOT NULL AND completed IS NOT true;

-- Convert total_time_spent (seconds) to time_spent (minutes)
UPDATE student_simulation_progress 
SET time_spent = COALESCE(total_time_spent / 60, 0)
WHERE total_time_spent IS NOT NULL AND time_spent = 0;

-- Copy attempts_count to attempts
UPDATE student_simulation_progress 
SET attempts = COALESCE(attempts_count, 0)
WHERE attempts_count IS NOT NULL AND attempts = 0;

-- Calculate progress_percentage
UPDATE student_simulation_progress 
SET progress_percentage = 
    CASE 
        WHEN completed_at IS NOT NULL THEN 100
        WHEN current_progress IS NOT NULL THEN 
            LEAST(100, GREATEST(0, COALESCE((current_progress->>'percentage')::INTEGER, 0)))
        ELSE 0
    END
WHERE progress_percentage = 0;

-- Update last_accessed
UPDATE student_simulation_progress 
SET last_accessed = COALESCE(updated_at, created_at, NOW())
WHERE last_accessed IS NULL OR last_accessed = '1970-01-01';

-- Update student_uuid for demo student
UPDATE student_simulation_progress 
SET student_uuid = (
    SELECT u.id::UUID 
    FROM users u 
    WHERE u.email = 'student@vlab.edu.kh' 
    LIMIT 1
)
WHERE student_uuid IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ssp_student_uuid ON student_simulation_progress(student_uuid);
CREATE INDEX IF NOT EXISTS idx_ssp_simulation_id ON student_simulation_progress(simulation_id);
CREATE INDEX IF NOT EXISTS idx_ssp_created_at ON student_simulation_progress(created_at);

-- Add some demo data if no records exist for the student
INSERT INTO student_simulation_progress (
    student_uuid,
    simulation_id,
    progress_percentage,
    time_spent,
    attempts,
    best_score,
    completed,
    last_accessed,
    created_at
)
SELECT 
    u.id::UUID,
    s.id,
    0,
    0,
    0,
    0.0,
    false,
    NOW(),
    NOW()
FROM users u
CROSS JOIN stem_simulations_catalog s
WHERE u.email = 'student@vlab.edu.kh'
AND s.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM student_simulation_progress ssp 
    WHERE ssp.student_uuid = u.id::UUID
    AND ssp.simulation_id = s.id
)
LIMIT 3;

-- Update stats
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN student_uuid IS NOT NULL THEN 1 END) as with_uuid,
    COUNT(CASE WHEN completed = true THEN 1 END) as completed_count
FROM student_simulation_progress;