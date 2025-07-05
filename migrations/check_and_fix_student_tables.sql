-- First, let's check what tables and columns actually exist
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
AND t.table_name IN ('student_simulation_progress', 'student_exercise_submissions', 'student_achievements')
AND c.column_name IN ('student_id', 'student_uuid')
ORDER BY t.table_name, c.column_name;

-- Check if the tables exist at all
SELECT 
    table_name,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = t.table_name 
        AND table_schema = 'public'
    ) as exists
FROM (VALUES 
    ('student_simulation_progress'),
    ('student_exercise_submissions'),
    ('student_achievements')
) t(table_name);

-- Safe migration that checks for table existence first
DO $$
BEGIN
    -- Only proceed if student_simulation_progress exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'student_simulation_progress' 
        AND table_schema = 'public'
    ) THEN
        -- Check current column structure
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'student_simulation_progress' 
            AND column_name = 'student_uuid'
        ) THEN
            BEGIN
                ALTER TABLE student_simulation_progress ADD COLUMN student_uuid UUID;
                RAISE NOTICE 'Added student_uuid to student_simulation_progress';
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Could not add student_uuid to student_simulation_progress: %', SQLERRM;
            END;
        END IF;
        
        -- Make student_id nullable if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'student_simulation_progress' 
            AND column_name = 'student_id'
            AND is_nullable = 'NO'
        ) THEN
            BEGIN
                ALTER TABLE student_simulation_progress ALTER COLUMN student_id DROP NOT NULL;
                RAISE NOTICE 'Made student_id nullable in student_simulation_progress';
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Could not alter student_id in student_simulation_progress: %', SQLERRM;
            END;
        END IF;
    END IF;

    -- Only proceed if student_exercise_submissions exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'student_exercise_submissions' 
        AND table_schema = 'public'
    ) THEN
        -- Check current column structure
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'student_exercise_submissions' 
            AND column_name = 'student_uuid'
        ) THEN
            BEGIN
                ALTER TABLE student_exercise_submissions ADD COLUMN student_uuid UUID;
                RAISE NOTICE 'Added student_uuid to student_exercise_submissions';
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Could not add student_uuid to student_exercise_submissions: %', SQLERRM;
            END;
        END IF;
        
        -- Make student_id nullable if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'student_exercise_submissions' 
            AND column_name = 'student_id'
            AND is_nullable = 'NO'
        ) THEN
            BEGIN
                ALTER TABLE student_exercise_submissions ALTER COLUMN student_id DROP NOT NULL;
                RAISE NOTICE 'Made student_id nullable in student_exercise_submissions';
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Could not alter student_id in student_exercise_submissions: %', SQLERRM;
            END;
        END IF;
    END IF;

    -- Only proceed if student_achievements exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'student_achievements' 
        AND table_schema = 'public'
    ) THEN
        -- Check current column structure
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'student_achievements' 
            AND column_name = 'student_uuid'
        ) THEN
            BEGIN
                ALTER TABLE student_achievements ADD COLUMN student_uuid UUID;
                RAISE NOTICE 'Added student_uuid to student_achievements';
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Could not add student_uuid to student_achievements: %', SQLERRM;
            END;
        END IF;
        
        -- Make student_id nullable if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'student_achievements' 
            AND column_name = 'student_id'
            AND is_nullable = 'NO'
        ) THEN
            BEGIN
                ALTER TABLE student_achievements ALTER COLUMN student_id DROP NOT NULL;
                RAISE NOTICE 'Made student_id nullable in student_achievements';
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Could not alter student_id in student_achievements: %', SQLERRM;
            END;
        END IF;
    END IF;
END $$;

-- Try to create indexes, ignore if they fail
DO $$
BEGIN
    -- Create indexes only if tables and columns exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'student_simulation_progress' 
        AND column_name = 'student_uuid'
    ) THEN
        BEGIN
            CREATE INDEX idx_student_simulation_progress_student_uuid ON student_simulation_progress(student_uuid);
            RAISE NOTICE 'Created index on student_simulation_progress.student_uuid';
        EXCEPTION
            WHEN duplicate_table THEN
                RAISE NOTICE 'Index already exists on student_simulation_progress.student_uuid';
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not create index: %', SQLERRM;
        END;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'student_exercise_submissions' 
        AND column_name = 'student_uuid'
    ) THEN
        BEGIN
            CREATE INDEX idx_student_exercise_submissions_student_uuid ON student_exercise_submissions(student_uuid);
            RAISE NOTICE 'Created index on student_exercise_submissions.student_uuid';
        EXCEPTION
            WHEN duplicate_table THEN
                RAISE NOTICE 'Index already exists on student_exercise_submissions.student_uuid';
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not create index: %', SQLERRM;
        END;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'student_achievements' 
        AND column_name = 'student_uuid'
    ) THEN
        BEGIN
            CREATE INDEX idx_student_achievements_student_uuid ON student_achievements(student_uuid);
            RAISE NOTICE 'Created index on student_achievements.student_uuid';
        EXCEPTION
            WHEN duplicate_table THEN
                RAISE NOTICE 'Index already exists on student_achievements.student_uuid';
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not create index: %', SQLERRM;
        END;
    END IF;
END $$;

-- Final verification
SELECT 
    'Final state:' as status,
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
AND t.table_name IN ('student_simulation_progress', 'student_exercise_submissions', 'student_achievements')
AND (c.column_name IN ('student_id', 'student_uuid') OR c.column_name IS NULL)
ORDER BY t.table_name, c.column_name;