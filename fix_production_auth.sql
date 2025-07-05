-- Fix Production Authentication Issues
-- Run this script on your production database to fix login errors

BEGIN;

-- 1. Check and fix users table
-- Add missing columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- If password column exists but password_hash doesn't, rename it
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN
        ALTER TABLE users RENAME COLUMN password TO password_hash;
    END IF;
END $$;

-- 2. Check and fix user_sessions table structure
-- First, check what columns exist
DO $$ 
BEGIN
    -- If user_sessions doesn't exist, create it
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
    ELSE
        -- Add missing columns if table exists
        ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS user_role VARCHAR(50);
        ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS ip_address INET;
        ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS user_agent TEXT;
        
        -- Handle user_uuid vs user_id column
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'user_uuid') 
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'user_id') THEN
            -- Rename user_uuid to user_id
            ALTER TABLE user_sessions RENAME COLUMN user_uuid TO user_id;
        ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'user_id') 
              AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'user_uuid') THEN
            -- Add user_id column if neither exists
            ALTER TABLE user_sessions ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- 3. Create or update the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Add trigger to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 5. Create demo users if they don't exist (password: demo123)
INSERT INTO users (username, email, password_hash, name, role, is_active)
VALUES 
    ('demo_teacher', 'demo_teacher@example.com', '$2a$10$YnvL9y9RY0.nQqQjT7m2..XM6RXVsP5P.RvUXbR7GNKrH1qgHZf', 'Demo Teacher', 'teacher', true),
    ('demo_student', 'demo_student@example.com', '$2a$10$YnvL9y9RY0.nQqQjT7m2..XM6RXVsP5P.RvUXbR7GNKrH1qgHZf', 'Demo Student', 'student', true)
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash,
    is_active = true;

-- 6. Clear any expired sessions
DELETE FROM user_sessions WHERE expires_at < NOW();

COMMIT;

-- Verification queries
SELECT '=== Users Table Structure ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

SELECT '=== User Sessions Table Structure ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
ORDER BY ordinal_position;

SELECT '=== Demo Users ===' as info;
SELECT id, email, name, role, is_active 
FROM users 
WHERE email LIKE 'demo_%';