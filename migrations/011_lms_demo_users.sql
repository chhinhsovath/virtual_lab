-- LMS Demo Users Migration
-- Creates demo users for all LMS roles with proper credentials and permissions

BEGIN;

-- Hash for password 'demo123': $2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2

-- Delete existing LMS demo users
DELETE FROM user_school_access WHERE user_id IN (
  SELECT id FROM users WHERE username IN (
    'student_demo', 'parent_demo', 'guardian_demo', 'assistant_teacher_demo',
    'principal_demo', 'librarian_demo', 'counselor_demo', 'super_admin_demo'
  )
);

DELETE FROM user_roles WHERE user_id IN (
  SELECT id FROM users WHERE username IN (
    'student_demo', 'parent_demo', 'guardian_demo', 'assistant_teacher_demo',
    'principal_demo', 'librarian_demo', 'counselor_demo', 'super_admin_demo'
  )
);

DELETE FROM users WHERE username IN (
  'student_demo', 'parent_demo', 'guardian_demo', 'assistant_teacher_demo',
  'principal_demo', 'librarian_demo', 'counselor_demo', 'super_admin_demo'
);

-- Insert LMS Demo Users
INSERT INTO users (id, username, email, password_hash, first_name, last_name, phone, is_active, academic_status, enrollment_date) VALUES 
-- Super Admin Demo
('super001-0000-0000-0000-000000000001', 'super_admin_demo', 'superadmin@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Super', 'Administrator', '012-000-001', true, 'active', '2024-01-01'),

-- Principal Demo
('principal01-0000-0000-0000-000000000001', 'principal_demo', 'principal@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Sophea', 'Principal', '012-000-002', true, 'active', '2024-01-01'),

-- Assistant Teacher Demo
('assistant01-0000-0000-0000-000000000001', 'assistant_teacher_demo', 'assistant@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Maly', 'Assistant', '012-000-003', true, 'active', '2024-01-01'),

-- Librarian Demo
('librarian01-0000-0000-0000-000000000001', 'librarian_demo', 'librarian@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Chanthy', 'Librarian', '012-000-004', true, 'active', '2024-01-01'),

-- Counselor Demo
('counselor01-0000-0000-0000-000000000001', 'counselor_demo', 'counselor@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Pisach', 'Counselor', '012-000-005', true, 'active', '2024-01-01'),

-- Student Demo
('student001-0000-0000-0000-000000000001', 'student_demo', 'student@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Dara', 'Student', null, true, 'active', '2024-01-01'),

-- Parent Demo
('parent001-0000-0000-0000-000000000001', 'parent_demo', 'parent@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Srey', 'Parent', '012-000-006', true, 'active', '2024-01-01'),

-- Guardian Demo
('guardian01-0000-0000-0000-000000000001', 'guardian_demo', 'guardian@tarl.edu.kh', '$2b$12$LQv3c1yqBwEHxv677s4yUOKvOKwdNKNJWKvGYVXIGwILCiQTuUdj2', 'Kolap', 'Guardian', '012-000-007', true, 'active', '2024-01-01');

-- Assign roles to LMS demo users
INSERT INTO user_roles (user_id, role_id, granted_by, is_active) 
SELECT 
  u.id,
  r.id,
  'super001-0000-0000-0000-000000000001'::uuid,
  true
FROM users u
CROSS JOIN roles r
WHERE 
  -- Super Admin role
  (u.username = 'super_admin_demo' AND r.name = 'super_admin') OR
  
  -- Principal role
  (u.username = 'principal_demo' AND r.name = 'principal') OR
  
  -- Assistant Teacher role
  (u.username = 'assistant_teacher_demo' AND r.name = 'assistant_teacher') OR
  
  -- Librarian role
  (u.username = 'librarian_demo' AND r.name = 'librarian') OR
  
  -- Counselor role
  (u.username = 'counselor_demo' AND r.name = 'counselor') OR
  
  -- Student role
  (u.username = 'student_demo' AND r.name = 'student') OR
  
  -- Parent role
  (u.username = 'parent_demo' AND r.name = 'parent') OR
  
  -- Guardian role
  (u.username = 'guardian_demo' AND r.name = 'guardian');

