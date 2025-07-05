-- Fix missing columns in users table

-- 1. Add is_active column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Add username column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255);

-- 3. Add any other potentially missing columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- 4. Update username to match email if empty
UPDATE users 
SET username = email 
WHERE username IS NULL;

-- 5. Ensure all users are active
UPDATE users 
SET is_active = true 
WHERE is_active IS NULL;

-- 6. Verify the structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 7. Test the auth query
SELECT 
    id,
    COALESCE(username, email) as username,
    email,
    name,
    role,
    password_hash,
    COALESCE(is_active, true) as is_active
FROM users 
WHERE email = 'student@vlab.edu.kh';