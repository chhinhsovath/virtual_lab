-- Virtual Lab Cambodia - User Roles and Permissions Update
-- Transform user system from TaRL assessment to STEM simulation platform

-- Create new users table specifically for Virtual Lab Cambodia
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  first_name_km VARCHAR(200),
  last_name_km VARCHAR(200),
  role VARCHAR(50) CHECK (role IN ('student', 'teacher', 'parent', 'admin', 'super_admin', 'principal', 'assistant_teacher', 'cluster_mentor', 'librarian', 'counselor', 'viewer')) NOT NULL,
  school_id INTEGER REFERENCES tbl_school_list(sclAutoID),
  grade_level INTEGER,
  subject_specializations TEXT[], -- For teachers: what subjects they can teach
  language_preference VARCHAR(10) DEFAULT 'km' CHECK (language_preference IN ('km', 'en', 'both')),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  profile_image VARCHAR(500),
  bio_en TEXT,
  bio_km TEXT,
  contact_phone VARCHAR(20),
  emergency_contact VARCHAR(20),
  parent_consent BOOLEAN DEFAULT false, -- For students
  teacher_id INTEGER, -- Link to existing tbl_teacher_information if applicable
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Create user school access table for multi-school permissions
CREATE TABLE IF NOT EXISTS user_school_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  school_id INTEGER REFERENCES tbl_school_list(sclAutoID),
  access_level VARCHAR(20) CHECK (access_level IN ('read', 'write', 'admin')) DEFAULT 'read',
  subject_areas TEXT[], -- Specific subjects they can access in this school
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, school_id)
);

-- Update user_sessions table for Virtual Lab
ALTER TABLE user_sessions 
  ADD COLUMN IF NOT EXISTS user_uuid UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS login_method VARCHAR(50) DEFAULT 'password',
  ADD COLUMN IF NOT EXISTS device_info JSONB,
  ADD COLUMN IF NOT EXISTS ip_address INET,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  preference_key VARCHAR(100) NOT NULL,
  preference_value TEXT,
  category VARCHAR(50), -- 'interface', 'notifications', 'learning', etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, preference_key)
);

-- Create user achievements table for gamification
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(100) NOT NULL,
  achievement_name VARCHAR(200) NOT NULL,
  achievement_description TEXT,
  achievement_description_km TEXT,
  points_awarded INTEGER DEFAULT 0,
  badge_icon VARCHAR(200),
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  subject_area VARCHAR(50),
  simulation_related UUID REFERENCES stem_simulations_catalog(id),
  metadata JSONB
);

-- Insert demo users for Virtual Lab Cambodia
INSERT INTO users (
  email, username, password_hash, first_name, last_name, first_name_km, last_name_km, 
  role, school_id, subject_specializations, language_preference
) VALUES 
-- Admin users
('admin@vlab.edu.kh', 'admin@vlab.edu.kh', '$2b$12$LQv3c1yqBWVHxkd0LQ1YqOl5xXlRb7vJt0J8t3/EYxCuKjZOsb02q', 
 'Virtual Lab', 'Administrator', 'រដ្ឋបាលបច្ចេកវិទ្យា', 'កម្ពុជា', 
 'super_admin', 1, ARRAY['Physics', 'Chemistry', 'Biology', 'Mathematics'], 'both'),

-- Teacher users
('teacher@vlab.edu.kh', 'teacher@vlab.edu.kh', '$2b$12$LQv3c1yqBWVHxkd0LQ1YqOl5xXlRb7vJt0J8t3/EYxCuKjZOsb02q', 
 'Physics', 'Teacher', 'គ្រូ', 'រូបវិទ្យា', 
 'teacher', 1, ARRAY['Physics'], 'both'),
 
('chemistry.teacher@vlab.edu.kh', 'chemistry.teacher', '$2b$12$LQv3c1yqBWVHxkd0LQ1YqOl5xXlRb7vJt0J8t3/EYxCuKjZOsb02q', 
 'Chemistry', 'Teacher', 'គ្រូ', 'គីមីវិទ្យា', 
 'teacher', 1, ARRAY['Chemistry'], 'km'),

