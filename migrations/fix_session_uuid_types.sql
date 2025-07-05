-- Fix user_sessions table to properly handle UUID types
-- This migration ensures consistent UUID handling between users and user_sessions tables

-- First, check current structure
DO $$
BEGIN
    -- Check if user_uuid column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_sessions' 
        AND column_name = 'user_uuid'
    ) THEN
        -- Ensure user_uuid is UUID type
        ALTER TABLE user_sessions 
        ALTER COLUMN user_uuid TYPE UUID USING user_uuid::UUID;
    END IF;

    -- Check if user_id column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_sessions' 
        AND column_name = 'user_id'
    ) THEN
        -- If we have both columns, drop user_id as it's redundant
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'user_sessions' 
            AND column_name = 'user_uuid'
        ) THEN
            ALTER TABLE user_sessions DROP COLUMN user_id;
        ELSE
            -- If we only have user_id, rename it to user_uuid and ensure it's UUID type
            ALTER TABLE user_sessions RENAME COLUMN user_id TO user_uuid;
            ALTER TABLE user_sessions 
            ALTER COLUMN user_uuid TYPE UUID USING user_uuid::UUID;
        END IF;
    END IF;

    -- Ensure we have the user_uuid column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_sessions' 
        AND column_name = 'user_uuid'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN user_uuid UUID;
    END IF;

    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'user_sessions_user_uuid_fkey'
        AND table_name = 'user_sessions'
    ) THEN
        ALTER TABLE user_sessions
        ADD CONSTRAINT user_sessions_user_uuid_fkey 
        FOREIGN KEY (user_uuid) REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    -- Create index for performance
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'user_sessions'
        AND indexname = 'idx_user_sessions_user_uuid'
    ) THEN
        CREATE INDEX idx_user_sessions_user_uuid ON user_sessions(user_uuid);
    END IF;

    -- Create index on session_token for performance
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'user_sessions'
        AND indexname = 'idx_user_sessions_session_token'
    ) THEN
        CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
    END IF;

    RAISE NOTICE 'User sessions table UUID types fixed successfully';
END $$;

-- Verify the structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_sessions'
ORDER BY ordinal_position;