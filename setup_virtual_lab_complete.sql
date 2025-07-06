-- Virtual Lab Complete Setup Script
-- Run this script directly in your PostgreSQL database to set up all necessary tables
-- This combines all critical migrations into one script

-- Start transaction
BEGIN;

-- Create migration tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checksum VARCHAR(64),
    execution_time_ms INTEGER,
    applied_by VARCHAR(100),
    notes TEXT
);

-- =========================================
-- STEP 1: Base TaRL Tables
-- =========================================

-- Province table
CREATE TABLE IF NOT EXISTS tbl_province (
    prvProvinceID SERIAL PRIMARY KEY,
    prvProvinceName VARCHAR(255) NOT NULL,
    prvProvinceNameKH VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- School list table
CREATE TABLE IF NOT EXISTS tbl_school_list (
    sclAutoID SERIAL PRIMARY KEY,
    sclSchoolID VARCHAR(50) UNIQUE,
    sclSchoolName VARCHAR(255) NOT NULL,
    sclSchoolNameKH VARCHAR(255),
    sclProvince INTEGER REFERENCES tbl_province(prvProvinceID),
    sclDistrict VARCHAR(255),
    sclCluster VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teacher information table
CREATE TABLE IF NOT EXISTS tbl_teacher_information (
    teiAutoID SERIAL PRIMARY KEY,
    teiTeacherID VARCHAR(50) UNIQUE,
    teiName VARCHAR(255) NOT NULL,
    teiNameKH VARCHAR(255),
    teiGender VARCHAR(10),
    teiPhone VARCHAR(20),
    teiEmail VARCHAR(255),
    teiSchoolID INTEGER REFERENCES tbl_school_list(sclAutoID),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Child table (students)
CREATE TABLE IF NOT EXISTS tbl_child (
    chiID SERIAL PRIMARY KEY,
    chiChildID VARCHAR(50) UNIQUE,
    chiName VARCHAR(255) NOT NULL,
    chiNameKH VARCHAR(255),
    chiSex VARCHAR(10),
    chiDOB DATE,
    chiGrade VARCHAR(20),
    chiSchoolID INTEGER REFERENCES tbl_school_list(sclAutoID),
    chiStatus VARCHAR(50) DEFAULT 'Active',
    photo_url TEXT,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Child information table (extended info)
CREATE TABLE IF NOT EXISTS tbl_child_information (
    ID SERIAL PRIMARY KEY,
    chiID INTEGER REFERENCES tbl_child(chiID),
    phone_number VARCHAR(20),
    father_name VARCHAR(255),
    father_phone VARCHAR(20),
    mother_name VARCHAR(255),
    mother_phone VARCHAR(20),
    current_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- STEP 2: User and Authentication Tables
-- =========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User school access
CREATE TABLE IF NOT EXISTS user_school_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    school_id INTEGER REFERENCES tbl_school_list(sclAutoID),
    access_level VARCHAR(50) NOT NULL CHECK (access_level IN ('read', 'write', 'admin')),
    subject VARCHAR(50),
    granted_by INTEGER REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, school_id, subject)
);

-- =========================================
-- STEP 3: Simulation Tables
-- =========================================

-- Simulations catalog
CREATE TABLE IF NOT EXISTS simulations_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_name VARCHAR(100) UNIQUE NOT NULL,
    display_name_en VARCHAR(255) NOT NULL,
    display_name_km VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_km TEXT,
    subject_area VARCHAR(50) NOT NULL,
    grade_levels INTEGER[] NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
    estimated_duration INTEGER NOT NULL,
    simulation_url TEXT NOT NULL,
    thumbnail_url TEXT,
    learning_objectives_en TEXT[],
    learning_objectives_km TEXT[],
    tags VARCHAR(50)[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student simulation progress
CREATE TABLE IF NOT EXISTS student_simulation_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id INTEGER NOT NULL REFERENCES tbl_child(chiID),
    simulation_id UUID NOT NULL REFERENCES simulations_catalog(id),
    session_id UUID,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_time_spent INTEGER DEFAULT 0,
    current_progress JSONB DEFAULT '{}',
    best_score DECIMAL(5,2),
    attempts_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    completed_at TIMESTAMP,
    simulation_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, simulation_id)
);

-- =========================================
-- STEP 4: Exercise Tables
-- =========================================

-- Simulation exercises
CREATE TABLE IF NOT EXISTS simulation_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_id UUID NOT NULL REFERENCES simulations_catalog(id) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES tbl_teacher_information(teiAutoID),
    question_number INTEGER NOT NULL,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'short_answer', 'calculation', 'true_false', 'fill_blank')),
    question_en TEXT NOT NULL,
    question_km TEXT NOT NULL,
    instructions_en TEXT,
    instructions_km TEXT,
    options JSONB,
    correct_answer TEXT,
    acceptable_answers JSONB,
    points INTEGER NOT NULL DEFAULT 10,
    difficulty_level VARCHAR(20),
    hints_en TEXT,
    hints_km TEXT,
    explanation_en TEXT,
    explanation_km TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(simulation_id, question_number)
);

