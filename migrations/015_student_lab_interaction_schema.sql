-- Student Lab Interaction Schema
-- Phase 2: StudentLabInteraction module database tables

-- Lab Sessions Table
CREATE TABLE IF NOT EXISTS lab_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID REFERENCES lms_labs(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lab_id, student_id, start_time) -- Allow multiple sessions but prevent duplicate start times
);

-- Lab Submissions Table
CREATE TABLE IF NOT EXISTS lab_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES lab_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    responses JSONB,
    autosave_data JSONB,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id) -- One submission per session
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lab_sessions_lab_id ON lab_sessions(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_sessions_student_id ON lab_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_lab_sessions_status ON lab_sessions(status);
CREATE INDEX IF NOT EXISTS idx_lab_sessions_start_time ON lab_sessions(start_time);

CREATE INDEX IF NOT EXISTS idx_lab_submissions_session_id ON lab_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_lab_submissions_student_id ON lab_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_lab_submissions_submitted_at ON lab_submissions(submitted_at);

-- Add triggers for updated_at columns
CREATE TRIGGER update_lab_sessions_updated_at 
    BEFORE UPDATE ON lab_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_submissions_updated_at 
    BEFORE UPDATE ON lab_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for session analytics
CREATE OR REPLACE VIEW lab_session_analytics AS
SELECT 
    ls.id as session_id,
    ls.lab_id,
    ls.student_id,
    u.name as student_name,
    l.title as lab_title,
    l.subject,
    l.grade,
    ls.start_time,
    ls.end_time,
    ls.duration_minutes,
    ls.status as session_status,
    lsub.responses,
    lsub.submitted_at,
    CASE 
        WHEN ls.status = 'submitted' THEN 'completed'
        WHEN ls.end_time IS NULL THEN 'active'
        ELSE 'incomplete'
    END as completion_status,
    EXTRACT(EPOCH FROM (COALESCE(ls.end_time, NOW()) - ls.start_time)) / 60 as actual_duration_minutes
FROM lab_sessions ls
LEFT JOIN users u ON ls.student_id = u.id
LEFT JOIN lms_labs l ON ls.lab_id = l.id
LEFT JOIN lab_submissions lsub ON ls.id = lsub.session_id;

COMMENT ON VIEW lab_session_analytics IS 'Comprehensive view of lab sessions with student and lab information for analytics';

-- Create function to automatically calculate duration on session end
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
        NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to calculate duration automatically
CREATE TRIGGER calculate_session_duration_trigger
    BEFORE UPDATE ON lab_sessions
    FOR EACH ROW
    EXECUTE FUNCTION calculate_session_duration();