('biology.teacher@vlab.edu.kh', 'biology.teacher', '$2b$12$LQv3c1yqBWVHxkd0LQ1YqOl5xXlRb7vJt0J8t3/EYxCuKjZOsb02q', 
 'Biology', 'Teacher', 'គ្រូ', 'ជីវវិទ្យា', 
 'teacher', 1, ARRAY['Biology'], 'km'),

('math.teacher@vlab.edu.kh', 'math.teacher', '$2b$12$LQv3c1yqBWVHxkd0LQ1YqOl5xXlRb7vJt0J8t3/EYxCuKjZOsb02q', 
 'Mathematics', 'Teacher', 'គ្រូ', 'គណិតវិទ្យា', 
 'teacher', 1, ARRAY['Mathematics'], 'km'),

-- Student users
('student@vlab.edu.kh', 'student@vlab.edu.kh', '$2b$12$LQv3c1yqBWVHxkd0LQ1YqOl5xXlRb7vJt0J8t3/EYxCuKjZOsb02q', 
 'Demo', 'Student', 'សិស្ស', 'សាកល្បង', 
 'student', 1, NULL, 'km'),

('student.advanced@vlab.edu.kh', 'student.advanced', '$2b$12$LQv3c1yqBWVHxkd0LQ1YqOl5xXlRb7vJt0J8t3/EYxCuKjZOsb02q', 
 'Advanced', 'Student', 'សិស្ស', 'កម្រិតខ្ពស់', 
 'student', 1, NULL, 'both'),

-- Parent users  
('parent@vlab.edu.kh', 'parent@vlab.edu.kh', '$2b$12$LQv3c1yqBWVHxkd0LQ1YqOl5xXlRb7vJt0J8t3/EYxCuKjZOsb02q', 
 'Demo', 'Parent', 'ឪពុកម្តាយ', 'សាកល្បង', 
 'parent', 1, NULL, 'km'),

-- Principal
('principal@vlab.edu.kh', 'principal@vlab.edu.kh', '$2b$12$LQv3c1yqBWVHxkd0LQ1YqOl5xXlRb7vJt0J8t3/EYxCuKjZOsb02q', 
 'School', 'Principal', 'នាយក', 'សាលា', 
 'principal', 1, ARRAY['Physics', 'Chemistry', 'Biology', 'Mathematics'], 'both');

-- Insert user school access permissions
INSERT INTO user_school_access (user_id, school_id, access_level, subject_areas) 
SELECT u.id, u.school_id, 
  CASE 
    WHEN u.role IN ('super_admin', 'admin') THEN 'admin'
    WHEN u.role IN ('principal', 'teacher') THEN 'write'
    ELSE 'read'
  END,
  COALESCE(u.subject_specializations, ARRAY['Physics', 'Chemistry', 'Biology', 'Mathematics'])
FROM users u 
WHERE u.school_id IS NOT NULL;

-- Insert default user preferences
INSERT INTO user_preferences (user_id, preference_key, preference_value, category)
SELECT u.id, 'theme', 'light', 'interface' FROM users u
UNION ALL
SELECT u.id, 'notifications_enabled', 'true', 'notifications' FROM users u  
UNION ALL
SELECT u.id, 'auto_save_progress', 'true', 'learning' FROM users u
UNION ALL
SELECT u.id, 'show_khmer_tooltips', 
  CASE WHEN u.language_preference IN ('km', 'both') THEN 'true' ELSE 'false' END, 
  'interface' 
FROM users u;

-- Insert sample achievements
INSERT INTO user_achievements (
  user_id, achievement_type, achievement_name, achievement_description, 
  achievement_description_km, points_awarded, badge_icon, subject_area
) 
SELECT 
  u.id,
  'first_simulation',
  'First Steps in Science',
  'Completed your first Virtual Lab simulation',
  'បញ្ចប់ការធ្វើត្រាប់តាមដំបូងនៅមន្ទីរពិសោធន៍និម្មិត',
  10,
  '🔬',
  'Physics'
