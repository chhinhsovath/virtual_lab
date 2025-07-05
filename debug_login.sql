-- Debug Login Issues Script
-- Run this on your production database to diagnose login problems

-- 1. Check if users table exists and its structure
SELECT '=== USERS TABLE STRUCTURE ===' as debug_info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Check if user_sessions table exists and its structure
SELECT '=== USER_SESSIONS TABLE STRUCTURE ===' as debug_info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
ORDER BY ordinal_position;

-- 3. List all users
SELECT '=== EXISTING USERS ===' as debug_info;
SELECT 
    id,
    COALESCE(username, email) as username,
    email,
    name,
    role,
    CASE 
        WHEN password_hash IS NOT NULL THEN 'Has password'
        ELSE 'No password'
    END as password_status,
    COALESCE(is_active, true) as is_active
FROM users
ORDER BY id;

-- 4. Check for demo users
SELECT '=== DEMO USERS CHECK ===' as debug_info;
SELECT 
    id,
    email,
    name,
    role,
    COALESCE(is_active, true) as is_active
FROM users 
WHERE email LIKE '%demo%' OR username LIKE '%demo%';

-- 5. Check active sessions
SELECT '=== ACTIVE SESSIONS ===' as debug_info;
SELECT 
    COUNT(*) as total_sessions,
    COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_sessions,
    COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as expired_sessions
FROM user_sessions;

-- 6. Check for common issues
SELECT '=== POTENTIAL ISSUES ===' as debug_info;
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM users) THEN 'ERROR: No users in database'
        WHEN NOT EXISTS (SELECT 1 FROM users WHERE COALESCE(is_active, true) = true) THEN 'ERROR: No active users'
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN 'ERROR: password_hash column missing'
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'user_uuid') 
             AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'user_id') THEN 'INFO: Using user_uuid column (legacy)'
        ELSE 'Database structure looks OK'
    END as issue;