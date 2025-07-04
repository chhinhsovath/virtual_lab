-- Demo Users Seed Script for Virtual Lab LMS
-- This creates demo users for testing all roles

-- First, ensure the roles exist
INSERT INTO lms_roles (id, name, description, permissions, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'super_admin', 'Super Administrator with full system access', '["*"]', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'admin', 'Administrator with school management access', '["users.*", "courses.*", "labs.*", "reports.*"]', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'teacher', 'Teacher with course and lab management', '["courses.read", "courses.write", "labs.*", "students.read"]', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'student', 'Student with course access', '["courses.read", "labs.read", "labs.submit"]', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'parent', 'Parent with child monitoring access', '["students.read", "reports.read"]', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create demo users (password for all: "demo123")
-- Password hash for "demo123": $2a$10$X4kv7j5ZcG39WgogSl16OuWKJm3mVkFXVXWHfIr6lNr5JYiARp5e6

-- Super Admin
INSERT INTO users (
    id, 
    username, 
    email, 
    password_hash, 
    name, 
    first_name, 
    last_name,
    lms_role_id,
    role,
    roles,
    is_active,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440101',
    'superadmin',
    'superadmin@vlab.edu.kh',
    '$2a$10$X4kv7j5ZcG39WgogSl16OuWKJm3mVkFXVXWHfIr6lNr5JYiARp5e6',
    'Super Admin',
    'Super',
    'Admin',
    '550e8400-e29b-41d4-a716-446655440001',
    'super_admin',
    ARRAY['super_admin'],
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Teacher Demo User
INSERT INTO users (
    id, 
    username, 
    email, 
    password_hash, 
    name, 
    first_name, 
    last_name,
    lms_role_id,
    role,
    roles,
    is_active,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440102',
    'teacher.demo',
    'teacher@vlab.edu.kh',
    '$2a$10$X4kv7j5ZcG39WgogSl16OuWKJm3mVkFXVXWHfIr6lNr5JYiARp5e6',
    'សុខ សុភា (Sok Sophea)',
    'សុខ',
    'សុភា',
    '550e8400-e29b-41d4-a716-446655440003',
    'teacher',
    ARRAY['teacher'],
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Student Demo User
INSERT INTO users (
    id, 
    username, 
    email, 
    password_hash, 
    name, 
    first_name, 
    last_name,
    lms_role_id,
    role,
    roles,
    is_active,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440103',
    'student.demo',
    'student@vlab.edu.kh',
    '$2a$10$X4kv7j5ZcG39WgogSl16OuWKJm3mVkFXVXWHfIr6lNr5JYiARp5e6',
    'លី សុវណ្ណ (Ly Sovann)',
    'លី',
    'សុវណ្ណ',
    '550e8400-e29b-41d4-a716-446655440004',
    'student',
    ARRAY['student'],
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Parent Demo User
INSERT INTO users (
    id, 
    username, 
    email, 
    password_hash, 
    name, 
    first_name, 
    last_name,
    lms_role_id,
    role,
    roles,
    is_active,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440104',
    'parent.demo',
    'parent@vlab.edu.kh',
    '$2a$10$X4kv7j5ZcG39WgogSl16OuWKJm3mVkFXVXWHfIr6lNr5JYiARp5e6',
    'លី ចាន់ (Ly Chan)',
    'លី',
    'ចាន់',
    '550e8400-e29b-41d4-a716-446655440005',
    'parent',
    ARRAY['parent'],
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create parent-student relationship
INSERT INTO lms_parent_students (
    id,
    parent_id,
    student_id,
    relationship,
    created_at
) VALUES (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440104',
    '550e8400-e29b-41d4-a716-446655440103',
    'parent',
    NOW()
) ON CONFLICT (parent_id, student_id) DO NOTHING;

-- Create a demo course
INSERT INTO lms_courses (
    id,
    code,
    title,
    title_km,
    description,
    description_km,
    credits,
    duration_hours,
    is_active,
    created_by,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'SCI101',
    'Introduction to Virtual Science Labs',
    'ការណែនាំមន្ទីរពិសោធន៍វិទ្យាសាស្ត្រនិម្មិត',
    'Learn science through interactive virtual laboratory experiments',
    'រៀនវិទ្យាសាស្ត្រតាមរយៈការពិសោធន៍មន្ទីរពិសោធន៍និម្មិតអន្តរកម្ម',
    3,
    45,
    true,
    '550e8400-e29b-41d4-a716-446655440102',
    NOW(),
    NOW()
) ON CONFLICT (code) DO NOTHING;

-- Display created demo users
SELECT 
    'Demo Users Created:' as info
UNION ALL
SELECT 
    '-------------------'
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