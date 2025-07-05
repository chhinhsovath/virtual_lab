-- Migration 023: Create student-specific tables for STEM learning platform
-- Creates tables for student progress, assignments, and achievements

-- Student simulation progress tracking
CREATE TABLE IF NOT EXISTS student_simulation_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    simulation_id UUID NOT NULL REFERENCES stem_simulations_catalog(id),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent INTEGER DEFAULT 0, -- in minutes
    attempts INTEGER DEFAULT 0,
    best_score DECIMAL(4,2) DEFAULT 0.0 CHECK (best_score >= 0 AND best_score <= 10),
    completed BOOLEAN DEFAULT false,
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, simulation_id)
);

-- Student assignments
CREATE TABLE IF NOT EXISTS student_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    teacher_id UUID,
    simulation_id UUID NOT NULL REFERENCES stem_simulations_catalog(id),
    title VARCHAR(255) NOT NULL,
    instructions TEXT,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'late')),
    score DECIMAL(4,2),
    max_score DECIMAL(4,2) DEFAULT 10.0,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student achievements/badges system
CREATE TABLE IF NOT EXISTS student_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(10) DEFAULT '🏆',
    category VARCHAR(50) NOT NULL,
    points INTEGER DEFAULT 0,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_simulation_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_simulation_id ON student_simulation_progress(simulation_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_last_accessed ON student_simulation_progress(last_accessed);

CREATE INDEX IF NOT EXISTS idx_student_assignments_student_id ON student_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_due_date ON student_assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_student_assignments_status ON student_assignments(status);

CREATE INDEX IF NOT EXISTS idx_student_achievements_student_id ON student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_student_achievements_category ON student_achievements(category);

-- Insert sample data for development and testing
-- Sample student progress (using mock student IDs)
INSERT INTO student_simulation_progress (student_id, simulation_id, progress_percentage, time_spent, attempts, best_score, completed, last_accessed) VALUES
-- Physics simulations
('11111111-1111-1111-1111-111111111111', (SELECT id FROM stem_simulations_catalog WHERE simulation_name = 'pendulum-lab'), 75, 45, 3, 8.5, false, NOW() - INTERVAL '1 day'),
('11111111-1111-1111-1111-111111111111', (SELECT id FROM stem_simulations_catalog WHERE simulation_name = 'circuit-construction-kit'), 60, 30, 2, 7.8, false, NOW() - INTERVAL '2 days'),
('11111111-1111-1111-1111-111111111111', (SELECT id FROM stem_simulations_catalog WHERE simulation_name = 'wave-interference'), 100, 50, 4, 9.2, true, NOW() - INTERVAL '3 days'),

-- Chemistry simulations  
('11111111-1111-1111-1111-111111111111', (SELECT id FROM stem_simulations_catalog WHERE simulation_name = 'build-a-molecule'), 100, 35, 2, 9.0, true, NOW() - INTERVAL '4 days'),
('11111111-1111-1111-1111-111111111111', (SELECT id FROM stem_simulations_catalog WHERE simulation_name = 'ph-scale'), 80, 25, 3, 8.7, false, NOW() - INTERVAL '5 days'),

-- Biology simulations
('11111111-1111-1111-1111-111111111111', (SELECT id FROM stem_simulations_catalog WHERE simulation_name = 'gene-expression-essentials'), 90, 40, 2, 8.9, false, NOW() - INTERVAL '6 days'),

-- Mathematics simulations
('11111111-1111-1111-1111-111111111111', (SELECT id FROM stem_simulations_catalog WHERE simulation_name = 'function-builder'), 85, 35, 3, 8.3, false, NOW() - INTERVAL '1 week')

ON CONFLICT (student_id, simulation_id) DO NOTHING;

-- Sample assignments
INSERT INTO student_assignments (student_id, simulation_id, title, instructions, due_date, status, score, max_score) VALUES
('11111111-1111-1111-1111-111111111111', (SELECT id FROM stem_simulations_catalog WHERE simulation_name = 'pendulum-lab'), 'Explore Pendulum Motion', 'Complete the pendulum simulation and answer the reflection questions about period and frequency.', CURRENT_DATE + INTERVAL '5 days', 'in_progress', 8.5, 10.0),
('11111111-1111-1111-1111-111111111111', (SELECT id FROM stem_simulations_catalog WHERE simulation_name = 'build-a-molecule'), 'Molecular Bonding Lab', 'Build 5 different molecules and explain their bonding patterns.', CURRENT_DATE + INTERVAL '3 days', 'completed', 9.0, 10.0),
('11111111-1111-1111-1111-111111111111', (SELECT id FROM stem_simulations_catalog WHERE simulation_name = 'circuit-construction-kit'), 'Basic Circuit Analysis', 'Create three different circuits and measure voltage and current.', CURRENT_DATE + INTERVAL '7 days', 'pending', NULL, 10.0);

-- Sample achievements
INSERT INTO student_achievements (student_id, title, description, icon, category, points) VALUES
('11111111-1111-1111-1111-111111111111', 'First Steps in Chemistry', 'Completed your first chemistry simulation', '🧪', 'Chemistry', 10),
('11111111-1111-1111-1111-111111111111', 'Physics Explorer', 'Spent 1 hour exploring physics simulations', '⚡', 'Physics', 20),
('11111111-1111-1111-1111-111111111111', 'Molecule Master', 'Built 10 different molecules', '⚗️', 'Chemistry', 25),
('11111111-1111-1111-1111-111111111111', 'Circuit Champion', 'Completed all basic circuit challenges', '🔌', 'Physics', 30),
('11111111-1111-1111-1111-111111111111', 'STEM Starter', 'Completed your first simulation', '🌟', 'General', 5);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_student_assignments_updated_at 
    BEFORE UPDATE ON student_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE student_simulation_progress IS 'Tracks individual student progress through STEM simulations';
COMMENT ON TABLE student_assignments IS 'Manages assignments given to students for specific simulations';
COMMENT ON TABLE student_achievements IS 'Gamification system for student accomplishments and milestones';