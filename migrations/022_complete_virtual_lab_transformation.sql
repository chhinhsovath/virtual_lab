-- Virtual Lab Cambodia - Complete Transformation Migration
-- This migration ensures all TaRL references are removed and STEM focus is implemented

-- First, let's ensure we have all necessary tables for Virtual Lab Cambodia

-- Create STEM-focused tables if they don't exist
CREATE TABLE IF NOT EXISTS stem_simulations_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id INTEGER, -- Will reference users table or external student system
  teacher_id INTEGER, -- Will reference users table or external teacher system  
  school_id INTEGER, -- Will reference external school system
  simulation_id VARCHAR(100) NOT NULL,
  simulation_type VARCHAR(50) CHECK (simulation_type IN ('Physics', 'Chemistry', 'Biology', 'Mathematics')),
  interaction_duration INTEGER DEFAULT 0, -- seconds
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  learning_objectives_met TEXT[],
  simulation_data JSONB, -- Store simulation state/results
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stem_program_enrollment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id INTEGER, -- Will reference users table or external student system
  school_id INTEGER, -- Will reference external school system
  program_type VARCHAR(50) CHECK (program_type IN ('Physics', 'Chemistry', 'Biology', 'Mathematics', 'General_STEM')),
  enrollment_date DATE DEFAULT CURRENT_DATE,
  learning_path VARCHAR(100),
  progress_level VARCHAR(20) CHECK (progress_level IN ('Beginner', 'Intermediate', 'Advanced')),
  parent_consent BOOLEAN DEFAULT false,
  teacher_assigned INTEGER, -- Will reference users table or external teacher system
  enrollment_status VARCHAR(20) CHECK (enrollment_status IN ('Active', 'Inactive', 'Completed', 'Suspended')) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, school_id, program_type)
);

-- Ensure stem_simulations_catalog has all necessary columns
ALTER TABLE stem_simulations_catalog 
  ADD COLUMN IF NOT EXISTS simulation_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS display_name_en VARCHAR(200),
  ADD COLUMN IF NOT EXISTS display_name_km VARCHAR(200),
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_km TEXT,
  ADD COLUMN IF NOT EXISTS subject_area VARCHAR(50),
  ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20),
  ADD COLUMN IF NOT EXISTS grade_levels INTEGER[],
  ADD COLUMN IF NOT EXISTS estimated_duration INTEGER,
  ADD COLUMN IF NOT EXISTS learning_objectives_en TEXT[],
  ADD COLUMN IF NOT EXISTS learning_objectives_km TEXT[],
  ADD COLUMN IF NOT EXISTS simulation_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS preview_image VARCHAR(500),
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add constraints if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stem_simulations_catalog_subject_area_check') THEN
    ALTER TABLE stem_simulations_catalog ADD CONSTRAINT stem_simulations_catalog_subject_area_check 
    CHECK (subject_area IN ('Physics', 'Chemistry', 'Biology', 'Mathematics'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stem_simulations_catalog_difficulty_check') THEN
    ALTER TABLE stem_simulations_catalog ADD CONSTRAINT stem_simulations_catalog_difficulty_check 
    CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced'));
  END IF;
END $$;

-- Update simulation name to be unique if not already
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stem_simulations_catalog_simulation_name_key') THEN
    ALTER TABLE stem_simulations_catalog ADD CONSTRAINT stem_simulations_catalog_simulation_name_key UNIQUE (simulation_name);
  END IF;
EXCEPTION WHEN duplicate_table THEN
  -- Constraint already exists, skip
END $$;

-- Create teacher simulation assignments table
CREATE TABLE IF NOT EXISTS teacher_simulation_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id INTEGER, -- Reference to users or external teacher system
  simulation_id UUID REFERENCES stem_simulations_catalog(id),
  school_id INTEGER, -- Reference to external school system
  class_grade INTEGER,
  assignment_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  instructions_en TEXT,
  instructions_km TEXT,
  learning_goals TEXT[],
  assessment_criteria TEXT[],
  is_mandatory BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create student simulation progress table
CREATE TABLE IF NOT EXISTS student_simulation_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id INTEGER, -- Reference to users or external student system
  simulation_id UUID REFERENCES stem_simulations_catalog(id),
  assignment_id UUID REFERENCES teacher_simulation_assignments(id),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  total_time_spent INTEGER DEFAULT 0, -- seconds
  attempts_count INTEGER DEFAULT 0,
  best_score DECIMAL(5,2),
  current_progress JSONB, -- Store current simulation state
  achievements TEXT[],
  feedback_from_teacher TEXT,
  self_reflection TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create learning analytics table  
CREATE TABLE IF NOT EXISTS learning_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id INTEGER, -- Reference to users or external student system
  school_id INTEGER, -- Reference to external school system
  subject_area VARCHAR(50),
  metric_name VARCHAR(100),
  metric_value DECIMAL(10,2),
  metric_unit VARCHAR(50),
  measurement_date DATE DEFAULT CURRENT_DATE,
  academic_year VARCHAR(10),
  semester VARCHAR(20),
  additional_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure users table has Virtual Lab specific columns
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS subject_specializations TEXT[],
  ADD COLUMN IF NOT EXISTS language_preference VARCHAR(10) DEFAULT 'km',
  ADD COLUMN IF NOT EXISTS grade_level INTEGER,
  ADD COLUMN IF NOT EXISTS bio_en TEXT,
  ADD COLUMN IF NOT EXISTS bio_km TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(20),
  ADD COLUMN IF NOT EXISTS parent_consent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS teacher_id INTEGER,
  ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500),
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Add language preference constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_language_preference_check') THEN
    ALTER TABLE users ADD CONSTRAINT users_language_preference_check 
    CHECK (language_preference IN ('km', 'en', 'both'));
  END IF;
END $$;

-- Create user school access table
CREATE TABLE IF NOT EXISTS user_school_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  school_id INTEGER, -- Reference to external school system
  access_level VARCHAR(20) CHECK (access_level IN ('read', 'write', 'admin')) DEFAULT 'read',
  subject_areas TEXT[], -- Specific subjects they can access in this school
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, school_id)
);

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

