-- Database Comparison Script
-- Run this on both LOCAL and PRODUCTION databases to compare

-- 1. Database Overview
SELECT '=== DATABASE OVERVIEW ===' as section;
SELECT 
    current_database() as database_name,
    pg_database_size(current_database())/1024/1024 as size_mb,
    current_timestamp as checked_at;

-- 2. Count All Tables
SELECT '=== TOTAL TABLE COUNT ===' as section;
SELECT 
    COUNT(*) as total_tables,
    COUNT(CASE WHEN table_name LIKE 'tbl_%' THEN 1 END) as tbl_tables,
    COUNT(CASE WHEN table_name LIKE 'lms_%' THEN 1 END) as lms_tables,
    COUNT(CASE WHEN table_name LIKE 'student_%' THEN 1 END) as student_tables,
    COUNT(CASE WHEN table_name LIKE 'user_%' THEN 1 END) as user_tables,
    COUNT(CASE WHEN table_name LIKE 'simulation%' THEN 1 END) as simulation_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- 3. List All Tables with Row Counts
SELECT '=== ALL TABLES WITH ROW COUNTS ===' as section;
WITH table_counts AS (
    SELECT 
        table_name,
        (xpath('/row/cnt/text()', 
               query_to_xml(format('SELECT COUNT(*) AS cnt FROM %I', table_name), 
                            false, true, '')))[1]::text::int AS row_count
    FROM information_schema.tables
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
)
SELECT 
    table_name,
    row_count,
    CASE 
        WHEN table_name LIKE 'tbl_%' THEN 'Base TaRL'
        WHEN table_name LIKE 'lms_%' THEN 'LMS'
        WHEN table_name LIKE 'student_%' THEN 'Student'
        WHEN table_name LIKE 'user_%' THEN 'User/Auth'
        WHEN table_name LIKE 'simulation%' THEN 'Simulation'
        WHEN table_name = 'schema_migrations' THEN 'Migration'
        ELSE 'Other'
    END as category
FROM table_counts
ORDER BY category, table_name;

-- 4. Key Tables Detail
SELECT '=== KEY TABLES DETAIL ===' as section;

-- Users table
SELECT 'USERS TABLE:' as info;
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
    COUNT(CASE WHEN role = 'teacher' THEN 1 END) as teachers,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN COALESCE(is_active, true) = true THEN 1 END) as active_users
FROM users;

-- Students (tbl_child)
SELECT 'STUDENTS TABLE:' as info;
SELECT 
    COUNT(*) as total_students,
    COUNT(CASE WHEN chiStatus = 'Active' THEN 1 END) as active_students,
    COUNT(DISTINCT chiSchoolID) as schools_count,
    COUNT(CASE WHEN photo_url IS NOT NULL THEN 1 END) as with_photos
FROM tbl_child;

-- Simulations
SELECT 'SIMULATIONS:' as info;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'simulations_catalog') THEN
        EXECUTE 'SELECT COUNT(*) || '' simulations in simulations_catalog'' FROM simulations_catalog';
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stem_simulations_catalog') THEN
        EXECUTE 'SELECT COUNT(*) || '' simulations in stem_simulations_catalog'' FROM stem_simulations_catalog';
    ELSE
        RAISE NOTICE 'No simulation table found';
    END IF;
END $$;

-- Exercises  
SELECT 'EXERCISES:' as info;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'simulation_exercises') THEN
        EXECUTE 'SELECT COUNT(*) || '' exercises in simulation_exercises'' FROM simulation_exercises';
    ELSE
        RAISE NOTICE 'No exercise table found';
    END IF;
END $$;

-- Progress tracking
SELECT 'STUDENT PROGRESS:' as info;
SELECT 
    COUNT(*) as progress_records,
    COUNT(DISTINCT student_id) as unique_students,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
FROM student_simulation_progress
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_simulation_progress');

-- 5. Check Missing Tables
SELECT '=== TABLES COMPARISON ===' as section;
WITH expected_tables AS (
    SELECT unnest(ARRAY[
        -- Base TaRL tables
        'tbl_province',
        'tbl_school_list',
        'tbl_teacher_information',
        'tbl_child',
        'tbl_child_information',
        -- User/Auth tables
        'users',
        'user_sessions',
        'user_school_access',
        'user_permissions',
        -- LMS tables
        'lms_activity_logs',
        'lms_announcements',
        'lms_assignments',
        'lms_courses',
        'lms_resources',
        'lms_roles',
        'lms_permissions',
        -- Student tables
        'student_simulation_progress',
        'student_exercise_submissions',
        'student_achievements',
        'student_assignments',
        -- Simulation tables
        'simulations_catalog',
        'simulation_exercises',
        'lms_simulations',
        'lms_exercises',
        -- Other
        'schema_migrations',
        'districts',
        'clusters',
        'tarl_assessments',
        'tarl_student_selection'
    ]) AS table_name
),
existing_tables AS (
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
)
SELECT 
    et.table_name,
    CASE 
        WHEN ext.table_name IS NOT NULL THEN '✓ EXISTS'
        ELSE '✗ MISSING'
    END AS status
FROM expected_tables et
LEFT JOIN existing_tables ext ON et.table_name = ext.table_name
WHERE ext.table_name IS NULL
ORDER BY et.table_name;

-- 6. Schema Migrations Status
SELECT '=== MIGRATION STATUS ===' as section;
SELECT 
    COUNT(*) as total_migrations,
    MIN(applied_at) as first_migration,
    MAX(applied_at) as last_migration
FROM schema_migrations
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schema_migrations');

SELECT 
    migration_name,
    applied_at,
    applied_by
FROM schema_migrations
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schema_migrations')
ORDER BY applied_at DESC
LIMIT 10;