-- Student exercise submissions
CREATE TABLE IF NOT EXISTS student_exercise_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL REFERENCES simulation_exercises(id),
    student_id INTEGER NOT NULL REFERENCES tbl_child(chiID),
    session_id UUID,
    submitted_answer TEXT NOT NULL,
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    time_spent INTEGER,
    attempts INTEGER DEFAULT 1,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- STEP 5: Activity and Analytics Tables
-- =========================================

-- Activity logs
CREATE TABLE IF NOT EXISTS lms_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id),
    student_id INTEGER REFERENCES tbl_child(chiID),
    activity_type VARCHAR(100) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details JSONB DEFAULT '{}',
    resource_type VARCHAR(100),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student achievements
CREATE TABLE IF NOT EXISTS student_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id INTEGER NOT NULL REFERENCES tbl_child(chiID),
    achievement_type VARCHAR(100) NOT NULL,
    achievement_name VARCHAR(255) NOT NULL,
    description TEXT,
    points_earned INTEGER DEFAULT 0,
    badge_icon VARCHAR(100),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    simulation_id UUID REFERENCES simulations_catalog(id),
    details JSONB DEFAULT '{}'
);

-- =========================================
-- STEP 6: Create Indexes
-- =========================================

-- Base table indexes
CREATE INDEX IF NOT EXISTS idx_school_province ON tbl_school_list(sclProvince);
CREATE INDEX IF NOT EXISTS idx_teacher_school ON tbl_teacher_information(teiSchoolID);
CREATE INDEX IF NOT EXISTS idx_child_school ON tbl_child(chiSchoolID);
CREATE INDEX IF NOT EXISTS idx_child_info ON tbl_child_information(chiID);
CREATE INDEX IF NOT EXISTS idx_tbl_child_email ON tbl_child(email);
CREATE INDEX IF NOT EXISTS idx_tbl_child_updated ON tbl_child(updated_at);

-- User and session indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_school_access_user ON user_school_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_school_access_school ON user_school_access(school_id);

-- Simulation indexes
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_simulation_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_simulation_id ON student_simulation_progress(simulation_id);
CREATE INDEX IF NOT EXISTS idx_simulation_exercises_simulation_id ON simulation_exercises(simulation_id);
CREATE INDEX IF NOT EXISTS idx_simulation_exercises_teacher_id ON simulation_exercises(teacher_id);

-- Submission indexes
CREATE INDEX IF NOT EXISTS idx_student_submissions_student_id ON student_exercise_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_submissions_exercise_id ON student_exercise_submissions(exercise_id);
CREATE INDEX IF NOT EXISTS idx_student_submissions_session_id ON student_exercise_submissions(session_id);

-- Activity and achievement indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON lms_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_student_id ON lms_activity_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON lms_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_student_achievements_student_id ON student_achievements(student_id);

-- =========================================
-- STEP 7: Create Update Timestamp Function
-- =========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tbl_child_updated_at BEFORE UPDATE ON tbl_child FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_child_information_updated_at BEFORE UPDATE ON tbl_child_information FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_simulations_catalog_updated_at BEFORE UPDATE ON simulations_catalog FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_simulation_progress_updated_at BEFORE UPDATE ON student_simulation_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_simulation_exercises_updated_at BEFORE UPDATE ON simulation_exercises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- STEP 8: Insert Sample Data
-- =========================================

-- Insert sample provinces
INSERT INTO tbl_province (prvProvinceName, prvProvinceNameKH) VALUES
('Phnom Penh', 'ភ្នំពេញ'),
('Kandal', 'កណ្តាល'),
('Kampong Cham', 'កំពង់ចាម'),
('Siem Reap', 'សៀមរាប')
ON CONFLICT DO NOTHING;

-- Insert sample schools
INSERT INTO tbl_school_list (sclSchoolID, sclSchoolName, sclSchoolNameKH, sclProvince, sclDistrict, sclCluster)
SELECT 
    'SCH001', 'Phnom Penh Primary School', 'សាលាបឋមសិក្សាភ្នំពេញ', 
    (SELECT prvProvinceID FROM tbl_province WHERE prvProvinceName = 'Phnom Penh'),
    'Chamkar Mon', 'Cluster A'
WHERE NOT EXISTS (SELECT 1 FROM tbl_school_list WHERE sclSchoolID = 'SCH001');

