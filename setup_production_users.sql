-- Setup Production Users for Virtual Lab
-- This script creates the necessary users for the system

BEGIN;

-- 1. Ensure users table has all required columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Create unique index on email if not exists
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 3. Create the required users
-- Password for all users: demo123
-- Hash: $2a$10$mL.bhjunphRtqVSZd0TmZu.a6uLq6rLki86o7RNhtT0UXAwTHhB4O

-- Student account
INSERT INTO users (username, email, password_hash, name, role, is_active)
VALUES 
    ('student', 'student@vlab.edu.kh', '$2a$10$mL.bhjunphRtqVSZd0TmZu.a6uLq6rLki86o7RNhtT0UXAwTHhB4O', 'សិស្ស គំរូ', 'student', true)
ON CONFLICT (email) DO UPDATE 
SET 
    password_hash = EXCLUDED.password_hash,
    username = EXCLUDED.username,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = true;

-- Teacher account
INSERT INTO users (username, email, password_hash, name, role, is_active)
VALUES 
    ('teacher', 'teacher@vlab.edu.kh', '$2a$10$mL.bhjunphRtqVSZd0TmZu.a6uLq6rLki86o7RNhtT0UXAwTHhB4O', 'គ្រូ គំរូ', 'teacher', true)
ON CONFLICT (email) DO UPDATE 
SET 
    password_hash = EXCLUDED.password_hash,
    username = EXCLUDED.username,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = true;

-- Admin account
INSERT INTO users (username, email, password_hash, name, role, is_active)
VALUES 
    ('admin', 'admin@vlab.edu.kh', '$2a$10$mL.bhjunphRtqVSZd0TmZu.a6uLq6rLki86o7RNhtT0UXAwTHhB4O', 'អ្នកគ្រប់គ្រង', 'admin', true)
ON CONFLICT (email) DO UPDATE 
SET 
    password_hash = EXCLUDED.password_hash,
    username = EXCLUDED.username,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = true;

-- Additional demo accounts
INSERT INTO users (username, email, password_hash, name, role, is_active)
VALUES 
    ('demo_student', 'demo_student@example.com', '$2a$10$mL.bhjunphRtqVSZd0TmZu.a6uLq6rLki86o7RNhtT0UXAwTHhB4O', 'Demo Student', 'student', true),
    ('demo_teacher', 'demo_teacher@example.com', '$2a$10$mL.bhjunphRtqVSZd0TmZu.a6uLq6rLki86o7RNhtT0UXAwTHhB4O', 'Demo Teacher', 'teacher', true)
ON CONFLICT (email) DO UPDATE 
SET 
    password_hash = EXCLUDED.password_hash,
    username = EXCLUDED.username,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = true;

-- 4. Fix user_sessions table
-- Check if user_sessions exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
        CREATE TABLE user_sessions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            session_token VARCHAR(255) UNIQUE NOT NULL,
            user_role VARCHAR(50),
            ip_address INET,
            user_agent TEXT,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
        CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
    END IF;
END $$;

-- Handle the user_uuid column issue
DO $$ 
BEGIN
    -- If user_uuid exists but user_id doesn't, rename it
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'user_uuid') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'user_id') THEN
        ALTER TABLE user_sessions RENAME COLUMN user_uuid TO user_id;
    END IF;
    
    -- Ensure all required columns exist
    ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS user_role VARCHAR(50);
    ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS ip_address INET;
    ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS user_agent TEXT;
    ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
    ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
END $$;

-- 5. Clear expired sessions
DELETE FROM user_sessions WHERE expires_at < NOW();

COMMIT;

-- 6. Verify the setup
SELECT '=== Created Users ===' as info;
SELECT 
    id,
    username,
    email,
    name,
    role,
    is_active,
    CASE 
        WHEN password_hash IS NOT NULL THEN '✓ Has password'
        ELSE '✗ No password'
    END as password_status
FROM users 
WHERE email IN ('student@vlab.edu.kh', 'teacher@vlab.edu.kh', 'admin@vlab.edu.kh')
   OR email LIKE '%demo%'
ORDER BY role, email;

SELECT '=== User Sessions Table Check ===' as info;
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'user_sessions'
ORDER BY ordinal_position;

-- Test queries that the auth system will use
SELECT '=== Test Auth Query ===' as info;
SELECT 
    id,
    COALESCE(username, email) as username,
    email,
    name,
    role,
    CASE 
        WHEN password_hash = '$2a$10$mL.bhjunphRtqVSZd0TmZu.a6uLq6rLki86o7RNhtT0UXAwTHhB4O' THEN '✓ Password is demo123'
        ELSE '✗ Different password'
    END as password_check,
    COALESCE(is_active, true) as is_active
FROM users 
WHERE (username = 'student@vlab.edu.kh' OR email = 'student@vlab.edu.kh') 
  AND COALESCE(is_active, true) = true;