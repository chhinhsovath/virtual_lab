-- Migration: Create simulation system tables
-- Description: Tables for simulation catalog, student progress, assignments, and achievements

-- Simulation catalog table
CREATE TABLE IF NOT EXISTS simulations_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_name VARCHAR(100) NOT NULL UNIQUE,
    display_name_en VARCHAR(255) NOT NULL,
    display_name_km VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_km TEXT,
    subject_area VARCHAR(50) NOT NULL, -- Physics, Chemistry, Biology, Math
    grade_levels INTEGER[] NOT NULL, -- Array of grade levels [9,10,11,12]
    difficulty_level VARCHAR(20) NOT NULL, -- Beginner, Intermediate, Advanced
    estimated_duration INTEGER NOT NULL, -- Duration in minutes
    simulation_url TEXT NOT NULL,
    thumbnail_url TEXT,
    learning_objectives_en TEXT[],
    learning_objectives_km TEXT[],
    tags VARCHAR(50)[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student simulation progress table
CREATE TABLE IF NOT EXISTS student_simulation_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    simulation_id UUID NOT NULL REFERENCES simulations_catalog(id),
    session_id UUID DEFAULT gen_random_uuid(),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    total_time_minutes INTEGER DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    attempts INTEGER DEFAULT 1,
    best_score DECIMAL(5,2) DEFAULT 0,
    current_score DECIMAL(5,2) DEFAULT 0,
    simulation_data JSONB DEFAULT '{}', -- Store simulation parameters and results
    is_completed BOOLEAN DEFAULT false,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES tbl_child(id)
);

-- Teacher simulation assignments table
CREATE TABLE IF NOT EXISTS simulation_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL,
    simulation_id UUID NOT NULL REFERENCES simulations_catalog(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions_en TEXT,
    instructions_km TEXT,
    due_date TIMESTAMP,
    max_score INTEGER DEFAULT 100,
    is_graded BOOLEAN DEFAULT false,
    school_id UUID,
    grade_levels INTEGER[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES tbl_teacher_information(id),
    FOREIGN KEY (school_id) REFERENCES tbl_school_list(id)
);

-- Student assignment submissions table
CREATE TABLE IF NOT EXISTS student_assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES simulation_assignments(id),
    student_id UUID NOT NULL,
    progress_id UUID NOT NULL REFERENCES student_simulation_progress(id),
    submitted_at TIMESTAMP,
    score DECIMAL(5,2),
    feedback TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, submitted, graded
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES tbl_child(id)
);

-- Simulation achievements table
CREATE TABLE IF NOT EXISTS simulation_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description_en TEXT,
    description_km TEXT,
    achievement_type VARCHAR(50) NOT NULL, -- completion, score, time, streak
    criteria JSONB NOT NULL, -- Criteria for unlocking achievement
    points INTEGER DEFAULT 0,
    badge_icon VARCHAR(50),
    badge_color VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student achievements table
CREATE TABLE IF NOT EXISTS student_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    achievement_id UUID NOT NULL REFERENCES simulation_achievements(id),
    simulation_id UUID REFERENCES simulations_catalog(id),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    points_earned INTEGER DEFAULT 0,
    FOREIGN KEY (student_id) REFERENCES tbl_child(id),
    UNIQUE(student_id, achievement_id, simulation_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_simulation_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_simulation_id ON student_simulation_progress(simulation_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_session_id ON student_simulation_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON simulation_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_school_id ON simulation_assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON student_assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON student_assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_achievements_student_id ON student_achievements(student_id);

-- Insert sample simulation data
INSERT INTO simulations_catalog (
    simulation_name, display_name_en, display_name_km, description_en, description_km,
    subject_area, grade_levels, difficulty_level, estimated_duration, simulation_url,
    learning_objectives_en, learning_objectives_km, tags
) VALUES (
    'pendulum-lab',
    'Pendulum Lab',
    'ភេនឌុលម៉ាម',
    'Explore the physics of pendulum motion, investigating how length, mass, and gravity affect the period of oscillation.',
    'រកមើលរូបវិទ្យានៃចលនាភេនឌុលម៉ាម ស្រាវជ្រាវពីរបៀបដែលប្រវែង ម៉ាស និងទំនាញផែនដីប៉ះពាល់ដល់កំឡុងពេលនៃចលនាញាប់ញ័រ',
    'Physics',
    ARRAY[9, 10, 11, 12],
    'Intermediate',
    45,
    '/simulation_pendulum_lab_km.html',
    ARRAY['Understand periodic motion and energy conservation', 'Investigate gravitational effects', 'Apply mathematical relationships'],
    ARRAY['យល់ពីចលនាកាលកំណត់ និងការអភិរក្សថាមពល', 'ស្រាវជ្រាវឥទ្ធិពលទំនាញផែនដី', 'អនុវត្តទំនាក់ទំនងគណិតវិទ្យា'],
    ARRAY['physics', 'pendulum', 'motion', 'gravity', 'period']
);

-- Insert sample achievements
INSERT INTO simulation_achievements (name, description_en, description_km, achievement_type, criteria, points, badge_icon, badge_color) VALUES
    ('First Launch', 'Started your first simulation', 'បានចាប់ផ្តើមការធ្វើពិសោធន៍ដំបូង', 'completion', '{"type": "first_start"}', 10, 'play', 'blue'),
    ('Quick Learner', 'Completed simulation in under 30 minutes', 'បានបញ្ចប់ការធ្វើពិសោធន៍ក្នុងរយៈពេលក្រោម 30 នាទី', 'time', '{"type": "time_under", "minutes": 30}', 20, 'zap', 'yellow'),
    ('Perfect Score', 'Achieved 100% accuracy', 'បានទទួលពិន្ទុពេញ 100%', 'score', '{"type": "perfect_score"}', 50, 'trophy', 'gold'),
    ('Persistent Learner', 'Completed 5 simulations', 'បានបញ្ចប់ការធ្វើពិសោធន៍ 5 ដង', 'streak', '{"type": "simulation_count", "count": 5}', 30, 'target', 'green');

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_simulations_catalog_updated_at BEFORE UPDATE ON simulations_catalog FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_student_simulation_progress_updated_at BEFORE UPDATE ON student_simulation_progress FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_simulation_assignments_updated_at BEFORE UPDATE ON simulation_assignments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_student_assignment_submissions_updated_at BEFORE UPDATE ON student_assignment_submissions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();