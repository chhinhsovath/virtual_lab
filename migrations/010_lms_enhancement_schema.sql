-- LMS Enhancement Schema
-- Comprehensive user management system with student, parent, and course management

BEGIN;

-- Extend users table for LMS features
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id BIGINT REFERENCES tbl_tarl_student(student_id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS academic_status VARCHAR(20) DEFAULT 'active' CHECK (academic_status IN ('active', 'inactive', 'suspended', 'graduated'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS enrollment_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS graduation_date DATE;

-- Create courses/classes table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  subject VARCHAR(100) NOT NULL,
  grade_level VARCHAR(20) NOT NULL,
  school_id INTEGER NOT NULL REFERENCES tbl_tarl_school(school_id),
  teacher_id UUID REFERENCES users(id),
  assistant_teacher_ids UUID[],
  max_students INTEGER DEFAULT 30,
  academic_year VARCHAR(10) NOT NULL,
  semester VARCHAR(20) DEFAULT 'full_year',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  schedule JSONB DEFAULT '{}', -- Store class schedule
  room_number VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

-- Create student enrollments table
CREATE TABLE IF NOT EXISTS student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completion_date DATE,
  status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped', 'pending', 'transferred')),
  final_grade VARCHAR(10),
  grade_points DECIMAL(3,2),
  attendance_percentage DECIMAL(5,2),
  notes TEXT,
  enrolled_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id)
);

-- Create parent-student relationships table
CREATE TABLE IF NOT EXISTS parent_student_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES users(id),
  student_id UUID NOT NULL REFERENCES users(id),
  relationship_type VARCHAR(30) NOT NULL CHECK (relationship_type IN ('parent', 'guardian', 'emergency_contact', 'step_parent', 'grandparent', 'foster_parent')),
  is_primary_contact BOOLEAN DEFAULT false,
  can_pickup BOOLEAN DEFAULT true,
  can_receive_reports BOOLEAN DEFAULT true,
  emergency_contact_priority INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  UNIQUE(parent_id, student_id)
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assignment_type VARCHAR(50) NOT NULL CHECK (assignment_type IN ('homework', 'quiz', 'test', 'project', 'presentation', 'lab', 'essay')),
  total_points DECIMAL(6,2) NOT NULL DEFAULT 100.00,
  due_date TIMESTAMP,
  submit_date TIMESTAMP,
  allow_late_submission BOOLEAN DEFAULT true,
  late_penalty_percentage DECIMAL(5,2) DEFAULT 0.00,
  instructions TEXT,
  attachments JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'graded')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Create assignment submissions table
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id),
  student_id UUID NOT NULL REFERENCES users(id),
  submission_text TEXT,
  attachments JSONB DEFAULT '[]',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_late BOOLEAN DEFAULT false,
  score DECIMAL(6,2),
  max_score DECIMAL(6,2),
  feedback TEXT,
  graded_at TIMESTAMP,
  graded_by UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'graded', 'returned')),
  attempt_number INTEGER DEFAULT 1,
  UNIQUE(assignment_id, student_id, attempt_number)
);

-- Create grades table
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  assignment_id UUID REFERENCES assignments(id),
  grade_type VARCHAR(30) NOT NULL CHECK (grade_type IN ('assignment', 'quiz', 'test', 'midterm', 'final', 'project', 'participation', 'attendance')),
  score DECIMAL(6,2) NOT NULL,
  max_score DECIMAL(6,2) NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS ((score / max_score) * 100) STORED,
  letter_grade VARCHAR(5),
  grade_date DATE NOT NULL DEFAULT CURRENT_DATE,
  grading_period VARCHAR(20),
  weight DECIMAL(4,2) DEFAULT 1.00,
  comments TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  graded_by UUID NOT NULL REFERENCES users(id)
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  attendance_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused', 'sick', 'family_emergency')),
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  notes TEXT,
  marked_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id, attendance_date)
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  announcement_type VARCHAR(30) NOT NULL CHECK (announcement_type IN ('general', 'urgent', 'academic', 'event', 'reminder', 'policy')),
  target_audience VARCHAR(30) NOT NULL CHECK (target_audience IN ('all', 'students', 'parents', 'teachers', 'staff', 'class_specific')),
  school_id INTEGER REFERENCES tbl_tarl_school(school_id),
  course_id UUID REFERENCES courses(id),
  priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  published_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_published BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]',
  read_receipt_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Create announcement reads table (for tracking who read announcements)
CREATE TABLE IF NOT EXISTS announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id),
  user_id UUID NOT NULL REFERENCES users(id),
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(announcement_id, user_id)
);

