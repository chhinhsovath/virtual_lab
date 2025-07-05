-- Migration 026: Add parent-student relationships for testing
-- This creates sample parent users and links them to existing students

-- Create sample parent users
INSERT INTO users (id, name, email, username, roles, phone_number, address, date_of_birth) VALUES
-- Parent 1
('22222222-2222-2222-2222-222222222222', 'Sopheak Tran', 'sopheak.tran@example.com', 'sopheak_parent', ARRAY['parent'], '+855 12 123 456', 'Phnom Penh, Cambodia', '1985-03-15'),
-- Parent 2  
('33333333-3333-3333-3333-333333333333', 'Channary Kim', 'channary.kim@example.com', 'channary_parent', ARRAY['parent'], '+855 12 234 567', 'Siem Reap, Cambodia', '1987-07-22'),
-- Guardian 1
('44444444-4444-4444-4444-444444444444', 'Vibol Chea', 'vibol.chea@example.com', 'vibol_guardian', ARRAY['guardian'], '+855 12 345 678', 'Battambang, Cambodia', '1982-11-08')

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone_number = EXCLUDED.phone_number,
  address = EXCLUDED.address,
  date_of_birth = EXCLUDED.date_of_birth;

-- Create parent-student relationships
-- Note: Using the demo student ID from previous migrations
INSERT INTO parent_student_relationships (parent_id, student_id, relationship_type, is_primary_contact, can_pickup, can_receive_reports, emergency_contact_priority) VALUES
-- Parent 1 linked to demo student
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'parent', true, true, true, 1),
-- Parent 2 as secondary contact for same student (divorced family scenario)
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'parent', false, true, true, 2),
-- Guardian as emergency contact
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'guardian', false, true, false, 3)

ON CONFLICT (parent_id, student_id) DO UPDATE SET
  relationship_type = EXCLUDED.relationship_type,
  is_primary_contact = EXCLUDED.is_primary_contact,
  can_pickup = EXCLUDED.can_pickup,
  can_receive_reports = EXCLUDED.can_receive_reports,
  emergency_contact_priority = EXCLUDED.emergency_contact_priority;

-- Create additional parent users for other potential students
INSERT INTO users (id, name, email, username, roles, phone_number, date_of_birth) VALUES
('55555555-5555-5555-5555-555555555555', 'Malis Pov', 'malis.pov@example.com', 'malis_parent', ARRAY['parent'], '+855 12 456 789', '1990-01-20'),
('66666666-6666-6666-6666-666666666666', 'Dara Sor', 'dara.sor@example.com', 'dara_parent', ARRAY['parent'], '+855 12 567 890', '1988-05-12')

ON CONFLICT (id) DO NOTHING;

-- Update user sessions table to ensure parent roles are properly recognized
UPDATE user_sessions 
SET roles = ARRAY['parent'] 
WHERE user_id IN (
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);

COMMENT ON TABLE parent_student_relationships IS 'Links parent/guardian users to their children for portal access';