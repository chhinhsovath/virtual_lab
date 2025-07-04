-- Seed Permissions for VirtualLab LMS
-- This migration populates all permissions and role-permission mappings

-- First, populate all permissions for each resource
DO $$
DECLARE
    r_courses UUID;
    r_assignments UUID;
    r_labs UUID;
    r_assessments UUID;
    r_users UUID;
    r_submissions UUID;
    r_attendance UUID;
    r_reports UUID;
BEGIN
    -- Get resource IDs
    SELECT id INTO r_courses FROM lms_resources WHERE name = 'courses';
    SELECT id INTO r_assignments FROM lms_resources WHERE name = 'assignments';
    SELECT id INTO r_labs FROM lms_resources WHERE name = 'labs';
    SELECT id INTO r_assessments FROM lms_resources WHERE name = 'assessments';
    SELECT id INTO r_users FROM lms_resources WHERE name = 'users';
    SELECT id INTO r_submissions FROM lms_resources WHERE name = 'submissions';
    SELECT id INTO r_attendance FROM lms_resources WHERE name = 'attendance';
    SELECT id INTO r_reports FROM lms_resources WHERE name = 'reports';

    -- Insert permissions for each resource
    -- Courses
    INSERT INTO lms_permissions (resource_id, action) VALUES
    (r_courses, 'create'), (r_courses, 'read'), (r_courses, 'update'), (r_courses, 'delete'), (r_courses, 'export');
    
    -- Assignments
    INSERT INTO lms_permissions (resource_id, action) VALUES
    (r_assignments, 'create'), (r_assignments, 'read'), (r_assignments, 'update'), (r_assignments, 'delete'), (r_assignments, 'submit');
    
    -- Labs
    INSERT INTO lms_permissions (resource_id, action) VALUES
    (r_labs, 'create'), (r_labs, 'read'), (r_labs, 'update'), (r_labs, 'delete'), (r_labs, 'submit');
    
    -- Assessments
    INSERT INTO lms_permissions (resource_id, action) VALUES
    (r_assessments, 'create'), (r_assessments, 'read'), (r_assessments, 'update'), (r_assessments, 'delete'), (r_assessments, 'submit'), (r_assessments, 'approve');
    
    -- Users
    INSERT INTO lms_permissions (resource_id, action) VALUES
    (r_users, 'create'), (r_users, 'read'), (r_users, 'update'), (r_users, 'delete'), (r_users, 'export');
    
    -- Submissions
    INSERT INTO lms_permissions (resource_id, action) VALUES
    (r_submissions, 'create'), (r_submissions, 'read'), (r_submissions, 'update'), (r_submissions, 'delete'), (r_submissions, 'approve');
    
    -- Attendance
    INSERT INTO lms_permissions (resource_id, action) VALUES
    (r_attendance, 'create'), (r_attendance, 'read'), (r_attendance, 'update'), (r_attendance, 'delete'), (r_attendance, 'export');
    
    -- Reports
    INSERT INTO lms_permissions (resource_id, action) VALUES
    (r_reports, 'create'), (r_reports, 'read'), (r_reports, 'export');
END $$;

-- Now assign permissions to roles
DO $$
DECLARE
    role_super_admin UUID;
    role_admin UUID;
    role_teacher UUID;
    role_student UUID;
    role_parent UUID;
    role_guardian UUID;
    role_director UUID;
    role_partner UUID;
    role_mentor UUID;
    role_collector UUID;
    role_observer UUID;
    role_qa UUID;