-- Create communication/messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID NOT NULL REFERENCES users(id),
  subject VARCHAR(255),
  content TEXT NOT NULL,
  message_type VARCHAR(30) DEFAULT 'personal' CHECK (message_type IN ('personal', 'academic', 'administrative', 'disciplinary', 'parent_teacher')),
  priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  attachments JSONB DEFAULT '[]',
  parent_message_id UUID REFERENCES messages(id), -- For threaded conversations
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create academic periods/terms table
CREATE TABLE IF NOT EXISTS academic_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  academic_year VARCHAR(10) NOT NULL,
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('semester', 'quarter', 'trimester', 'year')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  school_id INTEGER NOT NULL REFERENCES tbl_tarl_school(school_id),
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create class schedules table
CREATE TABLE IF NOT EXISTS class_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1 = Monday, 7 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number VARCHAR(50),
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create content/materials table
CREATE TABLE IF NOT EXISTS course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('document', 'video', 'audio', 'presentation', 'link', 'quiz', 'assignment')),
  file_url TEXT,
  file_size BIGINT,
  mime_type VARCHAR(100),
  is_required BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  access_level VARCHAR(20) DEFAULT 'enrolled' CHECK (access_level IN ('public', 'enrolled', 'restricted')),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_parent_id ON users(parent_id);
CREATE INDEX IF NOT EXISTS idx_users_academic_status ON users(academic_status);
CREATE INDEX IF NOT EXISTS idx_users_enrollment_date ON users(enrollment_date);

CREATE INDEX IF NOT EXISTS idx_courses_school_id ON courses(school_id);
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_academic_year ON courses(academic_year);

CREATE INDEX IF NOT EXISTS idx_student_enrollments_student_id ON student_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_course_id ON student_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_status ON student_enrollments(status);

