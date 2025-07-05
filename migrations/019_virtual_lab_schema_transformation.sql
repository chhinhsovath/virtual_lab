-- Virtual Lab Cambodia - Schema Transformation
-- Transform TaRL assessment system to STEM simulation platform
-- This migration removes TaRL references and creates STEM-focused schema

-- Rename tables to remove TaRL references
ALTER TABLE IF EXISTS tarl_assessments RENAME TO stem_simulations_log;
ALTER TABLE IF EXISTS tarl_student_selection RENAME TO stem_program_enrollment;

-- Update table comments
COMMENT ON TABLE stem_simulations_log IS 'Student interaction logs with STEM simulations';
COMMENT ON TABLE stem_program_enrollment IS 'Students enrolled in Virtual Lab STEM program';

-- Add new columns for STEM simulation tracking
ALTER TABLE stem_simulations_log 
  DROP COLUMN IF EXISTS subject,
  DROP COLUMN IF EXISTS cycle,
  DROP COLUMN IF EXISTS level_achieved,
  ADD COLUMN simulation_id VARCHAR(100) NOT NULL DEFAULT 'pendulum-lab',
  ADD COLUMN simulation_type VARCHAR(50) CHECK (simulation_type IN ('Physics', 'Chemistry', 'Biology', 'Mathematics')),
  ADD COLUMN interaction_duration INTEGER DEFAULT 0, -- seconds
  ADD COLUMN completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  ADD COLUMN learning_objectives_met TEXT[],
  ADD COLUMN simulation_data JSONB, -- Store simulation state/results
  ADD COLUMN difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
  DROP CONSTRAINT IF EXISTS tarl_assessments_subject_check,
  DROP CONSTRAINT IF EXISTS tarl_assessments_cycle_check;

-- Update stem_program_enrollment table
ALTER TABLE stem_program_enrollment
  DROP COLUMN IF EXISTS subject,
  DROP COLUMN IF EXISTS baseline_level,
  DROP COLUMN IF EXISTS selected_for_program,
  DROP COLUMN IF EXISTS selection_date,
  DROP COLUMN IF EXISTS selection_criteria,
  ADD COLUMN program_type VARCHAR(50) CHECK (program_type IN ('Physics', 'Chemistry', 'Biology', 'Mathematics', 'General_STEM')),
  ADD COLUMN enrollment_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN learning_path VARCHAR(100),
  ADD COLUMN progress_level VARCHAR(20) CHECK (progress_level IN ('Beginner', 'Intermediate', 'Advanced')),
  ADD COLUMN parent_consent BOOLEAN DEFAULT false,
  ADD COLUMN teacher_assigned INTEGER REFERENCES tbl_teacher_information(teiAutoID),
  ADD COLUMN enrollment_status VARCHAR(20) CHECK (enrollment_status IN ('Active', 'Inactive', 'Completed', 'Suspended')) DEFAULT 'Active',
  DROP CONSTRAINT IF EXISTS tarl_student_selection_subject_check,
  DROP CONSTRAINT IF EXISTS tarl_student_selection_student_id_school_id_subject_key;

-- Create new unique constraint for stem_program_enrollment
ALTER TABLE stem_program_enrollment 
  ADD CONSTRAINT unique_student_school_program 
  UNIQUE(student_id, school_id, program_type);

-- Create STEM simulations catalog table
CREATE TABLE IF NOT EXISTS stem_simulations_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_name VARCHAR(100) NOT NULL UNIQUE,
  display_name_en VARCHAR(200) NOT NULL,
  display_name_km VARCHAR(200) NOT NULL,
  description_en TEXT,
  description_km TEXT,
  subject_area VARCHAR(50) CHECK (subject_area IN ('Physics', 'Chemistry', 'Biology', 'Mathematics')),
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
  grade_levels INTEGER[],
  estimated_duration INTEGER, -- minutes
  learning_objectives_en TEXT[],
  learning_objectives_km TEXT[],
  simulation_url VARCHAR(500),
  preview_image VARCHAR(500),
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create teacher simulation assignments table
CREATE TABLE IF NOT EXISTS teacher_simulation_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id INTEGER REFERENCES tbl_teacher_information(teiAutoID),
  simulation_id UUID REFERENCES stem_simulations_catalog(id),
  school_id INTEGER REFERENCES tbl_school_list(sclAutoID),
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
  student_id INTEGER REFERENCES tbl_child(chiID),
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
  student_id INTEGER REFERENCES tbl_child(chiID),
  school_id INTEGER REFERENCES tbl_school_list(sclAutoID),
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

-- Update indexes
DROP INDEX IF EXISTS idx_tarl_assessments_student_id;
DROP INDEX IF EXISTS idx_tarl_assessments_school_id;
DROP INDEX IF EXISTS idx_tarl_assessments_subject_cycle;
DROP INDEX IF EXISTS idx_tarl_student_selection_student_school;

-- Create new indexes for STEM platform
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

-- Add table comments
COMMENT ON TABLE stem_simulations_catalog IS 'Catalog of available STEM simulations in Virtual Lab Cambodia';
COMMENT ON TABLE teacher_simulation_assignments IS 'Teacher assignments using STEM simulations';
COMMENT ON TABLE student_simulation_progress IS 'Individual student progress tracking for simulations';
COMMENT ON TABLE learning_analytics IS 'Learning analytics and performance metrics for STEM education';

-- Update existing user roles to reflect STEM education focus
UPDATE user_sessions SET user_role = 'stem_teacher' WHERE user_role = 'teacher';
UPDATE user_sessions SET user_role = 'stem_student' WHERE user_role = 'student';
UPDATE user_sessions SET user_role = 'stem_admin' WHERE user_role = 'admin';

-- Add new user roles for Virtual Lab Cambodia
INSERT INTO user_permissions (user_id, resource, action) VALUES 
(0, 'simulations', 'view'),
(0, 'simulations', 'interact'),
(0, 'progress', 'view_own');

COMMENT ON COLUMN stem_simulations_log.simulation_data IS 'JSON data storing simulation parameters, results, and student interactions';
COMMENT ON COLUMN student_simulation_progress.current_progress IS 'JSON data storing current state of simulation for resume functionality';
COMMENT ON COLUMN learning_analytics.additional_data IS 'JSON data for storing flexible analytics metrics';

-- Migration completed
INSERT INTO learning_analytics (student_id, school_id, subject_area, metric_name, metric_value, metric_unit, additional_data) 
VALUES (0, 0, 'System', 'schema_migration', 19, 'version', '{"migration_name": "virtual_lab_schema_transformation", "completed_at": "' || CURRENT_TIMESTAMP || '"}');