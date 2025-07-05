-- Fix Password Hashes for Virtual Lab Users
-- This will set all passwords to 'demo123'

-- Update all vlab.edu.kh users with correct password hash for 'demo123'
UPDATE users 
SET password_hash = '$2a$10$mL.bhjunphRtqVSZd0TmZu.a6uLq6rLki86o7RNhtT0UXAwTHhB4O'
WHERE email IN (
    'student@vlab.edu.kh',
    'teacher@vlab.edu.kh', 
    'admin@vlab.edu.kh',
    'student@virtuallab.com',
    'teacher@virtuallab.com',
    'admin@virtuallab.com'
);

-- Also update the parent accounts if you want them to work
UPDATE users 
SET password_hash = '$2a$10$mL.bhjunphRtqVSZd0TmZu.a6uLq6rLki86o7RNhtT0UXAwTHhB4O'
WHERE email IN (
    'parent@vlab.edu.kh',
    'parent@virtuallab.com'
);

-- Verify the update
SELECT 
    id,
    email,
    name,
    role,
    CASE 
        WHEN password_hash = '$2a$10$mL.bhjunphRtqVSZd0TmZu.a6uLq6rLki86o7RNhtT0UXAwTHhB4O' 
        THEN '✓ Password is demo123'
        ELSE '✗ Different password'
    END as password_status
FROM users
ORDER BY email;