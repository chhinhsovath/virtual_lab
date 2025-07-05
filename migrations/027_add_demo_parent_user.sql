-- Migration 027: Add demo parent user for login testing
-- Creates the parent@vlab.edu.kh user that matches the login page demo button

-- Create the demo parent user with hashed password for "demo123"
-- Using bcrypt hash for "demo123" (this should be updated for production)
INSERT INTO users (id, name, email, username, password_hash, roles, phone_number, address, date_of_birth, created_at) VALUES
(
  '99999999-9999-9999-9999-999999999999', 
  'Demo Parent', 
  'parent@vlab.edu.kh', 
  'parent@vlab.edu.kh', 
  '$2a$10$Y18z1LSQJPzY.0AsRdvIHuMt8jKEsbU/hoCgceGQJTjbxhCRlrvBK', -- bcrypt hash for "demo123"
  ARRAY['parent'], 
  '+855 12 999 999', 
  'Demo Address, Phnom Penh, Cambodia', 
  '1985-06-15',
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  roles = EXCLUDED.roles,
  phone_number = EXCLUDED.phone_number,
  address = EXCLUDED.address,
  date_of_birth = EXCLUDED.date_of_birth;

-- Link demo parent to demo student
INSERT INTO parent_student_relationships (parent_id, student_id, relationship_type, is_primary_contact, can_pickup, can_receive_reports, emergency_contact_priority, created_at) VALUES
('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 'parent', true, true, true, 1, NOW())
ON CONFLICT (parent_id, student_id) DO UPDATE SET
  relationship_type = EXCLUDED.relationship_type,
  is_primary_contact = EXCLUDED.is_primary_contact,
  can_pickup = EXCLUDED.can_pickup,
  can_receive_reports = EXCLUDED.can_receive_reports,
  emergency_contact_priority = EXCLUDED.emergency_contact_priority;

-- Also add a demo user session entry for testing (optional)
INSERT INTO user_sessions (id, user_id, roles, expires_at, created_at) VALUES
(
  gen_random_uuid(),
  '99999999-9999-9999-9999-999999999999',
  ARRAY['parent'],
  NOW() + INTERVAL '1 day',
  NOW()
)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE parent_student_relationships IS 'Demo parent user parent@vlab.edu.kh linked to demo student for testing the parent dashboard';