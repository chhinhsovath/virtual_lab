-- Complete Virtual Lab LMS Setup
-- This script ensures all essential tables are created

-- Users table (core table)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LMS Courses
CREATE TABLE IF NOT EXISTS lms_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100),
    grade VARCHAR(20),
    academic_year VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LMS Labs
CREATE TABLE IF NOT EXISTS lms_labs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES lms_courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100),
    grade VARCHAR(20),
    estimated_duration_minutes INTEGER,
    status VARCHAR(20) DEFAULT 'draft',
    simulation_url TEXT,
    worksheet_url TEXT,
    rubric_url TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lab Sessions
CREATE TABLE IF NOT EXISTS lab_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID REFERENCES lms_labs(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    status VARCHAR(20) DEFAULT 'in_progress'
);

-- Lab Submissions
CREATE TABLE IF NOT EXISTS lab_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES lab_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    responses JSONB,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lab Scores
CREATE TABLE IF NOT EXISTS lab_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lab_id UUID REFERENCES lms_labs(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES lab_submissions(id) ON DELETE CASCADE,
    auto_score FLOAT,
    manual_score FLOAT,
    final_score FLOAT GENERATED ALWAYS AS (COALESCE(manual_score, auto_score)) STORED,
    teacher_comments TEXT,
    rubric_breakdown JSONB,
    graded_by UUID REFERENCES users(id),
    graded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, lab_id)
);

-- Curriculums
CREATE TABLE IF NOT EXISTS curriculums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    academic_year VARCHAR(20) NOT NULL,
    subject VARCHAR(100),
    grade VARCHAR(20),
    course_id UUID REFERENCES lms_courses(id) ON DELETE CASCADE,
    total_weeks INTEGER DEFAULT 36,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'draft',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Curriculum Labs
CREATE TABLE IF NOT EXISTS curriculum_labs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curriculum_id UUID REFERENCES curriculums(id) ON DELETE CASCADE,
    lab_id UUID REFERENCES lms_labs(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    order_in_week INTEGER DEFAULT 1,
    estimated_duration_minutes INTEGER,
    is_required BOOLEAN DEFAULT true,
    due_date_offset INTEGER DEFAULT 7,
    teacher_notes TEXT,
    learning_objectives TEXT,
    prerequisites TEXT,
    status VARCHAR(20) DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(curriculum_id, lab_id)
);

-- Lab Skills
CREATE TABLE IF NOT EXISTS lab_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_name VARCHAR(100) NOT NULL UNIQUE,
    skill_category VARCHAR(50) NOT NULL,
    skill_description TEXT,
    skill_level VARCHAR(20) DEFAULT 'beginner',
    prerequisite_skills JSONB DEFAULT '[]',
    related_subjects JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default skills if they don't exist
INSERT INTO lab_skills (skill_name, skill_category, skill_description, skill_level) VALUES
('Data Collection', 'measurement', 'Ability to gather and record experimental data accurately', 'beginner'),
('Graph Creation', 'graphing', 'Creating various types of graphs and charts', 'beginner'),
('Graph Interpretation', 'graphing', 'Reading and analyzing data from graphs', 'intermediate'),
('Mathematical Calculation', 'calculation', 'Performing calculations related to experimental results', 'beginner'),
('Hypothesis Formation', 'analysis', 'Developing testable hypotheses based on observations', 'intermediate'),
('Variable Identification', 'analysis', 'Identifying independent and dependent variables', 'beginner'),
('Pattern Recognition', 'analysis', 'Identifying trends and patterns in data', 'intermediate'),
('Scientific Reasoning', 'analysis', 'Drawing logical conclusions from experimental evidence', 'advanced')
ON CONFLICT (skill_name) DO NOTHING;

-- Create demo users if they don't exist
INSERT INTO users (email, name, role, password_hash) VALUES
('admin@virtuallab.com', 'System Administrator', 'admin', '$2b$10$demo.hash.for.testing'),
('teacher@virtuallab.com', 'Demo Teacher', 'teacher', '$2b$10$demo.hash.for.testing'),
('student@virtuallab.com', 'Demo Student', 'student', '$2b$10$demo.hash.for.testing'),
('parent@virtuallab.com', 'Demo Parent', 'parent', '$2b$10$demo.hash.for.testing')
ON CONFLICT (email) DO NOTHING;

-- Create demo course
INSERT INTO lms_courses (name, description, subject, grade, academic_year, created_by)
SELECT 
    'Introduction to Physics',
    'Basic physics concepts and laboratory experiments',
    'Physics',
    'Grade 9',
    '2024-2025',
    u.id
FROM users u 
WHERE u.role = 'admin'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Create demo lab
INSERT INTO lms_labs (course_id, title, description, subject, grade, estimated_duration_minutes, created_by)
SELECT 
    c.id,
    'Pendulum Motion Experiment',
    'Study the relationship between pendulum length and period',
    'Physics',
    'Grade 9',
    60,
    u.id
FROM lms_courses c, users u
WHERE u.role = 'admin'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_lms_courses_subject_grade ON lms_courses(subject, grade);
CREATE INDEX IF NOT EXISTS idx_lms_labs_course_id ON lms_labs(course_id);
CREATE INDEX IF NOT EXISTS idx_lab_sessions_lab_student ON lab_sessions(lab_id, student_id);
CREATE INDEX IF NOT EXISTS idx_lab_scores_student_lab ON lab_scores(student_id, lab_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_labs_curriculum_id ON curriculum_labs(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_labs_week_number ON curriculum_labs(week_number);

-- Update functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lms_courses_updated_at BEFORE UPDATE ON lms_courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lms_labs_updated_at BEFORE UPDATE ON lms_labs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculums_updated_at BEFORE UPDATE ON curriculums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculum_labs_updated_at BEFORE UPDATE ON curriculum_labs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();