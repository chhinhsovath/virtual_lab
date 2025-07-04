-- TaRL System - Fix Constraints and Create User System
-- This migration adds necessary constraints and creates the user management system

BEGIN;

-- First, add primary keys to existing tables if they don't exist
-- Add primary key to tbl_tarl_teacher
DO $$
BEGIN
  IF NOT EXISTS (SELECT constraint_name FROM information_schema.table_constraints 
                 WHERE table_name = 'tbl_tarl_teacher' AND constraint_type = 'PRIMARY KEY') THEN
    ALTER TABLE tbl_tarl_teacher ADD CONSTRAINT tbl_tarl_teacher_pkey PRIMARY KEY (teacher_id);
  END IF;
END $$;

-- Add primary key to tbl_tarl_school
DO $$
BEGIN
  IF NOT EXISTS (SELECT constraint_name FROM information_schema.table_constraints 
                 WHERE table_name = 'tbl_tarl_school' AND constraint_type = 'PRIMARY KEY') THEN
    ALTER TABLE tbl_tarl_school ADD CONSTRAINT tbl_tarl_school_pkey PRIMARY KEY (school_id);
  END IF;
END $$;

-- Add primary key to tbl_tarl_student
DO $$
BEGIN
  IF NOT EXISTS (SELECT constraint_name FROM information_schema.table_constraints 
                 WHERE table_name = 'tbl_tarl_student' AND constraint_type = 'PRIMARY KEY') THEN
    ALTER TABLE tbl_tarl_student ADD CONSTRAINT tbl_tarl_student_pkey PRIMARY KEY (student_id);
  END IF;
END $$;

-- Now create the user management tables
-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, permission_id)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Link to existing teacher record (for teacher users)
  teacher_id INTEGER,
  
  -- Optional metadata
  metadata JSONB DEFAULT '{}'
);

-- Add foreign key constraint for teacher_id after user table is created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tbl_tarl_teacher') THEN
    ALTER TABLE users ADD CONSTRAINT fk_users_teacher_id 
    FOREIGN KEY (teacher_id) REFERENCES tbl_tarl_teacher(teacher_id);
  END IF;
END $$;

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id)
);

-- Create user_school_access table for school-based permissions
CREATE TABLE IF NOT EXISTS user_school_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id INTEGER NOT NULL,
  access_type VARCHAR(20) DEFAULT 'read' CHECK (access_type IN ('read', 'write', 'admin')),
  subject VARCHAR(20) CHECK (subject IN ('khmer', 'math', 'all')),
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, school_id, subject)
);

-- Add foreign key constraint for school_id after user_school_access table is created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tbl_tarl_school') THEN
    ALTER TABLE user_school_access ADD CONSTRAINT fk_user_school_access_school_id 
    FOREIGN KEY (school_id) REFERENCES tbl_tarl_school(school_id);
  END IF;
END $$;

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token VARCHAR(255) UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Create user_activity_log table for audit trail
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  resource_id VARCHAR(100),
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create TaRL assessments table adapted to existing schema
CREATE TABLE IF NOT EXISTS tarl_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id BIGINT NOT NULL,
  teacher_id INTEGER NOT NULL,
  school_id INTEGER NOT NULL,
  subject VARCHAR(20) NOT NULL CHECK (subject IN ('khmer', 'math')),
  assessment_cycle VARCHAR(20) NOT NULL CHECK (assessment_cycle IN ('baseline', 'midline', 'endline')),
  level_achieved VARCHAR(50) NOT NULL,
  assessment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

