-- Simplified Virtual Lab LMS Roles
-- Clear role hierarchy with specific permissions

-- Clean up existing demo users first
DELETE FROM users WHERE email LIKE '%@vlab.edu.kh%';

-- Insert simplified demo users with correct password hash
-- Password for all: "demo123" = $2a$10$50jnOHNerr9R/vRJ30SLnOFpmrGrwvH0lp0xFujDR6CkFoPYvZUNe

-- 1. Super Admin - Platform-wide administrator
INSERT INTO users (
    id, 
    email, 
    password_hash, 
    name, 
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'admin@vlab.edu.kh',
    '$2a$10$50jnOHNerr9R/vRJ30SLnOFpmrGrwvH0lp0xFujDR6CkFoPYvZUNe',
    'Virtual Lab Administrator',
    'super_admin',
    true,
    NOW(),
    NOW()
);

-- 2. Teacher - Lab creator and assessor
INSERT INTO users (
    id, 
    email, 
    password_hash, 
    name, 
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'teacher@vlab.edu.kh',
    '$2a$10$50jnOHNerr9R/vRJ30SLnOFpmrGrwvH0lp0xFujDR6CkFoPYvZUNe',
    'សុខ សុភា (Teacher Demo)',
    'teacher',
    true,
    NOW(),
    NOW()
);

-- 3. Student - Lab participant
INSERT INTO users (
    id, 
    email, 
    password_hash, 
    name, 
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    'student@vlab.edu.kh',
    '$2a$10$50jnOHNerr9R/vRJ30SLnOFpmrGrwvH0lp0xFujDR6CkFoPYvZUNe',
    'លី សុវណ្ណ (Student Demo)',
    'student',
    true,
    NOW(),
    NOW()
);

-- 4. Parent - Child monitor
INSERT INTO users (
    id, 
    email, 
    password_hash, 
    name, 
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440004',
    'parent@vlab.edu.kh',
    '$2a$10$50jnOHNerr9R/vRJ30SLnOFpmrGrwvH0lp0xFujDR6CkFoPYvZUNe',
    'លី ចាន់ (Parent Demo)',
    'parent',
    true,
    NOW(),
    NOW()
);

-- Display the simplified demo users
SELECT 
    '=== SIMPLIFIED VIRTUAL LAB DEMO ACCOUNTS ===' as info
UNION ALL
SELECT 
    'Email: ' || email || ' | Role: ' || 
    CASE 
        WHEN role = 'super_admin' THEN 'Administrator'
        WHEN role = 'teacher' THEN 'Teacher'
        WHEN role = 'student' THEN 'Student'
        WHEN role = 'parent' THEN 'Parent'
    END || ' | Password: demo123' as user_info
FROM users 
WHERE email LIKE '%@vlab.edu.kh%'
ORDER BY 
    CASE role
        WHEN 'super_admin' THEN 1
        WHEN 'teacher' THEN 2
        WHEN 'student' THEN 3
        WHEN 'parent' THEN 4
    END;