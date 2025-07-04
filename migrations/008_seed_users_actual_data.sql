-- TaRL System - Seed Users Data for Actual Database Schema
-- This migration creates initial users based on the existing tbl_tarl_* data

BEGIN;

-- Insert default admin users
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, is_active) VALUES 
('11111111-1111-1111-1111-111111111111', 'admin', 'admin@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'System', 'Administrator', true),
('22222222-2222-2222-2222-222222222222', 'superadmin', 'superadmin@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Super', 'Administrator', true);

-- Insert cluster mentors for different provinces/zones
-- Password: mentor123 (hashed with bcrypt)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, phone, is_active) VALUES 
('33333333-3333-3333-3333-333333333333', 'mentor_battambang', 'mentor.battambang@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Chanthea', 'Seng', '012-555-001', true),
('44444444-4444-4444-4444-444444444444', 'mentor_kampongcham', 'mentor.kampongcham@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Sokheng', 'Pich', '012-555-002', true),
('55555555-5555-5555-5555-555555555555', 'mentor_kandal', 'mentor.kandal@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Sophea', 'Chan', '012-555-003', true),
('66666666-6666-6666-6666-666666666666', 'mentor_siemreap', 'mentor.siemreap@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Pisach', 'Ly', '012-555-004', true);

-- Create teacher users for a sample of existing teachers (first 100 teachers to avoid overloading)
-- Password: teacher123 (hashed with bcrypt)
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, teacher_id, is_active)
SELECT 
  CONCAT('teacher_', t.teacher_id), -- username: teacher_123, teacher_456, etc.
  CASE 
    WHEN t.email IS NOT NULL AND t.email != '' THEN t.email
    ELSE CONCAT('teacher', t.teacher_id, '@tarl.edu.kh')
  END, -- email
  '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', -- password_hash
  SPLIT_PART(t.name, ' ', 1), -- first_name (first word of name)
  CASE 
    WHEN ARRAY_LENGTH(STRING_TO_ARRAY(t.name, ' '), 1) > 1 
    THEN ARRAY_TO_STRING(STRING_TO_ARRAY(t.name, ' ')[2:], ' ')
    ELSE 'Teacher'
  END, -- last_name (remaining words or default)
  t.phone,
  t.teacher_id,
  true
FROM tbl_tarl_teacher t
WHERE t.teacher_id IS NOT NULL
LIMIT 100; -- Start with first 100 teachers

-- Assign roles to users
WITH user_role_assignments AS (
  SELECT 
    u.id as user_id,
    r.id as role_id,
    '11111111-1111-1111-1111-111111111111'::uuid as granted_by -- Admin user
  FROM users u
  CROSS JOIN roles r
  WHERE 
    -- Super admin role
    (u.username = 'superadmin' AND r.name = 'super_admin') OR
    
    -- Admin role
    (u.username = 'admin' AND r.name = 'admin') OR
    
    -- Cluster mentor roles
    (u.username LIKE 'mentor_%' AND r.name = 'cluster_mentor') OR
    
    -- Teacher roles
    (u.username LIKE 'teacher_%' AND r.name = 'teacher')
)
INSERT INTO user_roles (user_id, role_id, granted_by)
SELECT user_id, role_id, granted_by FROM user_role_assignments;

-- Assign school access to users
-- Super admin and admin get access to all schools
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by)
SELECT 
  u.id,
  s.school_id,
  'admin',
  'all',
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
CROSS JOIN (SELECT DISTINCT school_id FROM tbl_tarl_school LIMIT 50) s -- Start with 50 schools to avoid overwhelming
WHERE u.username IN ('admin', 'superadmin');

-- Assign cluster mentors to their respective provinces
-- Battambang mentor
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by)
SELECT 
  u.id,
  s.school_id,
  'read',
  'all',
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
CROSS JOIN tbl_tarl_school s
WHERE u.username = 'mentor_battambang' 
AND s.province = 'បាត់ដំបង' -- Battambang in Khmer
LIMIT 20; -- Limit to 20 schools per mentor initially

