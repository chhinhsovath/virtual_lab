-- TaRL System - Demo Users from DATABASE_SETUP.md
-- This migration creates demo users exactly as specified in DATABASE_SETUP.md
-- All usernames and passwords match the documentation

BEGIN;

-- Clear existing demo data (keep any production data)
DELETE FROM user_school_access WHERE user_id IN (
  SELECT id FROM users WHERE username IN (
    'admin', 'mentor1', 'mentor2', 
    '1001', '1002', '1003', '1004', 
    '2001', '2002', '2003', '2004'
  )
);

DELETE FROM user_roles WHERE user_id IN (
  SELECT id FROM users WHERE username IN (
    'admin', 'mentor1', 'mentor2',
    '1001', '1002', '1003', '1004',
    '2001', '2002', '2003', '2004'
  )
);

DELETE FROM users WHERE username IN (
  'admin', 'mentor1', 'mentor2',
  '1001', '1002', '1003', '1004', 
  '2001', '2002', '2003', '2004'
);

-- Insert Administrator (admin/admin)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, is_active) VALUES 
('admin001-0000-0000-0000-000000000001', 'admin', 'admin@tarl.edu.kh', '$2a$12$LqHf5H1zItLpo/nv7HS0F.fR39CeJVNVvtahZopsTaXOCSpLNJjsG', 'System', 'Administrator', true);

-- Insert Cluster Mentors
INSERT INTO users (id, username, email, password_hash, first_name, last_name, phone, is_active) VALUES 
('mentor01-0000-0000-0000-000000000001', 'mentor1', 'mentor1@tarl.edu.kh', '$2a$12$hMNYFV2nNsktPX.Jy5RuwOrLvXOImtnVtl6dS8/aYxM2C1ZLq1fp.', 'Chanthea', 'Seng', '012-345-001', true),
('mentor02-0000-0000-0000-000000000002', 'mentor2', 'mentor2@tarl.edu.kh', '$2a$12$e4yuEYL.tXG7uiP0e1YD/eqxU.aBj/WGuLqKecbsr5gZ.WgnEuitu', 'Sokheng', 'Pich', '012-345-002', true);

-- Insert Teachers - Battambang Province
INSERT INTO users (id, username, email, password_hash, first_name, last_name, phone, teacher_id, is_active) VALUES 
('teacher01-0000-0000-0000-000000001001', '1001', '1001@tarl.edu.kh', '$2a$12$XBzkJ/.6OMPZlDuqpTVRT.CqwqymAwjWJWFRPmxEo4/LH8.qnLnsW', 'Sok', 'Pisey', '012-111-001', 1001, true),
('teacher02-0000-0000-0000-000000001002', '1002', '1002@tarl.edu.kh', '$2a$12$mUNYYIs7mW1oEDeO16oPGevm5kz4p4CI0LZob/I0VB41etywUZE3a', 'Chan', 'Dara', '012-111-002', 1002, true),
('teacher03-0000-0000-0000-000000001003', '1003', '1003@tarl.edu.kh', '$2a$12$eNMi3.GQHVhEPRZB/SrA3OGqI1vPmFMtDFL2mTFR8/ctpcOAZmAze', 'Meas', 'Sophea', '012-111-003', 1003, true),
('teacher04-0000-0000-0000-000000001004', '1004', '1004@tarl.edu.kh', '$2a$12$cTnnDTpFw8WTVtsGUndP1uGOO/4ZTlzUtdons15bBBw7vZRdQZlJi', 'Ly', 'Chanthy', '012-111-004', 1004, true);

-- Insert Teachers - Kampong Cham Province  
INSERT INTO users (id, username, email, password_hash, first_name, last_name, phone, teacher_id, is_active) VALUES 
('teacher05-0000-0000-0000-000000002001', '2001', '2001@tarl.edu.kh', '$2a$12$IoMel9uqzkzq7oGMy1Z13uKYuWzvVCP41d62kBsL6zq0np4ZYEUEq', 'Pich', 'Srey Leak', '012-222-001', 2001, true),
('teacher06-0000-0000-0000-000000002002', '2002', '2002@tarl.edu.kh', '$2a$12$WMzKBjwMuMy8VKTe9jxkKe5pnDB9rJSvaDsdG2ppz6RfYuFQxOaZq', 'Kem', 'Pisach', '012-222-002', 2002, true),
('teacher07-0000-0000-0000-000000002003', '2003', '2003@tarl.edu.kh', '$2a$12$ylieHKIyG0ZLEgPkyjYe3ONBPhZDYs0glWo35x.aE317oUGzFaZWa', 'Nov', 'Sreypov', '012-222-003', 2003, true),
('teacher08-0000-0000-0000-000000002004', '2004', '2004@tarl.edu.kh', '$2a$12$d/3K5tbcLkzu.K.Wqa0shukDCemI4xsppSlzpxQjI3Ae0nInyiKUe', 'Heng', 'Vibol', '012-222-004', 2004, true);

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id, granted_by, is_active) 
SELECT 
  u.id,
  r.id,
  'admin001-0000-0000-0000-000000000001'::uuid,
  true