-- Insert sample teacher
INSERT INTO tbl_teacher_information (teiTeacherID, teiName, teiNameKH, teiGender, teiPhone, teiEmail, teiSchoolID)
SELECT 
    'TEA001', 'Sophea Kim', 'គីម សុភា', 'Female', '012345678', 'sophea.kim@example.com',
    (SELECT sclAutoID FROM tbl_school_list WHERE sclSchoolID = 'SCH001')
WHERE NOT EXISTS (SELECT 1 FROM tbl_teacher_information WHERE teiTeacherID = 'TEA001');

-- Insert demo user account (password: demo123)
INSERT INTO users (username, password_hash, name, email, role)
VALUES 
    ('demo_student', '$2a$10$xQqQjT6W0h2Ehq3DKrZYOuUXbR7GNKrH1qgHZfKQzH8wFkqR8QqKq', 'Demo Student', 'student@demo.com', 'student'),
    ('demo_teacher', '$2a$10$xQqQjT6W0h2Ehq3DKrZYOuUXbR7GNKrH1qgHZfKQzH8wFkqR8QqKq', 'Demo Teacher', 'teacher@demo.com', 'teacher')
ON CONFLICT (username) DO NOTHING;

-- Insert simulations
INSERT INTO simulations_catalog (
    simulation_name, display_name_en, display_name_km, 
    description_en, description_km,
    subject_area, grade_levels, difficulty_level, 
    estimated_duration, simulation_url, thumbnail_url,
    learning_objectives_en, learning_objectives_km
) VALUES
(
    'pendulum-lab',
    'Pendulum Lab',
    'មន្ទីរពិសោធន៍ប៉ងដូល',
    'Explore the physics of pendulums with this interactive simulation',
    'ស្វែងយល់ពីរូបវិទ្យានៃប៉ងដូលជាមួយពិសោធន៍អន្តរកម្មនេះ',
    'Physics',
    ARRAY[7, 8, 9],
    'Intermediate',
    30,
    '/simulation_pendulum_lab_km.html',
    '/images/pendulum-lab-thumb.png',
    ARRAY['Understand periodic motion', 'Explore factors affecting pendulum period', 'Apply mathematical relationships'],
    ARRAY['យល់ដឹងពីចលនាតាមកាលកំណត់', 'ស្វែងយល់ពីកត្តាដែលប៉ះពាល់ដល់រយៈពេលប៉ងដូល', 'អនុវត្តទំនាក់ទំនងគណិតវិទ្យា']
)
ON CONFLICT (simulation_name) DO NOTHING;

-- Insert sample exercises for pendulum lab
INSERT INTO simulation_exercises (
    simulation_id, teacher_id, question_number, question_type,
    question_en, question_km, 
    instructions_en, instructions_km,
    options, correct_answer, points
)
SELECT 
    s.id,
    t.teiAutoID,
    1,
    'multiple_choice',
    'What happens to the period of a pendulum when you increase its length?',
    'តើមានអ្វីកើតឡើងចំពោះរយៈពេលនៃប៉ងដូលនៅពេលអ្នកបង្កើនប្រវែងរបស់វា?',
    'Choose the best answer based on your observations',
    'ជ្រើសរើសចម្លើយល្អបំផុតផ្អែកលើការសង្កេតរបស់អ្នក',
    '{"options_en": ["It increases", "It decreases", "It stays the same", "It doubles"], "options_km": ["វាកើនឡើង", "វាថយចុះ", "វានៅដដែល", "វាកើនឡើងទ្វេដង"]}',
    'It increases',
    10
FROM simulations_catalog s
CROSS JOIN tbl_teacher_information t
WHERE s.simulation_name = 'pendulum-lab' 
  AND t.teiTeacherID = 'TEA001'
  AND NOT EXISTS (
    SELECT 1 FROM simulation_exercises 
    WHERE simulation_id = s.id AND question_number = 1
  );

-- Record migrations
INSERT INTO schema_migrations (migration_name, applied_by, notes)
VALUES 
    ('complete_virtual_lab_setup.sql', CURRENT_USER, 'Complete setup script for virtual lab')
ON CONFLICT (migration_name) DO NOTHING;

-- Commit transaction
COMMIT;

-- =========================================
-- Verification Queries (Run these to verify setup)
-- =========================================

-- Check tables
SELECT 'Tables created:' as status, count(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE 'tbl_%' 
    OR table_name LIKE 'simulation%' 
    OR table_name LIKE 'student_%'
    OR table_name = 'users');

-- Check simulations
SELECT 'Simulations loaded:' as status, count(*) as count 
FROM simulations_catalog;

-- Check exercises
SELECT 'Exercises created:' as status, count(*) as count 
FROM simulation_exercises;

-- Check users
SELECT 'Demo users created:' as status, username, role 
FROM users 
WHERE username LIKE 'demo_%';