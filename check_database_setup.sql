-- Database Setup Check Script
-- Run this to see what tables exist and what might be missing

-- Check for essential tables
WITH required_tables AS (
    SELECT unnest(ARRAY[
        'tbl_child',
        'tbl_child_information',
        'tbl_teacher_information',
        'simulations_catalog',
        'lms_simulations',
        'simulation_exercises',
        'lms_exercises',
        'student_simulation_progress',
        'student_exercise_submissions',
        'lms_activity_logs',
        'users',
        'user_sessions'
    ]) AS table_name
),
existing_tables AS (
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
)
SELECT 
    rt.table_name,
    CASE 
        WHEN et.table_name IS NOT NULL THEN '✓ EXISTS'
        ELSE '✗ MISSING'
    END AS status
FROM required_tables rt
LEFT JOIN existing_tables et ON rt.table_name = et.table_name
ORDER BY 
    CASE WHEN et.table_name IS NULL THEN 0 ELSE 1 END,
    rt.table_name;

-- Check for simulation data
SELECT '---' AS separator;
SELECT 'Simulation Data Check:' AS section;

-- Check simulations
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lms_simulations') THEN
            'lms_simulations: ' || (SELECT COUNT(*) FROM lms_simulations)::text || ' simulations'
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'simulations_catalog') THEN
            'simulations_catalog: ' || (SELECT COUNT(*) FROM simulations_catalog)::text || ' simulations'
        ELSE
            'No simulation table found'
    END AS simulation_count;

-- Check exercises
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lms_exercises') THEN
            'lms_exercises: ' || (SELECT COUNT(*) FROM lms_exercises)::text || ' exercises'
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'simulation_exercises') THEN
            'simulation_exercises: ' || (SELECT COUNT(*) FROM simulation_exercises)::text || ' exercises'
        ELSE
            'No exercise table found'
    END AS exercise_count;

-- Check student progress
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_simulation_progress') THEN
            'student_simulation_progress: ' || (SELECT COUNT(*) FROM student_simulation_progress)::text || ' progress records'
        ELSE
            'No progress table found'
    END AS progress_count;

-- Check columns in tbl_child
SELECT '---' AS separator;
SELECT 'Student Profile Columns Check:' AS section;

SELECT 
    column_name,
    data_type,
    CASE 
        WHEN column_name IN ('photo_url', 'email', 'updated_at') THEN '✓ Required for profile'
        ELSE 'Standard column'
    END AS notes
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'tbl_child'
ORDER BY ordinal_position;