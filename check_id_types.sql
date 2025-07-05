-- Check ID type mismatch between users and user_sessions

-- 1. Check users.id type
SELECT 
    'users.id' as table_column,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'id';

-- 2. Check user_sessions.user_id type
SELECT 
    'user_sessions.user_id' as table_column,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'user_sessions' AND column_name = 'user_id';

-- 3. Check user_sessions.user_uuid type
SELECT 
    'user_sessions.user_uuid' as table_column,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'user_sessions' AND column_name = 'user_uuid';

-- 4. Show sample user IDs
SELECT 
    id,
    email,
    pg_typeof(id) as id_type
FROM users
WHERE email LIKE '%vlab.edu.kh'
LIMIT 3;