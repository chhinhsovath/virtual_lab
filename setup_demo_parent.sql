-- Quick setup for demo parent user
-- Run this with: psql -d your_database_name -f setup_demo_parent.sql

BEGIN;

-- Create demo parent user with bcrypt hash for "demo123"
INSERT INTO users (id, name, email, username, password_hash, roles, phone_number, address, date_of_birth, created_at, updated_at) VALUES
(
  '99999999-9999-9999-9999-999999999999',
  'Demo Parent - Sopheak Tran',
  'parent@vlab.edu.kh',
  'parent@vlab.edu.kh',
  '$2a$10$Y18z1LSQJPzY.0AsRdvIHuMt8jKEsbU/hoCgceGQJTjbxhCRlrvBK', -- demo123
  ARRAY['parent'],
  '+855 12 999 999',
  'Phnom Penh, Cambodia',
  '1985-06-15',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  roles = EXCLUDED.roles,
  updated_at = NOW();

-- Create demo student user if it doesn't exist
INSERT INTO users (id, name, email, username, password_hash, roles, phone_number, date_of_birth, created_at, updated_at) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Demo Student - Rotha Khem',
  'student@vlab.edu.kh',
  'student@vlab.edu.kh',
  '$2a$10$Y18z1LSQJPzY.0AsRdvIHuMt8jKEsbU/hoCgceGQJTjbxhCRlrvBK', -- demo123
  ARRAY['student'],
  '+855 12 888 888',
  '2010-03-20',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create parent_student_relationships table if it doesn't exist
CREATE TABLE IF NOT EXISTS parent_student_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES users(id),
  student_id UUID NOT NULL REFERENCES users(id),
  relationship_type VARCHAR(30) NOT NULL DEFAULT 'parent',
  is_primary_contact BOOLEAN DEFAULT true,
  can_pickup BOOLEAN DEFAULT true,
  can_receive_reports BOOLEAN DEFAULT true,
  emergency_contact_priority INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- Link demo parent to demo student
INSERT INTO parent_student_relationships (parent_id, student_id, relationship_type, is_primary_contact, can_pickup, can_receive_reports, emergency_contact_priority) VALUES
(
  '99999999-9999-9999-9999-999999999999',
  '11111111-1111-1111-1111-111111111111',
  'parent',
  true,
  true,
  true,
  1
)
ON CONFLICT (parent_id, student_id) DO UPDATE SET
  relationship_type = EXCLUDED.relationship_type,
  is_primary_contact = EXCLUDED.is_primary_contact,
  updated_at = NOW();

-- Verify the setup
SELECT 
  'Demo parent user created: ' || u.name || ' (' || u.email || ')' as status
FROM users u 
WHERE u.email = 'parent@vlab.edu.kh';

SELECT 
  'Parent-student relationship created between: ' || p.name || ' and ' || s.name as relationship_status
FROM parent_student_relationships psr
JOIN users p ON psr.parent_id = p.id
JOIN users s ON psr.student_id = s.id
WHERE p.email = 'parent@vlab.edu.kh';

COMMIT;

-- Display login instructions
\echo ''
\echo '✅ Demo Parent Setup Complete!'
\echo ''
\echo 'You can now login with:'
\echo 'Email: parent@vlab.edu.kh'
\echo 'Password: demo123'
\echo ''
\echo 'Go to /auth/login and click the "Parent" demo button'