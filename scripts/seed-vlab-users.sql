-- Virtual Lab Demo Users Seed Script
-- Compatible with current TaRL database schema

-- Create Virtual Lab demo users (password for all: "demo123")
-- Password hash for "demo123": $2a$10$X4kv7j5ZcG39WgogSl16OuWKJm3mVkFXVXWHfIr6lNr5JYiARp5e6

-- Super Admin
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
    '550e8400-e29b-41d4-a716-446655440101',
    'superadmin@vlab.edu.kh',
    '$2a$10$X4kv7j5ZcG39WgogSl16OuWKJm3mVkFXVXWHfIr6lNr5JYiARp5e6',
    'Virtual Lab Super Admin',
    'super_admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Teacher Demo User
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
    '550e8400-e29b-41d4-a716-446655440102',
    'teacher@vlab.edu.kh',
    '$2a$10$X4kv7j5ZcG39WgogSl16OuWKJm3mVkFXVXWHfIr6lNr5JYiARp5e6',
    'សុខ សុភា (Sok Sophea)',
    'teacher',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Student Demo User
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
    '550e8400-e29b-41d4-a716-446655440103',
    'student@vlab.edu.kh',
    '$2a$10$X4kv7j5ZcG39WgogSl16OuWKJm3mVkFXVXWHfIr6lNr5JYiARp5e6',
    'លី សុវណ្ណ (Ly Sovann)',
    'student',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Parent Demo User
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
    '550e8400-e29b-41d4-a716-446655440104',
    'parent@vlab.edu.kh',
    '$2a$10$X4kv7j5ZcG39WgogSl16OuWKJm3mVkFXVXWHfIr6lNr5JYiARp5e6',
    'លី ចាន់ (Ly Chan)',
    'parent',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Display created demo users
SELECT 
    'Virtual Lab Demo Users Created:' as info
UNION ALL
SELECT 
    '-----------------------------------'
UNION ALL
SELECT 
    'Email: ' || email || ' | Password: demo123 | Role: ' || role as user_info
FROM users 
WHERE email IN (
    'superadmin@vlab.edu.kh',
    'teacher@vlab.edu.kh', 
    'student@vlab.edu.kh',
    'parent@vlab.edu.kh'
)
ORDER BY 1;