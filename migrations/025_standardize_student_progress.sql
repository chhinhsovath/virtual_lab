-- Migration 025: Standardize student_simulation_progress table
-- This migration ensures consistent column names regardless of which previous migration was run

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Check and add student_uuid if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_simulation_progress' 
                   AND column_name = 'student_uuid') THEN
        ALTER TABLE student_simulation_progress ADD COLUMN student_uuid UUID;
    END IF;

    -- For old schema (migration 019), add new columns
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'student_simulation_progress' 
               AND column_name = 'completed_at') THEN
        
        -- Add new columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'student_simulation_progress' 
                       AND column_name = 'completed') THEN
            ALTER TABLE student_simulation_progress 
            ADD COLUMN completed BOOLEAN DEFAULT false;
            
            -- Update completed based on completed_at
            UPDATE student_simulation_progress 
            SET completed = true 
            WHERE completed_at IS NOT NULL;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'student_simulation_progress' 
                       AND column_name = 'time_spent') THEN
            ALTER TABLE student_simulation_progress 
            ADD COLUMN time_spent INTEGER DEFAULT 0;
            
            -- Convert total_time_spent (seconds) to time_spent (minutes)
            UPDATE student_simulation_progress 
            SET time_spent = COALESCE(total_time_spent / 60, 0)
            WHERE total_time_spent IS NOT NULL;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'student_simulation_progress' 
                       AND column_name = 'attempts') THEN
            ALTER TABLE student_simulation_progress 
            ADD COLUMN attempts INTEGER DEFAULT 0;
            
            -- Copy attempts_count to attempts
            UPDATE student_simulation_progress 
            SET attempts = COALESCE(attempts_count, 0);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'student_simulation_progress' 
                       AND column_name = 'progress_percentage') THEN
            ALTER TABLE student_simulation_progress 
            ADD COLUMN progress_percentage INTEGER DEFAULT 0;
            
            -- Calculate progress_percentage from current_progress or completed_at
            UPDATE student_simulation_progress 
            SET progress_percentage = 
                CASE 
                    WHEN completed_at IS NOT NULL THEN 100
                    WHEN current_progress IS NOT NULL THEN 
                        COALESCE((current_progress->>'percentage')::INTEGER, 0)
                    ELSE 0
                END;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'student_simulation_progress' 
                       AND column_name = 'last_accessed') THEN
            ALTER TABLE student_simulation_progress 
            ADD COLUMN last_accessed TIMESTAMPTZ;
            
            -- Use updated_at or created_at as last_accessed
            UPDATE student_simulation_progress 
            SET last_accessed = COALESCE(updated_at, created_at, NOW());
        END IF;
    END IF;
    
    -- For integer student_id, copy to student_uuid if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'student_simulation_progress' 
               AND column_name = 'student_id'
               AND data_type = 'integer') THEN
        
        -- Try to update student_uuid from users table for demo student
        UPDATE student_simulation_progress 
        SET student_uuid = (
            SELECT u.id::UUID 
            FROM users u 
            WHERE u.email = 'student@vlab.edu.kh' 
            LIMIT 1
        )
        WHERE student_uuid IS NULL;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_ssp_student_uuid ON student_simulation_progress(student_uuid);
CREATE INDEX IF NOT EXISTS idx_ssp_simulation_id ON student_simulation_progress(simulation_id);
CREATE INDEX IF NOT EXISTS idx_ssp_created_at ON student_simulation_progress(created_at);

-- Add demo data if table is empty
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
LIMIT 3; -- Create progress for 3 simulations

COMMENT ON TABLE student_simulation_progress IS 
'Standardized student progress tracking with both old and new column names for compatibility';