FROM users u 
WHERE u.role = 'student'
LIMIT 3;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role_school ON users(role, school_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_user_school_access_user_id ON user_school_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_school_access_school_id ON user_school_access(school_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);

-- Update user_permissions table for Virtual Lab permissions
DELETE FROM user_permissions; -- Clear old TaRL permissions

-- Insert new Virtual Lab permissions
INSERT INTO user_permissions (user_id, resource, action, school_id, subject) VALUES
-- Admin permissions (using user ID 0 as template, will be updated for actual users)
(0, 'simulations', 'view', NULL, NULL),
(0, 'simulations', 'create', NULL, NULL),
(0, 'simulations', 'edit', NULL, NULL),
(0, 'simulations', 'delete', NULL, NULL),
(0, 'users', 'manage', NULL, NULL),
(0, 'analytics', 'view_all', NULL, NULL),
(0, 'schools', 'manage', NULL, NULL),

-- Teacher permissions
(0, 'simulations', 'view', NULL, NULL),
(0, 'simulations', 'assign', NULL, NULL),
(0, 'students', 'view_progress', NULL, NULL),
(0, 'assignments', 'create', NULL, NULL),
(0, 'assignments', 'grade', NULL, NULL),
(0, 'analytics', 'view_class', NULL, NULL),

-- Student permissions  
(0, 'simulations', 'view', NULL, NULL),
(0, 'simulations', 'interact', NULL, NULL),
(0, 'progress', 'view_own', NULL, NULL),
(0, 'assignments', 'complete', NULL, NULL),
(0, 'achievements', 'earn', NULL, NULL),

-- Parent permissions
(0, 'children', 'view_progress', NULL, NULL),
(0, 'simulations', 'view', NULL, NULL),
(0, 'reports', 'view_child', NULL, NULL);

-- Create view for user profiles with full information
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  u.id,
  u.email,
  u.username,
  u.first_name,
  u.last_name,
  u.first_name_km,
  u.last_name_km,
  u.role,
  u.school_id,
  s.sclNameKh as school_name_km,
  s.sclNameEn as school_name_en,
  u.subject_specializations,
  u.language_preference,
  u.is_active,
  u.profile_image,
  u.created_at,
  u.last_login,
  COUNT(ua.id) as total_achievements,
  SUM(ua.points_awarded) as total_points
FROM users u
LEFT JOIN tbl_school_list s ON u.school_id = s.sclAutoID
LEFT JOIN user_achievements ua ON u.id = ua.user_id
WHERE u.is_active = true
GROUP BY u.id, u.email, u.username, u.first_name, u.last_name, u.first_name_km, 
         u.last_name_km, u.role, u.school_id, s.sclNameKh, s.sclNameEn, 
         u.subject_specializations, u.language_preference, u.is_active, 
         u.profile_image, u.created_at, u.last_login;

-- Add table comments
COMMENT ON TABLE users IS 'Virtual Lab Cambodia user accounts with STEM education focus';
COMMENT ON TABLE user_school_access IS 'Multi-school access permissions for teachers and administrators';
COMMENT ON TABLE user_preferences IS 'User interface and learning preferences';
COMMENT ON TABLE user_achievements IS 'Gamification system for student engagement and motivation';

-- Record migration completion
INSERT INTO learning_analytics (student_id, school_id, subject_area, metric_name, metric_value, metric_unit, additional_data) 
VALUES (0, 0, 'System', 'user_system_migration', 21, 'version', 
  '{"migration_name": "user_roles_virtual_lab", "completed_at": "' || CURRENT_TIMESTAMP || '", "users_created": 8}');

-- All passwords for demo accounts are hashed version of 'demo123'
-- This can be verified in the application for demo login functionality