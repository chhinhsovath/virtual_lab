-- Debug 500 Error Script
-- Run this to check what might be causing the login error

-- 1. Check users table structure
SELECT '=== USERS TABLE COLUMNS ===' as check_point;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 2. Check user_sessions table structure
SELECT '=== USER_SESSIONS TABLE COLUMNS ===' as check_point;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_sessions'
ORDER BY ordinal_position;

-- 3. Test the exact query the auth system uses
SELECT '=== TEST AUTH QUERY ===' as check_point;
SELECT 
    id,
    COALESCE(username, email) as username,
    email,
    name,
    role,
    COALESCE(is_active, true) as is_active,
    CASE 
        WHEN password_hash = '$2a$10$mL.bhjunphRtqVSZd0TmZu.a6uLq6rLki86o7RNhtT0UXAwTHhB4O' 
        THEN 'Password is demo123'
        ELSE 'Different password: ' || LEFT(password_hash, 20) || '...'
    END as password_check
FROM users 
WHERE (username = 'student@vlab.edu.kh' OR email = 'student@vlab.edu.kh') 
  AND COALESCE(is_active, true) = true;

-- 4. Check if required columns exist
SELECT '=== MISSING COLUMNS CHECK ===' as check_point;
SELECT 
    'users.is_active' as column_check,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_active'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'users.username',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'username'
    ) THEN 'EXISTS' ELSE 'MISSING' END
UNION ALL
SELECT 
    'users.password_hash',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password_hash'
    ) THEN 'EXISTS' ELSE 'MISSING' END
UNION ALL
SELECT 
    'user_sessions.user_id',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'user_id'
    ) THEN 'EXISTS' ELSE 'MISSING' END
UNION ALL
SELECT 
    'user_sessions.user_uuid',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'user_uuid'
    ) THEN 'EXISTS' ELSE 'MISSING' END;

-- 5. Clean up any existing sessions for testing
DELETE FROM user_sessions WHERE expires_at < NOW();

-- 6. Check database permissions
SELECT '=== DATABASE PERMISSIONS ===' as check_point;
SELECT current_user, current_database();