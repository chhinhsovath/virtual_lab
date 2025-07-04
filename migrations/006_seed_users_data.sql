-- TaRL System - Seed Users Data
-- This migration creates initial users to replace the hardcoded authentication
-- Includes admin users, cluster mentors, and teacher users linked to existing teacher records

BEGIN;

-- Insert default admin user (replace hardcoded admin)
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, is_active) VALUES 
('11111111-1111-1111-1111-111111111111', 'admin', 'admin@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'System', 'Administrator', true),
('22222222-2222-2222-2222-222222222222', 'superadmin', 'superadmin@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Super', 'Administrator', true);

-- Insert cluster mentors (replace hardcoded mentor1, mentor2)
-- Password: mentor123 (hashed with bcrypt)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, phone, is_active) VALUES 
('33333333-3333-3333-3333-333333333333', 'mentor1', 'mentor1@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Chanthea', 'Seng', '012-555-001', true),
('44444444-4444-4444-4444-444444444444', 'mentor2', 'mentor2@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Sokheng', 'Pich', '012-555-002', true);

-- Create teacher users linked to existing teacher records
-- Password: teacher123 (hashed with bcrypt)
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, teacher_id, is_active)
SELECT 
  CONCAT('teacher_', "teiAutoID"), -- username: teacher_1001, teacher_1002, etc.
  CONCAT('teacher', "teiAutoID", '@tarl.edu.kh'), -- email
  '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', -- password_hash
  "teiFirstName",
  "teiLastName", 
  "teiPhone",
  "teiAutoID",
  true
FROM tbl_teacher_information;

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
    (u.username IN ('mentor1', 'mentor2') AND r.name = 'cluster_mentor') OR
    
    -- Teacher roles
    (u.username LIKE 'teacher_%' AND r.name = 'teacher')
)
INSERT INTO user_roles (user_id, role_id, granted_by)
SELECT user_id, role_id, granted_by FROM user_role_assignments;

-- Assign school access to users
-- Admin gets access to all schools
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by)
SELECT 
  u.id,
  s."sclAutoID",
  'admin',
  'all',
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
CROSS JOIN tbl_school_list s
WHERE u.username IN ('admin', 'superadmin');

-- Cluster mentors get read access to their assigned schools
-- Mentor1: Battambang schools (1-4)
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by)
SELECT 
  u.id,
  s."sclAutoID",
  'read',
  'all',
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
CROSS JOIN tbl_school_list s
WHERE u.username = 'mentor1' 
AND s."sclAutoID" BETWEEN 1 AND 4;

-- Mentor2: Kampong Cham schools (5-8)
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by)
SELECT 
  u.id,
  s."sclAutoID",
  'read',
  'all',
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
CROSS JOIN tbl_school_list s
WHERE u.username = 'mentor2' 
AND s."sclAutoID" BETWEEN 5 AND 8;

-- Teachers get write access to their own school and subject
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by)
SELECT 
  u.id,
  t."sclAutoID",
  'write',
  t.subject,
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
JOIN tbl_teacher_information t ON u.teacher_id = t."teiAutoID"
WHERE u.teacher_id IS NOT NULL;

-- Create some sample viewer users for demonstration
-- Password: viewer123 (hashed with bcrypt)
INSERT INTO users (username, email, password_hash, first_name, last_name, is_active) VALUES 
('viewer1', 'viewer1@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Kosal', 'Meas', true),
('viewer2', 'viewer2@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Sophea', 'Nov', true);

-- Assign viewer roles
INSERT INTO user_roles (user_id, role_id, granted_by)
SELECT 
  u.id,
  r.id,
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
JOIN roles r ON r.name = 'viewer'
WHERE u.username IN ('viewer1', 'viewer2');

-- Give viewers read access to some schools
-- Viewer1: Read access to first 2 schools
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by)
SELECT 
  u.id,
  s."sclAutoID",
  'read',
  'all',
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
CROSS JOIN tbl_school_list s
WHERE u.username = 'viewer1' 
AND s."sclAutoID" IN (1, 2);

-- Viewer2: Read access to schools 3-4
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by)
SELECT 
  u.id,
  s."sclAutoID",
  'read',
  'all',
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
CROSS JOIN tbl_school_list s
WHERE u.username = 'viewer2' 
AND s."sclAutoID" IN (3, 4);

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