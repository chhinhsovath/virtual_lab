-- Production Database Check
-- Run this on your PRODUCTION database and share the results

-- 1. Basic Info
SELECT 
    '=== PRODUCTION DATABASE ===' as info,
    current_database() as database,
    NOW() as checked_at;

-- 2. Table Summary
SELECT 
    '=== TABLE SUMMARY ===' as info;
SELECT 
    COUNT(*) as total_tables,
    SUM(CASE WHEN table_name LIKE 'tbl_%' THEN 1 ELSE 0 END) as tbl_tables,
    SUM(CASE WHEN table_name LIKE 'lms_%' THEN 1 ELSE 0 END) as lms_tables,
    SUM(CASE WHEN table_name LIKE 'student_%' THEN 1 ELSE 0 END) as student_tables,
    SUM(CASE WHEN table_name LIKE 'user%' THEN 1 ELSE 0 END) as user_tables
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- 3. Critical Tables
SELECT '=== CRITICAL TABLES ===' as info;
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'users' THEN (SELECT COUNT(*) FROM users)
        WHEN table_name = 'user_sessions' THEN (SELECT COUNT(*) FROM user_sessions WHERE table_name = 'user_sessions')
        WHEN table_name = 'tbl_child' THEN (SELECT COUNT(*) FROM tbl_child WHERE table_name = 'tbl_child')
        WHEN table_name = 'tbl_school_list' THEN (SELECT COUNT(*) FROM tbl_school_list WHERE table_name = 'tbl_school_list')
        ELSE 0
    END as record_count
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'user_sessions', 'tbl_child', 'tbl_school_list', 'tbl_teacher_information')
ORDER BY table_name;

-- 4. Users Check
SELECT '=== USERS CHECK ===' as info;
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN email LIKE '%vlab.edu.kh' THEN 1 ELSE 0 END) as vlab_users,
    SUM(CASE WHEN email LIKE '%demo%' THEN 1 ELSE 0 END) as demo_users
FROM users
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users');

-- 5. User Sessions Structure
SELECT '=== USER_SESSIONS COLUMNS ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_sessions'
ORDER BY ordinal_position;

-- 6. Missing Tables
SELECT '=== MISSING CRITICAL TABLES ===' as info;
WITH required_tables AS (
    SELECT unnest(ARRAY[
        'users',
        'user_sessions',
        'tbl_child',
        'tbl_child_information',
        'tbl_school_list',
        'tbl_teacher_information',
        'student_simulation_progress',
        'simulation_exercises',
        'simulations_catalog'
    ]) AS table_name
)
SELECT 
    rt.table_name as missing_table
FROM required_tables rt
LEFT JOIN information_schema.tables it 
    ON rt.table_name = it.table_name 
    AND it.table_schema = 'public'
WHERE it.table_name IS NULL;

-- 7. Test User Lookup
SELECT '=== TEST USER LOOKUP ===' as info;
SELECT 
    id,
    COALESCE(username, email) as username,
    email,
    role,
    COALESCE(is_active, true) as is_active,
    CASE 
        WHEN password_hash IS NOT NULL THEN 'Has password'
        ELSE 'No password'
    END as password_status
FROM users
WHERE email IN ('student@vlab.edu.kh', 'teacher@vlab.edu.kh', 'admin@vlab.edu.kh')
   OR email LIKE '%demo%'
ORDER BY email;