CREATE INDEX IF NOT EXISTS idx_parent_student_relationships_parent_id ON parent_student_relationships(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_relationships_student_id ON parent_student_relationships(student_id);

CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON assignment_submissions(student_id);

CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_course_id ON grades(course_id);
CREATE INDEX IF NOT EXISTS idx_grades_assignment_id ON grades(assignment_id);
CREATE INDEX IF NOT EXISTS idx_grades_grade_date ON grades(grade_date);

CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_course_id ON attendance(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);

CREATE INDEX IF NOT EXISTS idx_announcements_school_id ON announcements(school_id);
CREATE INDEX IF NOT EXISTS idx_announcements_course_id ON announcements(course_id);
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON announcements(published_at);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_class_schedules_course_id ON class_schedules(course_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_day_time ON class_schedules(day_of_week, start_time);

CREATE INDEX IF NOT EXISTS idx_course_materials_course_id ON course_materials(course_id);

-- Insert additional permissions for LMS features
INSERT INTO permissions (name, resource, action, description) VALUES 
-- Student-specific permissions
('student.view_own_profile', 'student', 'view_own_profile', 'View own student profile'),
('student.update_own_profile', 'student', 'update_own_profile', 'Update own student profile'),
('student.view_own_grades', 'student', 'view_own_grades', 'View own grades'),
('student.view_own_attendance', 'student', 'view_own_attendance', 'View own attendance'),
('student.view_own_assignments', 'student', 'view_own_assignments', 'View own assignments'),
('student.submit_assignments', 'student', 'submit_assignments', 'Submit assignments'),
('student.view_course_content', 'student', 'view_course_content', 'View course content'),

-- Parent-specific permissions
('parent.view_child_profile', 'parent', 'view_child_profile', 'View child profile'),
('parent.view_child_grades', 'parent', 'view_child_grades', 'View child grades'),
('parent.view_child_attendance', 'parent', 'view_child_attendance', 'View child attendance'),
('parent.view_child_assignments', 'parent', 'view_child_assignments', 'View child assignments'),
('parent.communicate_teachers', 'parent', 'communicate_teachers', 'Communicate with teachers'),
('parent.view_school_announcements', 'parent', 'view_school_announcements', 'View school announcements'),

-- Course management permissions
('courses.create', 'courses', 'create', 'Create new courses'),
('courses.read', 'courses', 'read', 'View course information'),
('courses.update', 'courses', 'update', 'Update course information'),
('courses.delete', 'courses', 'delete', 'Delete courses'),
('courses.manage_enrollment', 'courses', 'manage_enrollment', 'Manage student enrollment'),
('courses.manage_content', 'courses', 'manage_content', 'Manage course content'),
('courses.publish', 'courses', 'publish', 'Publish courses'),

-- Content management permissions
('content.create', 'content', 'create', 'Create course content'),
('content.read', 'content', 'read', 'View course content'),
('content.update', 'content', 'update', 'Update course content'),
('content.delete', 'content', 'delete', 'Delete course content'),
('content.publish', 'content', 'publish', 'Publish course content'),
('content.manage_versions', 'content', 'manage_versions', 'Manage content versions'),

-- Grade management permissions
('grades.create', 'grades', 'create', 'Create grade entries'),
('grades.read', 'grades', 'read', 'View grades'),
('grades.update', 'grades', 'update', 'Update grades'),
('grades.delete', 'grades', 'delete', 'Delete grades'),
('grades.export', 'grades', 'export', 'Export grade data'),
('grades.publish', 'grades', 'publish', 'Publish grades to students'),

-- Attendance management permissions
('attendance.create', 'attendance', 'create', 'Record attendance'),
('attendance.read', 'attendance', 'read', 'View attendance records'),
('attendance.update', 'attendance', 'update', 'Update attendance records'),
('attendance.delete', 'attendance', 'delete', 'Delete attendance records'),
('attendance.export', 'attendance', 'export', 'Export attendance data'),

-- Communication permissions
('communication.send_message', 'communication', 'send_message', 'Send messages'),
('communication.read_message', 'communication', 'read_message', 'Read messages'),
('communication.send_announcement', 'communication', 'send_announcement', 'Send announcements'),
('communication.manage_notifications', 'communication', 'manage_notifications', 'Manage notifications'),

-- Page access permissions for LMS
('pages.student_portal', 'pages', 'student_portal', 'Access student portal'),
('pages.parent_portal', 'pages', 'parent_portal', 'Access parent portal'),
('pages.course_management', 'pages', 'course_management', 'Access course management'),
('pages.content_management', 'pages', 'content_management', 'Access content management'),
('pages.grade_book', 'pages', 'grade_book', 'Access grade book'),
('pages.attendance', 'pages', 'attendance', 'Access attendance management'),
('pages.communication', 'pages', 'communication', 'Access communication tools')

ON CONFLICT (name) DO NOTHING;

-- Insert new roles
INSERT INTO roles (name, display_name, description) VALUES 
('student', 'Student', 'Student with access to own academic information'),
('parent', 'Parent', 'Parent with access to child academic information'),
('guardian', 'Guardian', 'Guardian with access to ward academic information'),
('assistant_teacher', 'Assistant Teacher', 'Teaching assistant with limited classroom access'),
('principal', 'Principal', 'School principal with administrative access'),
('librarian', 'Librarian', 'Library staff with resource management access'),
('counselor', 'Counselor', 'School counselor with student guidance access')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to new roles
WITH role_permission_mapping AS (
  SELECT 
    r.id as role_id,
    p.id as permission_id
  FROM roles r
  CROSS JOIN permissions p
  WHERE 
    -- Student permissions
    (r.name = 'student' AND p.name IN (
      'student.view_own_profile', 'student.update_own_profile', 'student.view_own_grades',
      'student.view_own_attendance', 'student.view_own_assignments', 'student.submit_assignments',
      'student.view_course_content', 'pages.student_portal', 'communication.read_message',
      'communication.send_message'
    )) OR
    
    -- Parent permissions
    (r.name = 'parent' AND p.name IN (
      'parent.view_child_profile', 'parent.view_child_grades', 'parent.view_child_attendance',
      'parent.view_child_assignments', 'parent.communicate_teachers', 'parent.view_school_announcements',
      'pages.parent_portal', 'communication.read_message', 'communication.send_message'
    )) OR
    
    -- Guardian permissions (same as parent)
    (r.name = 'guardian' AND p.name IN (
      'parent.view_child_profile', 'parent.view_child_grades', 'parent.view_child_attendance',
      'parent.view_child_assignments', 'parent.communicate_teachers', 'parent.view_school_announcements',
      'pages.parent_portal', 'communication.read_message', 'communication.send_message'
    )) OR
    
    -- Assistant Teacher permissions
    (r.name = 'assistant_teacher' AND p.name IN (
      'courses.read', 'content.read', 'grades.read', 'attendance.create', 'attendance.read',
      'attendance.update', 'students.read', 'communication.read_message', 'communication.send_message',
      'pages.grade_book', 'pages.attendance'
    )) OR
    
    -- Principal permissions (most permissions except system admin)
    (r.name = 'principal' AND p.name NOT IN (
      'system.backup', 'system.restore', 'system.maintenance', 'users.create', 'users.delete',
      'roles.create', 'roles.delete', 'roles.manage_permissions'
    )) OR
    
    -- Librarian permissions
    (r.name = 'librarian' AND p.name IN (
      'content.create', 'content.read', 'content.update', 'content.manage_versions',
      'courses.read', 'students.read', 'pages.content_management'
    )) OR
    
    -- Counselor permissions
    (r.name = 'counselor' AND p.name IN (
      'students.read', 'students.update', 'communication.send_message', 'communication.read_message',
      'reports.read', 'grades.read', 'attendance.read'
    ))
)
INSERT INTO role_permissions (role_id, permission_id)
SELECT role_id, permission_id FROM role_permission_mapping
ON CONFLICT (role_id, permission_id) DO NOTHING;

COMMIT;

-- Add table comments
COMMENT ON TABLE courses IS 'Course/class definitions with teacher assignments';
COMMENT ON TABLE student_enrollments IS 'Student enrollments in courses';
COMMENT ON TABLE parent_student_relationships IS 'Parent-student relationship mapping';
COMMENT ON TABLE assignments IS 'Course assignments and tasks';
COMMENT ON TABLE assignment_submissions IS 'Student submissions for assignments';
COMMENT ON TABLE grades IS 'Student grades and scores';
COMMENT ON TABLE attendance IS 'Student attendance records';
COMMENT ON TABLE announcements IS 'School and class announcements';
COMMENT ON TABLE messages IS 'Communication between users';
COMMENT ON TABLE academic_periods IS 'Academic periods/terms configuration';
COMMENT ON TABLE class_schedules IS 'Weekly class schedules';
COMMENT ON TABLE course_materials IS 'Course content and materials';