-- Vercel Production Database Migration
-- Run this SQL directly in your PostgreSQL client

BEGIN;

-- 1. Create users with correct password hash
INSERT INTO users (username, email, password_hash, name, role, is_active)
VALUES 
    ('student', 'student@vlab.edu.kh', '$2a$10$mL.bhjunphRtqVSZd0TmZu.a6uLq6rLki86o7RNhtT0UXAwTHhB4O', 'សិស្ស គំរូ', 'student', true),
    ('teacher', 'teacher@vlab.edu.kh', '$2a$10$mL.bhjunphRtqVSZd0TmZu.a6uLq6rLki86o7RNhtT0UXAwTHhB4O', 'គ្រូ គំរូ', 'teacher', true),
    ('admin', 'admin@vlab.edu.kh', '$2a$10$mL.bhjunphRtqVSZd0TmZu.a6uLq6rLki86o7RNhtT0UXAwTHhB4O', 'អ្នកគ្រប់គ្រង', 'admin', true)
ON CONFLICT (email) DO UPDATE 
SET 
    password_hash = EXCLUDED.password_hash,
    username = EXCLUDED.username,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = true;

-- 2. Ensure user_sessions table has correct structure
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS user_id INTEGER;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS user_role VARCHAR(50);

-- 3. Handle user_uuid to user_id rename if needed
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'user_uuid') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'user_id') THEN
        ALTER TABLE user_sessions RENAME COLUMN user_uuid TO user_id;
    END IF;
END $$;

COMMIT;

-- Verify users were created
SELECT email, role, is_active FROM users WHERE email LIKE '%vlab.edu.kh';