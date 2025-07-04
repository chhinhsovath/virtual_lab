-- VirtualLab LMS Comprehensive Schema
-- This migration creates all tables for the Virtual Lab Learning Management System

-- 1. Enhanced Roles Table (extending existing roles)
CREATE TABLE IF NOT EXISTS lms_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert all roles
INSERT INTO lms_roles (name, display_name, description, is_system) VALUES
('super_admin', 'Super Admin', 'Full system access and configuration', true),
('admin', 'Admin', 'Administrative access to assigned resources', true),
('teacher', 'Teacher', 'Can create and manage courses, assignments, and assessments', true),
('student', 'Student', 'Can access courses, submit assignments, and take assessments', true),
('parent', 'Parent', 'Can view student progress and communications', true),
('guardian', 'Guardian', 'Similar to parent with limited access', true),
('director', 'Director', 'School or program director with oversight capabilities', true),
('partner', 'Partner', 'External partner with specific access rights', true),
('mentor', 'Mentor', 'Can guide and support students', true),
('collector', 'Collector', 'Can collect and manage specific data', true),
('observer', 'Observer', 'Read-only access to specified resources', true),
('qa', 'QA', 'Quality assurance role for content review', true);

-- 2. Resources Table
CREATE TABLE IF NOT EXISTS lms_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO lms_resources (name, display_name) VALUES
('courses', 'Courses'),
('assignments', 'Assignments'),
('labs', 'Labs'),
('assessments', 'Assessments'),
('users', 'Users'),
('submissions', 'Submissions'),
('attendance', 'Attendance'),
('reports', 'Reports');

-- 3. Permissions Table
CREATE TABLE IF NOT EXISTS lms_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID REFERENCES lms_resources(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete', 'submit', 'approve', 'export')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resource_id, action)
);

-- 4. Role Permissions Mapping
CREATE TABLE IF NOT EXISTS lms_role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES lms_roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES lms_permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- 5. Enhanced Users Table (extending existing users table)
ALTER TABLE users ADD COLUMN IF NOT EXISTS lms_role_id UUID REFERENCES lms_roles(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'en';
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- 6. Courses Table
CREATE TABLE IF NOT EXISTS lms_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    title_km VARCHAR(200),
    description TEXT,
    description_km TEXT,
    credits INTEGER DEFAULT 0,
    duration_weeks INTEGER,
    start_date DATE,
    end_date DATE,
    max_students INTEGER,
    created_by UUID REFERENCES users(id),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Course Schedule Table
CREATE TABLE IF NOT EXISTS lms_course_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES lms_courses(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    instructor_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Course Enrollments
CREATE TABLE IF NOT EXISTS lms_course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES lms_courses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped', 'pending')),
    grade VARCHAR(5),
    completion_date TIMESTAMP,
    UNIQUE(course_id, student_id)
);

-- 9. Labs Table
CREATE TABLE IF NOT EXISTS lms_labs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES lms_courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    title_km VARCHAR(200),
    description TEXT,
    description_km TEXT,
    simulation_url TEXT,
    version VARCHAR(20) DEFAULT '1.0',
    duration_minutes INTEGER,
    max_attempts INTEGER DEFAULT 3,
    created_by UUID REFERENCES users(id),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Lab Resources Table
CREATE TABLE IF NOT EXISTS lms_lab_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID REFERENCES lms_labs(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) CHECK (resource_type IN ('worksheet', 'rubric', 'manual', 'simulation', 'video', 'document')),
    title VARCHAR(200) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Lab Versions (for version control)
CREATE TABLE IF NOT EXISTS lms_lab_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID REFERENCES lms_labs(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    change_description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lab_data JSONB NOT NULL
);

-- 12. Assignments Table
CREATE TABLE IF NOT EXISTS lms_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES lms_courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    title_km VARCHAR(200),
    description TEXT,
    description_km TEXT,
    instructions TEXT,
    instructions_km TEXT,
    assignment_type VARCHAR(50) CHECK (assignment_type IN ('homework', 'project', 'quiz', 'exam', 'lab_report')),
    total_points DECIMAL(5,2),
    due_date TIMESTAMP,
    available_from TIMESTAMP,
    available_until TIMESTAMP,
    allow_late_submission BOOLEAN DEFAULT true,
    late_penalty_percent INTEGER DEFAULT 10,
    created_by UUID REFERENCES users(id),
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Assignment Rubrics
CREATE TABLE IF NOT EXISTS lms_rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES lms_assignments(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Rubric Criteria
CREATE TABLE IF NOT EXISTS lms_rubric_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rubric_id UUID REFERENCES lms_rubrics(id) ON DELETE CASCADE,
    criterion VARCHAR(200) NOT NULL,
    description TEXT,
    max_points DECIMAL(5,2),
    order_index INTEGER,
    bloom_level VARCHAR(20) CHECK (bloom_level IN ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Student Submissions
CREATE TABLE IF NOT EXISTS lms_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES lms_assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    submission_text TEXT,
    submission_data JSONB,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'graded', 'returned')),
    submitted_at TIMESTAMP,
    is_late BOOLEAN DEFAULT false,
    score DECIMAL(5,2),
    feedback TEXT,
    graded_by UUID REFERENCES users(id),
    graded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, student_id)
);