-- Create user sessions table for Virtual Lab if it doesn't exist
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL,
  user_uuid UUID REFERENCES users(id),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  teacher_id INTEGER,
  school_ids INTEGER[] DEFAULT '{}',
  subject VARCHAR(20),
  login_method VARCHAR(50) DEFAULT 'password',
  device_info JSONB,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stem_simulations_log_student_id ON stem_simulations_log(student_id);
CREATE INDEX IF NOT EXISTS idx_stem_simulations_log_school_id ON stem_simulations_log(school_id);
CREATE INDEX IF NOT EXISTS idx_stem_simulations_log_simulation ON stem_simulations_log(simulation_id, simulation_type);
CREATE INDEX IF NOT EXISTS idx_stem_program_enrollment_student_school ON stem_program_enrollment(student_id, school_id);
CREATE INDEX IF NOT EXISTS idx_stem_simulations_catalog_subject ON stem_simulations_catalog(subject_area);
CREATE INDEX IF NOT EXISTS idx_stem_simulations_catalog_featured ON stem_simulations_catalog(is_featured, is_active);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher_id ON teacher_simulation_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_school_id ON teacher_simulation_assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_simulation_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_simulation_id ON student_simulation_progress(simulation_id);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_student_subject ON learning_analytics(student_id, subject_area);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role_school ON users(role, school_id);
CREATE INDEX IF NOT EXISTS idx_user_school_access_user_id ON user_school_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);

-- Add table comments
COMMENT ON TABLE stem_simulations_log IS 'Student interaction logs with STEM simulations';
COMMENT ON TABLE stem_program_enrollment IS 'Students enrolled in Virtual Lab STEM program';
COMMENT ON TABLE stem_simulations_catalog IS 'Catalog of available STEM simulations in Virtual Lab Cambodia';
COMMENT ON TABLE teacher_simulation_assignments IS 'Teacher assignments using STEM simulations';
COMMENT ON TABLE student_simulation_progress IS 'Individual student progress tracking for simulations';
COMMENT ON TABLE learning_analytics IS 'Learning analytics and performance metrics for STEM education';
COMMENT ON TABLE user_school_access IS 'Multi-school access permissions for teachers and administrators';
COMMENT ON TABLE user_preferences IS 'User interface and learning preferences';
COMMENT ON TABLE user_achievements IS 'Gamification system for student engagement and motivation';

-- Clear and update permissions for Virtual Lab
DELETE FROM user_permissions;

-- Insert Virtual Lab permissions
INSERT INTO user_permissions (user_id, resource, action, school_id, subject) VALUES
-- Admin permissions (using user ID 0 as template)
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

-- Record migration completion
INSERT INTO learning_analytics (student_id, school_id, subject_area, metric_name, metric_value, metric_unit, additional_data) 
VALUES (0, 0, 'System', 'schema_migration', 22, 'version', 
  '{"migration_name": "complete_virtual_lab_transformation", "completed_at": "' || CURRENT_TIMESTAMP || '"}')
ON CONFLICT DO NOTHING;

-- Create view for user profiles if it doesn't exist
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  u.id,
  u.email,
  u.username,
  u.first_name,
  u.last_name,
  u.role,
  u.school_id,
  u.subject_specializations,
  u.language_preference,
  u.is_active,
  u.profile_image,
  u.created_at,
  u.last_login,
  COUNT(ua.id) as total_achievements,
  COALESCE(SUM(ua.points_awarded), 0) as total_points
FROM users u
LEFT JOIN user_achievements ua ON u.id = ua.user_id
WHERE u.is_active = true
GROUP BY u.id, u.email, u.username, u.first_name, u.last_name, 
         u.role, u.school_id, u.subject_specializations, u.language_preference, 
         u.is_active, u.profile_image, u.created_at, u.last_login;

-- Create view for active simulations with statistics
CREATE OR REPLACE VIEW active_simulations_stats AS
SELECT 
  sc.id,
  sc.simulation_name,
  sc.display_name_en,
  sc.display_name_km,
  sc.subject_area,
  sc.difficulty_level,
  sc.is_featured,
  COUNT(DISTINCT ssp.student_id) as total_users,
  ROUND(AVG(ssp.best_score), 2) as average_score,
  ROUND(AVG(ssp.total_time_spent::DECIMAL / 60), 2) as avg_time_minutes,
  COUNT(ssp.id) as total_attempts
FROM stem_simulations_catalog sc
LEFT JOIN student_simulation_progress ssp ON sc.id = ssp.simulation_id
WHERE sc.is_active = true
GROUP BY sc.id, sc.simulation_name, sc.display_name_en, sc.display_name_km, 
         sc.subject_area, sc.difficulty_level, sc.is_featured
ORDER BY sc.is_featured DESC, total_users DESC;