-- Add foreign key constraints for tarl_assessments
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tbl_tarl_student') THEN
    ALTER TABLE tarl_assessments ADD CONSTRAINT fk_tarl_assessments_student_id 
    FOREIGN KEY (student_id) REFERENCES tbl_tarl_student(student_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tbl_tarl_teacher') THEN
    ALTER TABLE tarl_assessments ADD CONSTRAINT fk_tarl_assessments_teacher_id 
    FOREIGN KEY (teacher_id) REFERENCES tbl_tarl_teacher(teacher_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tbl_tarl_school') THEN
    ALTER TABLE tarl_assessments ADD CONSTRAINT fk_tarl_assessments_school_id 
    FOREIGN KEY (school_id) REFERENCES tbl_tarl_school(school_id);
  END IF;
END $$;

-- Create TaRL student selection table
CREATE TABLE IF NOT EXISTS tarl_student_selection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id BIGINT NOT NULL,
  school_id INTEGER NOT NULL,
  subject VARCHAR(20) NOT NULL CHECK (subject IN ('khmer', 'math')),
  baseline_level VARCHAR(50) NOT NULL,
  selected_for_program BOOLEAN DEFAULT false,
  selection_date DATE,
  selection_criteria TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  selected_by UUID REFERENCES users(id),
  UNIQUE(student_id, school_id, subject)
);

-- Add foreign key constraints for tarl_student_selection
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tbl_tarl_student') THEN
    ALTER TABLE tarl_student_selection ADD CONSTRAINT fk_tarl_student_selection_student_id 
    FOREIGN KEY (student_id) REFERENCES tbl_tarl_student(student_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tbl_tarl_school') THEN
    ALTER TABLE tarl_student_selection ADD CONSTRAINT fk_tarl_student_selection_school_id 
    FOREIGN KEY (school_id) REFERENCES tbl_tarl_school(school_id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_teacher_id ON users(teacher_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active);

CREATE INDEX IF NOT EXISTS idx_user_school_access_user_id ON user_school_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_school_access_school_id ON user_school_access(school_id);
CREATE INDEX IF NOT EXISTS idx_user_school_access_active ON user_school_access(is_active);

CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_tarl_assessments_student_id ON tarl_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_tarl_assessments_school_id ON tarl_assessments(school_id);
CREATE INDEX IF NOT EXISTS idx_tarl_assessments_subject_cycle ON tarl_assessments(subject, assessment_cycle);

CREATE INDEX IF NOT EXISTS idx_tarl_student_selection_student_school ON tarl_student_selection(student_id, school_id);

-- Insert default roles
INSERT INTO roles (name, display_name, description) VALUES 
('super_admin', 'Super Administrator', 'Full system access with user management capabilities'),
('admin', 'Administrator', 'Full access to assessment data and school management'),
('cluster_mentor', 'Cluster Mentor', 'Read-only access to schools within assigned clusters'),
('teacher', 'Teacher', 'Access to own school data with assessment capabilities'),
('viewer', 'Viewer', 'Read-only access to assigned schools')
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, resource, action, description) VALUES 
-- User management
('users.create', 'users', 'create', 'Create new users'),
('users.read', 'users', 'read', 'View user information'),
('users.update', 'users', 'update', 'Update user information'),
('users.delete', 'users', 'delete', 'Delete users'),
('users.manage_roles', 'users', 'manage_roles', 'Assign/remove user roles'),

-- Role management
('roles.create', 'roles', 'create', 'Create new roles'),
('roles.read', 'roles', 'read', 'View roles'),
('roles.update', 'roles', 'update', 'Update roles'),
('roles.delete', 'roles', 'delete', 'Delete roles'),
('roles.manage_permissions', 'roles', 'manage_permissions', 'Assign/remove role permissions'),

-- Assessment management
('assessments.create', 'assessments', 'create', 'Create assessment records'),
('assessments.read', 'assessments', 'read', 'View assessment data'),
('assessments.update', 'assessments', 'update', 'Update assessment records'),
('assessments.delete', 'assessments', 'delete', 'Delete assessment records'),
('assessments.export', 'assessments', 'export', 'Export assessment data'),

-- Student management
('students.read', 'students', 'read', 'View student information'),
('students.update', 'students', 'update', 'Update student information'),
('students.select', 'students', 'select', 'Select students for TaRL program'),
('students.export', 'students', 'export', 'Export student data'),

-- School management
('schools.read', 'schools', 'read', 'View school information'),
('schools.update', 'schools', 'update', 'Update school information'),
('schools.manage_access', 'schools', 'manage_access', 'Manage user access to schools'),

-- Report access
('reports.read', 'reports', 'read', 'View reports'),
('reports.export', 'reports', 'export', 'Export reports'),

-- System administration
('system.backup', 'system', 'backup', 'Create system backups'),
('system.restore', 'system', 'restore', 'Restore system from backup'),
('system.logs', 'system', 'logs', 'View system logs')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE 
  -- Super Admin gets all permissions
  (r.name = 'super_admin') OR
  
  -- Admin gets most permissions except user/role management
  (r.name = 'admin' AND p.name NOT IN ('users.create', 'users.delete', 'users.manage_roles', 'roles.create', 'roles.update', 'roles.delete', 'roles.manage_permissions', 'system.backup', 'system.restore')) OR
  
  -- Cluster Mentor gets read-only permissions
  (r.name = 'cluster_mentor' AND p.action = 'read') OR
  
  -- Teacher gets assessment and student permissions
  (r.name = 'teacher' AND p.name IN ('assessments.create', 'assessments.read', 'assessments.update', 'students.read', 'students.select', 'schools.read')) OR
  
  -- Viewer gets only read permissions
  (r.name = 'viewer' AND p.action = 'read' AND p.resource IN ('assessments', 'students', 'schools', 'reports'))
ON CONFLICT (role_id, permission_id) DO NOTHING;

COMMIT;

-- Add comments
COMMENT ON TABLE users IS 'System users with authentication and profile information';
COMMENT ON TABLE roles IS 'User roles defining sets of permissions';
COMMENT ON TABLE permissions IS 'Individual permissions for specific actions on resources';
COMMENT ON TABLE role_permissions IS 'Junction table linking roles to their permissions';
COMMENT ON TABLE user_roles IS 'Junction table linking users to their assigned roles';
COMMENT ON TABLE user_school_access IS 'School-level access control for users';
COMMENT ON TABLE user_sessions IS 'Active user sessions with enhanced security tracking';
COMMENT ON TABLE user_activity_log IS 'Audit trail of user actions';
COMMENT ON TABLE password_reset_tokens IS 'Tokens for password reset functionality';
COMMENT ON TABLE tarl_assessments IS 'TaRL assessment records for students';
COMMENT ON TABLE tarl_student_selection IS 'Students selected for TaRL intervention program';