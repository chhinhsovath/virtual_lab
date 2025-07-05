-- Fix user_sessions table to have only user_id column

-- 1. First, check which column has data
SELECT 
    COUNT(DISTINCT user_id) as user_id_count,
    COUNT(DISTINCT user_uuid) as user_uuid_count
FROM user_sessions;

-- 2. Copy any data from user_uuid to user_id if needed
UPDATE user_sessions 
SET user_id = user_uuid::INTEGER 
WHERE user_id IS NULL 
  AND user_uuid IS NOT NULL 
  AND user_uuid::TEXT ~ '^\d+$';  -- Only if user_uuid contains numeric values

-- 3. Drop the user_uuid column to avoid confusion
ALTER TABLE user_sessions DROP COLUMN IF EXISTS user_uuid;

-- 4. Ensure user_id is properly set as INTEGER
ALTER TABLE user_sessions 
ALTER COLUMN user_id TYPE INTEGER USING user_id::INTEGER;

-- 5. Add foreign key constraint if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_sessions_user_id_fkey'
    ) THEN
        ALTER TABLE user_sessions 
        ADD CONSTRAINT user_sessions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 6. Verify the structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_sessions'
ORDER BY ordinal_position;

-- 7. Clean up any invalid sessions
DELETE FROM user_sessions 
WHERE user_id IS NULL 
   OR user_id NOT IN (SELECT id FROM users);

-- 8. Show final status
SELECT 
    'Fixed! user_sessions now uses user_id column only' as status,
    COUNT(*) as session_count
FROM user_sessions;