FROM users u
CROSS JOIN roles r
WHERE 
  -- Admin role
  (u.username = 'admin' AND r.name = 'admin') OR
  
  -- Cluster mentor roles  
  (u.username IN ('mentor1', 'mentor2') AND r.name = 'cluster_mentor') OR
  
  -- Teacher roles
  (u.username IN ('1001', '1002', '1003', '1004', '2001', '2002', '2003', '2004') AND r.name = 'teacher');

-- Admin gets access to all schools
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by, is_active)
SELECT 
  u.id,
  s.sclAutoID,
  'admin',
  'all',
  'admin001-0000-0000-0000-000000000001'::uuid,
  true
FROM users u
CROSS JOIN tbl_school_list s
WHERE u.username = 'admin'
  AND s.sclAutoID IS NOT NULL;

-- Mentor1 gets read access to Battambang schools
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by, is_active)
SELECT 
  u.id,
  s.sclAutoID,
  'read',
  'all',
  'admin001-0000-0000-0000-000000000001'::uuid,
  true
FROM users u
CROSS JOIN tbl_school_list s
WHERE u.username = 'mentor1'
  AND s.sclProvince = 1 -- Battambang province
  AND s.sclAutoID IS NOT NULL;

-- Mentor2 gets read access to Kampong Cham schools  
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by, is_active)
SELECT 
  u.id,
  s.sclAutoID,
  'read',
  'all',
  'admin001-0000-0000-0000-000000000001'::uuid,
  true
FROM users u
CROSS JOIN tbl_school_list s
WHERE u.username = 'mentor2'
  AND s.sclProvince = 2 -- Kampong Cham province
  AND s.sclAutoID IS NOT NULL;

-- Teachers get write access to their specific schools
-- Battambang teachers (1001-1004) to schools 1-4
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by, is_active)
SELECT 
  u.id,
  CASE u.username
    WHEN '1001' THEN 1 -- Wat Kandal Primary School
    WHEN '1002' THEN 2 -- Phum Thmey Primary School
    WHEN '1003' THEN 3 -- Boeng Pring Primary School
    WHEN '1004' THEN 4 -- Kampong Svay Primary School
  END,
  'write',
  CASE u.username
    WHEN '1001' THEN 'khmer'
    WHEN '1002' THEN 'math'
    WHEN '1003' THEN 'khmer'
    WHEN '1004' THEN 'math'
  END,
  'admin001-0000-0000-0000-000000000001'::uuid,
  true
FROM users u
WHERE u.username IN ('1001', '1002', '1003', '1004');

-- Kampong Cham teachers (2001-2004) to schools 5-8
INSERT INTO user_school_access (user_id, school_id, access_type, subject, granted_by, is_active)
SELECT 
  u.id,
  CASE u.username
    WHEN '2001' THEN 5 -- Prey Veng Primary School
    WHEN '2002' THEN 6 -- Chrey Thom Primary School
    WHEN '2003' THEN 7 -- Toul Preah Primary School
    WHEN '2004' THEN 8 -- Samrong Primary School
  END,
  'write',
  CASE u.username
    WHEN '2001' THEN 'khmer'
    WHEN '2002' THEN 'math'
    WHEN '2003' THEN 'khmer'
    WHEN '2004' THEN 'math'
  END,
  'admin001-0000-0000-0000-000000000001'::uuid,
  true
FROM users u
WHERE u.username IN ('2001', '2002', '2003', '2004');

COMMIT;

-- Display created demo users
SELECT 'Demo Users Created Successfully!' as status;
SELECT 
  u.username,
  u.first_name || ' ' || u.last_name as full_name,
  STRING_AGG(r.display_name, ', ') as roles,
  COUNT(usa.school_id) as accessible_schools
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = true
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN user_school_access usa ON u.id = usa.user_id AND usa.is_active = true
WHERE u.username IN ('admin', 'mentor1', 'mentor2', '1001', '1002', '1003', '1004', '2001', '2002', '2003', '2004')
GROUP BY u.id, u.username, u.first_name, u.last_name
ORDER BY 
  CASE 
    WHEN u.username = 'admin' THEN 1
    WHEN u.username IN ('mentor1', 'mentor2') THEN 2
    ELSE 3
  END,
  u.username;