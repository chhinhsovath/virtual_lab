-- Simple Database Comparison Script
-- Run on both LOCAL and PRODUCTION databases

-- 1. Database Info
SELECT '=== DATABASE: ' || current_database() || ' ===' as info;

-- 2. Table Count Summary
SELECT 
    COUNT(*) as total_tables,
    SUM(CASE WHEN table_name LIKE 'tbl_%' THEN 1 ELSE 0 END) as tbl_tables,
    SUM(CASE WHEN table_name LIKE 'lms_%' THEN 1 ELSE 0 END) as lms_tables,
    SUM(CASE WHEN table_name LIKE 'student_%' THEN 1 ELSE 0 END) as student_tables,
    SUM(CASE WHEN table_name LIKE 'user%' THEN 1 ELSE 0 END) as user_tables,
    SUM(CASE WHEN table_name LIKE 'simulation%' THEN 1 ELSE 0 END) as simulation_tables
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- 3. All Tables (sorted by category)
SELECT '=== TABLES LIST ===' as info;
SELECT 
    table_name,
    CASE 
        WHEN table_name LIKE 'tbl_%' THEN '1-TaRL'
        WHEN table_name LIKE 'user%' THEN '2-User'
        WHEN table_name LIKE 'lms_%' THEN '3-LMS'
        WHEN table_name LIKE 'student_%' THEN '4-Student'
        WHEN table_name LIKE 'simulation%' THEN '5-Simulation'
        ELSE '6-Other'
    END as category
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY category, table_name;

-- 4. Key Table Counts
SELECT '=== KEY TABLE RECORD COUNTS ===' as info;

-- Users
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
-- Students
SELECT 'tbl_child', COUNT(*) FROM tbl_child
UNION ALL
-- Teachers
SELECT 'tbl_teacher_information', COUNT(*) FROM tbl_teacher_information
UNION ALL
-- Schools
SELECT 'tbl_school_list', COUNT(*) FROM tbl_school_list
UNION ALL
-- Sessions
SELECT 'user_sessions', COUNT(*) FROM user_sessions
UNION ALL
-- Activities
SELECT 'lms_activity_logs', COUNT(*) FROM lms_activity_logs
UNION ALL
-- Student Progress
SELECT 'student_simulation_progress', COUNT(*) FROM student_simulation_progress
UNION ALL
-- Simulations (check both possible tables)
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'simulations_catalog') 
        THEN 'simulations_catalog'
        ELSE 'stem_simulations_catalog'
    END,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'simulations_catalog')
        THEN (SELECT COUNT(*) FROM simulations_catalog)
        ELSE (SELECT COUNT(*) FROM stem_simulations_catalog)
    END
UNION ALL
-- Exercises
SELECT 'simulation_exercises', COUNT(*) FROM simulation_exercises
ORDER BY table_name;

-- 5. Users by Role
SELECT '=== USERS BY ROLE ===' as info;
SELECT 
    role,
    COUNT(*) as count
FROM users
GROUP BY role
ORDER BY role;

-- 6. Critical Tables Check
SELECT '=== CRITICAL TABLES CHECK ===' as info;
WITH critical_tables AS (
    SELECT unnest(ARRAY[
        'users',
        'user_sessions',
        'tbl_child',
        'tbl_teacher_information',
        'tbl_school_list',
        'student_simulation_progress',
        'simulation_exercises',
        'lms_activity_logs'
    ]) AS table_name
)
SELECT 
    ct.table_name,
    CASE 
        WHEN it.table_name IS NOT NULL THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM critical_tables ct
LEFT JOIN information_schema.tables it 
    ON ct.table_name = it.table_name 
    AND it.table_schema = 'public'
ORDER BY status DESC, ct.table_name;