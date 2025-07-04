-- TaRL System - Simple User Seeding
-- This migration creates initial users with a simplified approach

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

-- Create teacher users for a sample of existing teachers (first 20 teachers to start)
-- Password: teacher123 (hashed with bcrypt)
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, teacher_id, is_active)
SELECT 
  CONCAT('teacher_', t.teacher_id), -- username: teacher_123, teacher_456, etc.
  CONCAT('teacher', t.teacher_id, '@tarl.edu.kh'), -- email
  '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', -- password_hash
  COALESCE(SPLIT_PART(t.name, ' ', 1), 'Teacher'), -- first_name
  COALESCE(NULLIF(SPLIT_PART(t.name, ' ', 2), ''), 'User'), -- last_name
  t.phone,
  t.teacher_id,
  true
FROM tbl_tarl_teacher t
WHERE t.teacher_id IS NOT NULL AND t.name IS NOT NULL
ORDER BY t.teacher_id
LIMIT 20; -- Start with first 20 teachers

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id, granted_by)
SELECT 
  u.id,
  r.id,
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
JOIN roles r ON (
  (u.username = 'superadmin' AND r.name = 'super_admin') OR
  (u.username = 'admin' AND r.name = 'admin') OR
  (u.username LIKE 'mentor_%' AND r.name = 'cluster_mentor') OR
  (u.username LIKE 'teacher_%' AND r.name = 'teacher')
);

-- Assign school access to admins (first 50 schools to avoid overwhelming)
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by)
SELECT 
  u.id,
  s.school_id,
  'admin',
  'all',
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
CROSS JOIN (
  SELECT school_id 
  FROM tbl_tarl_school 
  WHERE school_id IS NOT NULL 
  ORDER BY school_id 
  LIMIT 50
) s
WHERE u.username IN ('admin', 'superadmin');

-- Assign mentors to schools in their provinces (sample data)
-- Battambang mentor - schools in Battambang province
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by)
SELECT 
  u.id,
  s.school_id,
  'read',
  'all',
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
CROSS JOIN (
  SELECT school_id 
  FROM tbl_tarl_school 
  WHERE province LIKE '%បាត់ដំបង%' OR province LIKE '%Battambang%'
  ORDER BY school_id 
  LIMIT 10
) s
WHERE u.username = 'mentor_battambang';

-- Kampong Cham mentor - schools in Kampong Cham province
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by)
SELECT 
  u.id,
  s.school_id,
  'read',
  'all',
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
CROSS JOIN (
  SELECT school_id 
  FROM tbl_tarl_school 
  WHERE province LIKE '%កំពង់ចាម%' OR province LIKE '%Kampong Cham%'
  ORDER BY school_id 
  LIMIT 10
) s
WHERE u.username = 'mentor_kampongcham';

-- Teachers get write access to their own school
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by)
SELECT 
  u.id,
  t.school_id,
  'write',
  'all',
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
JOIN tbl_tarl_teacher t ON u.teacher_id = t.teacher_id
WHERE u.teacher_id IS NOT NULL AND t.school_id IS NOT NULL;

-- Create some sample viewer users
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
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by)
SELECT 
  u.id,
  s.school_id,
  'read',
  'all',
  '11111111-1111-1111-1111-111111111111'::uuid
FROM users u
CROSS JOIN (
  SELECT school_id 
  FROM tbl_tarl_school 
  ORDER BY school_id 
  LIMIT 5
) s
WHERE u.username = 'viewer_central';

COMMIT;

-- Display summary
SELECT 'Migration completed successfully!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_school_assignments FROM user_school_access;
SELECT r.display_name, COUNT(ur.user_id) as user_count
FROM roles r
LEFT JOIN user_roles ur ON r.id = ur.role_id
GROUP BY r.id, r.display_name
ORDER BY r.display_name;