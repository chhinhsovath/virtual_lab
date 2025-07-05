-- Virtual Lab Minimal Setup Script
-- This script creates only the essential tables needed for the current simulation features
-- Run this if you already have some tables and just need the missing ones

BEGIN;

-- =========================================
-- Essential Tables Only
-- =========================================

-- 1. Base student table if missing
CREATE TABLE IF NOT EXISTS tbl_child (
    chiID SERIAL PRIMARY KEY,
    chiChildID VARCHAR(50) UNIQUE,
    chiName VARCHAR(255) NOT NULL,
    chiNameKH VARCHAR(255),
    chiSex VARCHAR(10),
    chiDOB DATE,
    chiGrade VARCHAR(20),
    chiSchoolID INTEGER,
    chiStatus VARCHAR(50) DEFAULT 'Active',
    photo_url TEXT,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Extended student info
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

-- 3. Teacher table if missing
CREATE TABLE IF NOT EXISTS tbl_teacher_information (
    teiAutoID SERIAL PRIMARY KEY,
    teiTeacherID VARCHAR(50) UNIQUE,
    teiName VARCHAR(255) NOT NULL,
    teiNameKH VARCHAR(255),
    teiGender VARCHAR(10),
    teiPhone VARCHAR(20),
    teiEmail VARCHAR(255),
    teiSchoolID INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Simulations catalog (rename if lms_simulations exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lms_simulations') THEN
        -- Use existing lms_simulations table
        NULL;
    ELSE
        -- Create new table
        CREATE TABLE simulations_catalog (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            simulation_name VARCHAR(100) UNIQUE NOT NULL,
            display_name_en VARCHAR(255) NOT NULL,
            display_name_km VARCHAR(255) NOT NULL,
            description_en TEXT,
            description_km TEXT,
            subject_area VARCHAR(50) NOT NULL,
            grade_levels INTEGER[] NOT NULL,
            difficulty_level VARCHAR(20) NOT NULL,
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
    END IF;
END $$;

-- 5. Exercises table (rename if lms_exercises exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lms_exercises') THEN
        -- Use existing table
        NULL;
    ELSE
        -- Create new table
        CREATE TABLE simulation_exercises (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            simulation_id UUID NOT NULL,
            teacher_id INTEGER NOT NULL REFERENCES tbl_teacher_information(teiAutoID),
            question_number INTEGER NOT NULL,
            question_type VARCHAR(50) NOT NULL,
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
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END $$;

-- 6. Ensure student progress table exists
CREATE TABLE IF NOT EXISTS student_simulation_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id INTEGER NOT NULL,
    simulation_id UUID NOT NULL,
    session_id UUID,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_time_spent INTEGER DEFAULT 0,
    current_progress JSONB DEFAULT '{}',
    best_score DECIMAL(5,2),
    attempts_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'in_progress',
    completed_at TIMESTAMP,
    simulation_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Ensure exercise submissions table exists  
CREATE TABLE IF NOT EXISTS student_exercise_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL,
    student_id INTEGER NOT NULL,
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

-- 8. Activity logs
CREATE TABLE IF NOT EXISTS lms_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER,
    student_id INTEGER,
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

-- =========================================
-- Add Missing Columns
-- =========================================

-- Add photo_url to tbl_child if missing
ALTER TABLE tbl_child ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE tbl_child ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE tbl_child ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tbl_child ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- =========================================
-- Create Update Function and Triggers
-- =========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tbl_child_updated_at') THEN
        CREATE TRIGGER update_tbl_child_updated_at 
        BEFORE UPDATE ON tbl_child 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tbl_child_information_updated_at') THEN
        CREATE TRIGGER update_tbl_child_information_updated_at 
        BEFORE UPDATE ON tbl_child_information 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =========================================
-- Insert Pendulum Lab Simulation
-- =========================================

-- Check which table to use and insert simulation
DO $$
DECLARE
    sim_table TEXT;
    sim_id UUID;
BEGIN
    -- Determine which table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lms_simulations') THEN
        -- Insert into lms_simulations if not exists
        INSERT INTO lms_simulations (
            simulation_name, display_name_en, display_name_km,
            description_en, description_km,
            subject_area, grade_levels, difficulty_level,
            estimated_duration, simulation_url
        )
        SELECT 
            'pendulum-lab',
            'Pendulum Lab',
            'មន្ទីរពិសោធន៍ប៉ងដូល',
            'Explore the physics of pendulums',
            'ស្វែងយល់ពីរូបវិទ្យានៃប៉ងដូល',
            'Physics',
            ARRAY[7, 8, 9],
            'Intermediate',
            30,
            '/simulation_pendulum_lab_km.html'
        WHERE NOT EXISTS (
            SELECT 1 FROM lms_simulations WHERE simulation_name = 'pendulum-lab'
        );
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'simulations_catalog') THEN
        -- Insert into simulations_catalog if not exists
        INSERT INTO simulations_catalog (
            simulation_name, display_name_en, display_name_km,
            description_en, description_km,
            subject_area, grade_levels, difficulty_level,
            estimated_duration, simulation_url
        )
        SELECT 
            'pendulum-lab',
            'Pendulum Lab', 
            'មន្ទីរពិសោធន៍ប៉ងដូល',
            'Explore the physics of pendulums',
            'ស្វែងយល់ពីរូបវិទ្យានៃប៉ងដូល',
            'Physics',
            ARRAY[7, 8, 9],
            'Intermediate',
            30,
            '/simulation_pendulum_lab_km.html'
        WHERE NOT EXISTS (
            SELECT 1 FROM simulations_catalog WHERE simulation_name = 'pendulum-lab'
        );
    END IF;
END $$;

-- =========================================
-- Create Essential Indexes
-- =========================================

CREATE INDEX IF NOT EXISTS idx_tbl_child_email ON tbl_child(email);
CREATE INDEX IF NOT EXISTS idx_tbl_child_updated ON tbl_child(updated_at);
CREATE INDEX IF NOT EXISTS idx_child_info ON tbl_child_information(chiID);
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON student_simulation_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_exercise_submissions_student ON student_exercise_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_student ON lms_activity_logs(student_id);

COMMIT;

-- =========================================
-- Quick Verification
-- =========================================

SELECT 'Setup Complete!' as status;

-- Show key tables
SELECT table_name, 'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'tbl_child',
    'tbl_child_information', 
    'student_simulation_progress',
    'student_exercise_submissions',
    'lms_activity_logs'
  )
ORDER BY table_name;