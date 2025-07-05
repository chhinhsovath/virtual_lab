-- Create missing tables and columns for Virtual Lab

-- Create student_assignment_submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS student_assignment_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID,
    student_id INTEGER,
    student_uuid UUID,
    score DECIMAL(5,2),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_student_assignment_submissions_assignment 
ON student_assignment_submissions(assignment_id);

CREATE INDEX IF NOT EXISTS idx_student_assignment_submissions_student_id 
ON student_assignment_submissions(student_id);

CREATE INDEX IF NOT EXISTS idx_student_assignment_submissions_student_uuid 
ON student_assignment_submissions(student_uuid);

-- Add metadata column to teacher_simulation_assignments if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teacher_simulation_assignments' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE teacher_simulation_assignments 
        ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Ensure all student tables have both student_id and student_uuid columns
DO $$
DECLARE
    tbl_name TEXT;
    tables TEXT[] := ARRAY[
        'student_simulation_progress',
        'student_exercise_submissions',
        'student_achievements',
        'student_assignment_submissions'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY tables
    LOOP
        -- Check if table exists
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = tbl_name
        ) THEN
            -- Add student_uuid if missing
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = tbl_name AND column_name = 'student_uuid'
            ) THEN
                EXECUTE format('ALTER TABLE %I ADD COLUMN student_uuid UUID', tbl_name);
                RAISE NOTICE 'Added student_uuid to %', tbl_name;
            END IF;
            
            -- Make student_id nullable if it's NOT NULL
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = tbl_name 
                AND column_name = 'student_id' 
                AND is_nullable = 'NO'
            ) THEN
                EXECUTE format('ALTER TABLE %I ALTER COLUMN student_id DROP NOT NULL', tbl_name);
                RAISE NOTICE 'Made student_id nullable in %', tbl_name;
            END IF;
        END IF;
    END LOOP;
END $$;

-- Report final state
SELECT 
    t.table_name,
    array_agg(
        CASE 
            WHEN c.column_name IN ('student_id', 'student_uuid', 'metadata') 
            THEN c.column_name || ' (' || c.data_type || ')'
            ELSE NULL
        END
        ORDER BY c.column_name
    ) FILTER (WHERE c.column_name IS NOT NULL) as relevant_columns
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
AND t.table_name IN (
    'teacher_simulation_assignments',
    'student_assignment_submissions',
    'student_simulation_progress',
    'student_exercise_submissions',
    'student_achievements'
)
GROUP BY t.table_name
ORDER BY t.table_name;