-- 16. Submission Files
CREATE TABLE IF NOT EXISTS lms_submission_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES lms_submissions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. Student Lab Activities
CREATE TABLE IF NOT EXISTS lms_student_lab_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID REFERENCES lms_labs(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_enrollment_id UUID REFERENCES lms_course_enrollments(id) ON DELETE CASCADE,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    worksheet_answers JSONB,
    simulation_data JSONB,
    score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded', 'overdue')),
    attempt_number INTEGER DEFAULT 1,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Activity Tracking (detailed tracking)
CREATE TABLE IF NOT EXISTS lms_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    duration_seconds INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. Attendance Records
CREATE TABLE IF NOT EXISTS lms_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_schedule_id UUID REFERENCES lms_course_schedules(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('present', 'absent', 'late', 'excused')),
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_schedule_id, student_id, date)
);

-- 20. Messages Table
CREATE TABLE IF NOT EXISTS lms_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES lms_courses(id) ON DELETE CASCADE,
    subject VARCHAR(200),
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    parent_message_id UUID REFERENCES lms_messages(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 21. Announcements
CREATE TABLE IF NOT EXISTS lms_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    title_km VARCHAR(200),
    content TEXT NOT NULL,
    content_km TEXT,
    announcement_type VARCHAR(50) CHECK (announcement_type IN ('system', 'course', 'general')),
    course_id UUID REFERENCES lms_courses(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    is_published BOOLEAN DEFAULT true,
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expire_date TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 22. Student Progress Tracking
CREATE TABLE IF NOT EXISTS lms_student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES lms_courses(id) ON DELETE CASCADE,
    total_assignments INTEGER DEFAULT 0,
    completed_assignments INTEGER DEFAULT 0,
    total_labs INTEGER DEFAULT 0,
    completed_labs INTEGER DEFAULT 0,
    average_score DECIMAL(5,2),
    time_spent_minutes INTEGER DEFAULT 0,
    last_activity TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

-- 23. Parent-Student Relationships
CREATE TABLE IF NOT EXISTS lms_parent_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) CHECK (relationship_type IN ('parent', 'guardian', 'other')),
    is_primary_contact BOOLEAN DEFAULT false,
    can_view_grades BOOLEAN DEFAULT true,
    can_view_attendance BOOLEAN DEFAULT true,
    can_communicate BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_id, student_id)
);

-- Create indexes for performance
CREATE INDEX idx_course_enrollments_student ON lms_course_enrollments(student_id);
CREATE INDEX idx_course_enrollments_course ON lms_course_enrollments(course_id);
CREATE INDEX idx_submissions_student ON lms_submissions(student_id);
CREATE INDEX idx_submissions_assignment ON lms_submissions(assignment_id);
CREATE INDEX idx_lab_activities_student ON lms_student_lab_activities(student_id);
CREATE INDEX idx_lab_activities_lab ON lms_student_lab_activities(lab_id);
CREATE INDEX idx_activity_logs_user ON lms_activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON lms_activity_logs(created_at);
CREATE INDEX idx_messages_recipient ON lms_messages(recipient_id);
CREATE INDEX idx_attendance_date ON lms_attendance(date);
CREATE INDEX idx_student_progress_student ON lms_student_progress(student_id);

-- Create update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lms_courses_updated_at BEFORE UPDATE ON lms_courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lms_labs_updated_at BEFORE UPDATE ON lms_labs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lms_assignments_updated_at BEFORE UPDATE ON lms_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lms_submissions_updated_at BEFORE UPDATE ON lms_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lms_student_lab_activities_updated_at BEFORE UPDATE ON lms_student_lab_activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lms_student_progress_updated_at BEFORE UPDATE ON lms_student_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();