-- Kampong Cham mentor
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by)
SELECT 
  u.id,
  s.school_id,
  'read',
  'all',
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
CROSS JOIN tbl_tarl_school s
WHERE u.username = 'mentor_kampongcham' 
AND s.province = 'កំពង់ចាម' -- Kampong Cham in Khmer
LIMIT 20;

-- Kandal mentor
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by)
SELECT 
  u.id,
  s.school_id,
  'read',
  'all',
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
CROSS JOIN tbl_tarl_school s
WHERE u.username = 'mentor_kandal' 
AND s.province = 'កណ្តាល' -- Kandal in Khmer
LIMIT 20;

-- Siem Reap mentor
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by)
SELECT 
  u.id,
  s.school_id,
  'read',
  'all',
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
CROSS JOIN tbl_tarl_school s
WHERE u.username = 'mentor_siemreap' 
AND s.province = 'សៀមរាប' -- Siem Reap in Khmer
LIMIT 20;

-- Teachers get write access to their own school
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by)
SELECT 
  u.id,
  t.school_id,
  'write',
  'all', -- Teachers can handle both subjects initially
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
JOIN tbl_tarl_teacher t ON u.teacher_id = t.teacher_id
WHERE u.teacher_id IS NOT NULL;

-- Create some sample viewer users for demonstration
-- Password: viewer123 (hashed with bcrypt)
INSERT INTO users (username, email, password_hash, first_name, last_name, is_active) VALUES 
('viewer_central', 'viewer.central@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Kosal', 'Meas', true),
('viewer_regional', 'viewer.regional@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Sophea', 'Nov', true);

-- Assign viewer roles
INSERT INTO user_roles (user_id, role_id, granted_by)
SELECT 
  u.id,
  r.id,
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
JOIN roles r ON r.name = 'viewer'
WHERE u.username IN ('viewer_central', 'viewer_regional');

-- Give viewers read access to some schools
-- Central viewer: Read access to schools in major provinces
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by)
SELECT 
  u.id,
  s.school_id,
  'read',
  'all',
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
CROSS JOIN tbl_tarl_school s
WHERE u.username = 'viewer_central' 
AND s.province IN ('ភ្នំពេញ', 'កណ្តាល') -- Phnom Penh, Kandal
LIMIT 10;

-- Regional viewer: Read access to other provinces
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by)
SELECT 
  u.id,
  s.school_id,
  'read',
  'all',
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
CROSS JOIN tbl_tarl_school s
WHERE u.username = 'viewer_regional' 
AND s.province IN ('បាត់ដំបង', 'កំពង់ចាម') -- Battambang, Kampong Cham
LIMIT 10;

COMMIT;

-- Display created users summary
SELECT 'Created Users Summary:' as info;
SELECT 
  u.username,
  u.first_name,
  u.last_name,
  u.email,
  STRING_AGG(r.display_name, ', ') as roles,
  CASE 
    WHEN u.teacher_id IS NOT NULL THEN CONCAT('Linked to Teacher ID: ', u.teacher_id)
    ELSE 'No teacher link'
  END as teacher_info
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = true
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.username, u.first_name, u.last_name, u.email, u.teacher_id
ORDER BY u.username;

-- Display school access summary
SELECT 'School Access Summary:' as info;
SELECT 
  u.username,
  COUNT(usa.school_id) as accessible_schools,
  STRING_AGG(DISTINCT usa.access_type, ', ') as access_types,
  STRING_AGG(DISTINCT usa.subject, ', ') as subjects
FROM users u
LEFT JOIN user_school_access usa ON u.id = usa.user_id AND usa.is_active = true
GROUP BY u.id, u.username
ORDER BY u.username;

-- Display province distribution
SELECT 'Province Coverage:' as info;
SELECT 
  COALESCE(s.province, 'No Province') as province,
  COUNT(DISTINCT usa.user_id) as users_with_access,
  COUNT(DISTINCT usa.school_id) as schools_accessible
FROM user_school_access usa
LEFT JOIN tbl_tarl_school s ON usa.school_id = s.school_id
GROUP BY s.province
ORDER BY users_with_access DESC;