-- Grant school access to demo users
-- Super Admin gets access to all schools
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by, is_active)
SELECT 
  u.id,
  s.sclAutoID,
  'admin',
  'all',
  'super001-0000-0000-0000-000000000001'::uuid,
  true
FROM users u
CROSS JOIN (SELECT sclAutoID FROM tbl_school_list WHERE sclAutoID IS NOT NULL LIMIT 10) s
WHERE u.username = 'super_admin_demo';

-- Principal gets admin access to schools 1-3
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by, is_active)
SELECT 
  u.id,
  s.sclAutoID,
  'admin',
  'all',
  'super001-0000-0000-0000-000000000001'::uuid,
  true
FROM users u
CROSS JOIN (SELECT sclAutoID FROM tbl_school_list WHERE sclAutoID IN (1,2,3) AND sclAutoID IS NOT NULL) s
WHERE u.username = 'principal_demo';

-- Assistant Teacher gets write access to school 1
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by, is_active)
SELECT 
  u.id,
  1,
  'write',
  'math',
  'super001-0000-0000-0000-000000000001'::uuid,
  true
FROM users u
WHERE u.username = 'assistant_teacher_demo';

-- Librarian gets write access to school 1
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by, is_active)
SELECT 
  u.id,
  1,
  'write',
  'all',
  'super001-0000-0000-0000-000000000001'::uuid,
  true
FROM users u
WHERE u.username = 'librarian_demo';

-- Counselor gets write access to school 1
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by, is_active)
SELECT 
  u.id,
  1,
  'write',
  'all',
  'super001-0000-0000-0000-000000000001'::uuid,
  true
FROM users u
WHERE u.username = 'counselor_demo';

-- Student gets read access to school 1
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by, is_active)
SELECT 
  u.id,
  1,
  'read',
  'all',
  'super001-0000-0000-0000-000000000001'::uuid,
  true
FROM users u
WHERE u.username = 'student_demo';

-- Parent gets read access to school 1 (for child)
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by, is_active)
SELECT 
  u.id,
  1,
  'read',
  'all',
  'super001-0000-0000-0000-000000000001'::uuid,
  true
FROM users u
WHERE u.username = 'parent_demo';

-- Guardian gets read access to school 1 (for child)
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by, is_active)
SELECT 
  u.id,
  1,
  'read',
  'all',
  'super001-0000-0000-0000-000000000001'::uuid,
  true
FROM users u
WHERE u.username = 'guardian_demo';

-- Create parent-student relationship (demo data)
INSERT INTO parent_student_relationships (parent_id, student_id, relationship_type, is_primary_contact, can_pickup, can_receive_reports)
SELECT 
  p.id,
  s.id,
  'parent',
  true,
  true,
  true
FROM users p
CROSS JOIN users s
WHERE p.username = 'parent_demo' AND s.username = 'student_demo';

-- Create guardian-student relationship (demo data)
INSERT INTO parent_student_relationships (parent_id, student_id, relationship_type, is_primary_contact, can_pickup, can_receive_reports)
SELECT 
  g.id,
  s.id,
  'guardian',
  false,
  true,
  true
FROM users g
CROSS JOIN users s
WHERE g.username = 'guardian_demo' AND s.username = 'student_demo';

COMMIT;

-- Display created LMS demo users
SELECT 'LMS Demo Users Created Successfully!' as status;
SELECT 
  u.username,
  u.first_name || ' ' || u.last_name as full_name,
  STRING_AGG(r.display_name, ', ') as roles,
  COUNT(usa.school_id) as accessible_schools
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = true
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN user_school_access usa ON u.id = usa.user_id AND usa.is_active = true
WHERE u.username IN ('super_admin_demo', 'principal_demo', 'assistant_teacher_demo', 'librarian_demo', 'counselor_demo', 'student_demo', 'parent_demo', 'guardian_demo')
GROUP BY u.id, u.username, u.first_name, u.last_name
ORDER BY 
  CASE 
    WHEN u.username = 'super_admin_demo' THEN 1
    WHEN u.username = 'principal_demo' THEN 2
    WHEN u.username IN ('assistant_teacher_demo', 'librarian_demo', 'counselor_demo') THEN 3
    ELSE 4
  END,
  u.username;