BEGIN
    -- Get role IDs
    SELECT id INTO role_super_admin FROM lms_roles WHERE name = 'super_admin';
    SELECT id INTO role_admin FROM lms_roles WHERE name = 'admin';
    SELECT id INTO role_teacher FROM lms_roles WHERE name = 'teacher';
    SELECT id INTO role_student FROM lms_roles WHERE name = 'student';
    SELECT id INTO role_parent FROM lms_roles WHERE name = 'parent';
    SELECT id INTO role_guardian FROM lms_roles WHERE name = 'guardian';
    SELECT id INTO role_director FROM lms_roles WHERE name = 'director';
    SELECT id INTO role_partner FROM lms_roles WHERE name = 'partner';
    SELECT id INTO role_mentor FROM lms_roles WHERE name = 'mentor';
    SELECT id INTO role_collector FROM lms_roles WHERE name = 'collector';
    SELECT id INTO role_observer FROM lms_roles WHERE name = 'observer';
    SELECT id INTO role_qa FROM lms_roles WHERE name = 'qa';

    -- Super Admin - Full access to everything
    INSERT INTO lms_role_permissions (role_id, permission_id)
    SELECT role_super_admin, id FROM lms_permissions;

    -- Admin - Full CRUD on most resources, no delete on users
    INSERT INTO lms_role_permissions (role_id, permission_id)
    SELECT role_admin, p.id 
    FROM lms_permissions p
    JOIN lms_resources r ON p.resource_id = r.id
    WHERE NOT (r.name = 'users' AND p.action = 'delete');

    -- Teacher - Create/Read/Update for courses, assignments, labs, assessments, attendance, read for others
    INSERT INTO lms_role_permissions (role_id, permission_id)
    SELECT role_teacher, p.id 
    FROM lms_permissions p
    JOIN lms_resources r ON p.resource_id = r.id
    WHERE (r.name IN ('courses', 'assignments', 'labs', 'assessments', 'attendance', 'submissions') 
           AND p.action IN ('create', 'read', 'update', 'approve'))
       OR (r.name IN ('users', 'reports') AND p.action = 'read')
       OR (r.name = 'reports' AND p.action = 'export');

    -- Student - Read most things, submit assignments/labs
    INSERT INTO lms_role_permissions (role_id, permission_id)
    SELECT role_student, p.id 
    FROM lms_permissions p
    JOIN lms_resources r ON p.resource_id = r.id
    WHERE (r.name IN ('courses', 'assignments', 'labs', 'assessments') AND p.action = 'read')
       OR (r.name IN ('assignments', 'labs', 'assessments') AND p.action = 'submit')
       OR (r.name = 'submissions' AND p.action IN ('create', 'read', 'update'))
       OR (r.name = 'attendance' AND p.action = 'read');

    -- Parent/Guardian - Read access to student data
    INSERT INTO lms_role_permissions (role_id, permission_id)
    SELECT role_parent, p.id 
    FROM lms_permissions p
    JOIN lms_resources r ON p.resource_id = r.id
    WHERE p.action = 'read' 
      AND r.name IN ('courses', 'assignments', 'submissions', 'attendance', 'reports');

    INSERT INTO lms_role_permissions (role_id, permission_id)
    SELECT role_guardian, p.id 
    FROM lms_permissions p
    JOIN lms_resources r ON p.resource_id = r.id
    WHERE p.action = 'read' 
      AND r.name IN ('courses', 'assignments', 'submissions', 'attendance');

    -- Director - Similar to Admin but focused on reports and oversight
    INSERT INTO lms_role_permissions (role_id, permission_id)
    SELECT role_director, p.id 
    FROM lms_permissions p
    JOIN lms_resources r ON p.resource_id = r.id
    WHERE (r.name IN ('reports', 'attendance') AND p.action IN ('create', 'read', 'export'))
       OR (r.name IN ('courses', 'users', 'submissions', 'assessments') AND p.action = 'read')
       OR (r.name = 'users' AND p.action IN ('create', 'update'));

    -- Partner - Limited read access
    INSERT INTO lms_role_permissions (role_id, permission_id)
    SELECT role_partner, p.id 
    FROM lms_permissions p
    JOIN lms_resources r ON p.resource_id = r.id
    WHERE p.action = 'read' 
      AND r.name IN ('courses', 'reports');

    -- Mentor - Can read and provide feedback
    INSERT INTO lms_role_permissions (role_id, permission_id)
    SELECT role_mentor, p.id 
    FROM lms_permissions p
    JOIN lms_resources r ON p.resource_id = r.id
    WHERE (p.action = 'read' AND r.name IN ('courses', 'assignments', 'submissions', 'attendance'))
       OR (r.name = 'submissions' AND p.action = 'update');

    -- Collector - Focus on data collection and export
    INSERT INTO lms_role_permissions (role_id, permission_id)
    SELECT role_collector, p.id 
    FROM lms_permissions p
    JOIN lms_resources r ON p.resource_id = r.id
    WHERE (p.action = 'read' AND r.name IN ('attendance', 'submissions', 'reports'))
       OR (r.name IN ('attendance', 'reports') AND p.action IN ('create', 'export'));

    -- Observer - Read-only access
    INSERT INTO lms_role_permissions (role_id, permission_id)
    SELECT role_observer, p.id 
    FROM lms_permissions p
    WHERE p.action = 'read';

    -- QA - Quality assurance role
    INSERT INTO lms_role_permissions (role_id, permission_id)
    SELECT role_qa, p.id 
    FROM lms_permissions p
    JOIN lms_resources r ON p.resource_id = r.id
    WHERE (p.action = 'read')
       OR (r.name IN ('courses', 'assignments', 'labs', 'assessments') AND p.action = 'update')
       OR (r.name IN ('assessments', 'submissions') AND p.action = 'approve');

END $$;