-- TaRL Integration Database Schema
-- This script creates the new tables required for the TaRL assessment system
-- Run this against your existing PostgreSQL database that contains the base tables

-- Districts table
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_kh VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  province_id INTEGER REFERENCES tbl_province(prvProvinceID),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clusters table
CREATE TABLE IF NOT EXISTS clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  district_id UUID REFERENCES districts(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TaRL Assessments table
CREATE TABLE IF NOT EXISTS tarl_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id INTEGER REFERENCES tbl_child(chiID),
  teacher_id INTEGER REFERENCES tbl_teacher_information(teiAutoID),
  school_id INTEGER REFERENCES tbl_school_list(sclAutoID),
  subject VARCHAR(20) CHECK (subject IN ('Khmer', 'Math')),
  cycle VARCHAR(20) CHECK (cycle IN ('Baseline', 'Midline', 'Endline')),
  level_achieved VARCHAR(50) NOT NULL,
  assessment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TaRL Student Selection table
CREATE TABLE IF NOT EXISTS tarl_student_selection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id INTEGER REFERENCES tbl_child(chiID),
  school_id INTEGER REFERENCES tbl_school_list(sclAutoID),
  subject VARCHAR(20) CHECK (subject IN ('Khmer', 'Math')),
  baseline_level VARCHAR(50) NOT NULL,
  selected_for_program BOOLEAN DEFAULT false,
  selection_date DATE,
  selection_criteria TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, school_id, subject)
);

-- User Sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  teacher_id INTEGER REFERENCES tbl_teacher_information(teiAutoID),
  school_ids INTEGER[] DEFAULT '{}',
  subject VARCHAR(20),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  school_id INTEGER,
  subject VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tarl_assessments_student_id ON tarl_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_tarl_assessments_school_id ON tarl_assessments(school_id);
CREATE INDEX IF NOT EXISTS idx_tarl_assessments_subject_cycle ON tarl_assessments(subject, cycle);
CREATE INDEX IF NOT EXISTS idx_tarl_student_selection_student_school ON tarl_student_selection(student_id, school_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);

-- Sample data for districts (Battambang and Kampong Cham provinces)
-- Note: Replace the province_id values with actual IDs from your tbl_province table
-- INSERT INTO districts (name_kh, name_en, province_id) VALUES 
-- ('បាត់ដំបង', 'Battambang', 1),
-- ('កំពង់ចាម', 'Kampong Cham', 2);

COMMENT ON TABLE districts IS 'Administrative districts within provinces';
COMMENT ON TABLE clusters IS 'School clusters for mentorship organization';
COMMENT ON TABLE tarl_assessments IS 'Individual student assessment records for TaRL program';
COMMENT ON TABLE tarl_student_selection IS 'Students selected for TaRL intervention program';
COMMENT ON TABLE user_sessions IS 'Cookie-based user session management';
COMMENT ON TABLE user_permissions IS 'Role-based access control permissions';