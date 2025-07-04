-- Create admin user for production
-- Password hash for 'demo123' using bcrypt with cost 10
INSERT INTO users (email, name, role, password_hash, is_active) 
VALUES (
  'admin@vlab.edu.kh',
  'Administrator',
  'admin',
  '$2a$10$aosiR0w71YWo4xW4X7XQoOFd6gKhYAJAmtviH2rAWJW7f8jM0LdAS',
  true
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  updated_at = CURRENT_TIMESTAMP;