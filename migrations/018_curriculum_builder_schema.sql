-- Curriculum Builder Schema
-- Phase 5: CurriculumBuilder module database tables

-- Main curriculums table
CREATE TABLE IF NOT EXISTS curriculums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    academic_year VARCHAR(20) NOT NULL,
    subject VARCHAR(100),
    grade VARCHAR(20),
    course_id UUID REFERENCES lms_courses(id) ON DELETE CASCADE,
    
    -- Timeline configuration
    total_weeks INTEGER DEFAULT 36, -- Standard academic year
    start_date DATE,
    end_date DATE,
    
    -- Curriculum metadata
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'archived'
    tags JSONB DEFAULT '[]', -- Subject tags, difficulty levels, etc.
    
    -- Sharing and collaboration
    is_public BOOLEAN DEFAULT false,
    shared_with JSONB DEFAULT '[]', -- Array of user IDs who can view/edit
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Labs assigned to curriculum timeline
CREATE TABLE IF NOT EXISTS curriculum_labs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curriculum_id UUID REFERENCES curriculums(id) ON DELETE CASCADE,
    lab_id UUID REFERENCES lms_labs(id) ON DELETE CASCADE,
    
    -- Timeline positioning
    week_number INTEGER NOT NULL,
    order_in_week INTEGER DEFAULT 1, -- Multiple labs per week
    
    -- Duration and timing
    estimated_duration_minutes INTEGER,
    is_required BOOLEAN DEFAULT true,
    due_date_offset INTEGER DEFAULT 7, -- Days from week start
    
    -- Lab-specific curriculum notes
    teacher_notes TEXT,
    learning_objectives TEXT,
    prerequisites TEXT,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'planned', -- 'planned', 'active', 'completed', 'skipped'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(curriculum_id, lab_id) -- Prevent duplicate labs in same curriculum
);

-- Skills and competencies framework
CREATE TABLE IF NOT EXISTS lab_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_name VARCHAR(100) NOT NULL UNIQUE,
    skill_category VARCHAR(50) NOT NULL, -- 'measurement', 'analysis', 'graphing', 'calculation', etc.
    skill_description TEXT,
    skill_level VARCHAR(20) DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
    
    -- Skill progression
    prerequisite_skills JSONB DEFAULT '[]', -- Array of skill IDs
    related_subjects JSONB DEFAULT '[]', -- Array of subject names
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Labs tagged with skills
CREATE TABLE IF NOT EXISTS lab_skill_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID REFERENCES lms_labs(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES lab_skills(id) ON DELETE CASCADE,
    
    -- Skill assessment level in this lab
    skill_weight DECIMAL(3,2) DEFAULT 1.0, -- How heavily this skill is emphasized (0.1-1.0)
    skill_assessment_type VARCHAR(50) DEFAULT 'practice', -- 'practice', 'assessment', 'mastery'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(lab_id, skill_id)
);

-- Curriculum templates for quick setup
CREATE TABLE IF NOT EXISTS curriculum_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(200) NOT NULL,
    template_description TEXT,
    subject VARCHAR(100) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    
    -- Template structure
    template_data JSONB NOT NULL, -- Serialized curriculum structure
    weekly_structure JSONB, -- Default weekly patterns
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    
    -- Template metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT true,
    tags JSONB DEFAULT '[]',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Curriculum sharing and collaboration
CREATE TABLE IF NOT EXISTS curriculum_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curriculum_id UUID REFERENCES curriculums(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Permission levels
    permission_level VARCHAR(20) DEFAULT 'view', -- 'view', 'edit', 'admin'
    can_modify_timeline BOOLEAN DEFAULT false,
    can_add_labs BOOLEAN DEFAULT false,
    can_share BOOLEAN DEFAULT false,
    
    -- Collaboration metadata
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    
    UNIQUE(curriculum_id, user_id)
);

-- Curriculum progress tracking
CREATE TABLE IF NOT EXISTS curriculum_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curriculum_id UUID REFERENCES curriculums(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Progress metrics
    total_labs_assigned INTEGER DEFAULT 0,
    labs_completed INTEGER DEFAULT 0,
    labs_in_progress INTEGER DEFAULT 0,
    current_week INTEGER DEFAULT 1,
    
    -- Performance tracking
    average_score DECIMAL(5,2),
    skills_mastered JSONB DEFAULT '[]', -- Array of skill IDs
    skills_in_progress JSONB DEFAULT '[]',
    
    -- Timeline tracking
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_completion_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(curriculum_id, student_id)
);

-- Enhanced view for curriculum overview
CREATE OR REPLACE VIEW curriculum_overview AS
SELECT 
    c.id as curriculum_id,
    c.name as curriculum_name,
    c.description,
    c.academic_year,
    c.subject,
    c.grade,
    c.total_weeks,
    c.start_date,
    c.end_date,
    c.status,
    c.is_public,
    creator.name as created_by_name,
    course.name as course_name,
    
    -- Lab statistics
    COUNT(DISTINCT cl.lab_id) as total_labs,
    COUNT(DISTINCT CASE WHEN cl.is_required = true THEN cl.lab_id END) as required_labs,
    COUNT(DISTINCT CASE WHEN cl.status = 'completed' THEN cl.lab_id END) as completed_labs,
    
    -- Week coverage
    MIN(cl.week_number) as first_week_with_labs,
    MAX(cl.week_number) as last_week_with_labs,
    COUNT(DISTINCT cl.week_number) as weeks_with_content,
    
    -- Skill coverage
    COUNT(DISTINCT lst.skill_id) as total_skills_covered,
    
    -- Collaboration
    COUNT(DISTINCT cc.user_id) as collaborator_count,
    
    -- Progress (if student data exists)
    AVG(cp.labs_completed::DECIMAL / NULLIF(cp.total_labs_assigned, 0)) * 100 as avg_completion_percentage,
    COUNT(DISTINCT cp.student_id) as enrolled_students,
    
    c.created_at,
    c.updated_at
    
FROM curriculums c
LEFT JOIN users creator ON c.created_by = creator.id
LEFT JOIN lms_courses course ON c.course_id = course.id
LEFT JOIN curriculum_labs cl ON c.id = cl.curriculum_id
LEFT JOIN lab_skill_tags lst ON cl.lab_id = lst.lab_id
LEFT JOIN curriculum_collaborators cc ON c.id = cc.curriculum_id
LEFT JOIN curriculum_progress cp ON c.id = cp.curriculum_id
GROUP BY c.id, c.name, c.description, c.academic_year, c.subject, c.grade, 
         c.total_weeks, c.start_date, c.end_date, c.status, c.is_public,
         creator.name, course.name, c.created_at, c.updated_at;

-- View for detailed curriculum timeline
CREATE OR REPLACE VIEW curriculum_timeline AS
SELECT 
    cl.curriculum_id,
    cl.week_number,
    cl.order_in_week,
    
    -- Lab details
    l.id as lab_id,
    l.title as lab_title,
    l.subject as lab_subject,
    l.grade as lab_grade,
    l.estimated_duration_minutes as lab_duration,
    l.description as lab_description,
    
    -- Curriculum-specific details
    cl.estimated_duration_minutes as curriculum_duration_override,
    cl.is_required,
    cl.due_date_offset,
    cl.teacher_notes,
    cl.learning_objectives,
    cl.prerequisites,
    cl.status as lab_status_in_curriculum,
    
    -- Skill information
    COALESCE(
        JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'skill_id', ls.id,
                'skill_name', ls.skill_name,
                'skill_category', ls.skill_category,
                'skill_level', ls.skill_level,
                'weight', lst.skill_weight,
                'assessment_type', lst.skill_assessment_type
            )
        ) FILTER (WHERE ls.id IS NOT NULL),
        '[]'::json
    ) as skills_covered,
    
    -- Resource information
    l.simulation_url,
    l.worksheet_url,
    l.rubric_url,
    
    cl.created_at,
    cl.updated_at
    
FROM curriculum_labs cl
JOIN lms_labs l ON cl.lab_id = l.id
LEFT JOIN lab_skill_tags lst ON l.id = lst.lab_id
LEFT JOIN lab_skills ls ON lst.skill_id = ls.id
GROUP BY cl.curriculum_id, cl.week_number, cl.order_in_week, cl.id,
         l.id, l.title, l.subject, l.grade, l.estimated_duration_minutes, l.description,
         cl.estimated_duration_minutes, cl.is_required, cl.due_date_offset,
         cl.teacher_notes, cl.learning_objectives, cl.prerequisites, cl.status,
         l.simulation_url, l.worksheet_url, l.rubric_url, cl.created_at, cl.updated_at
ORDER BY cl.week_number, cl.order_in_week;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_curriculums_created_by ON curriculums(created_by);
CREATE INDEX IF NOT EXISTS idx_curriculums_academic_year ON curriculums(academic_year);
CREATE INDEX IF NOT EXISTS idx_curriculums_subject_grade ON curriculums(subject, grade);
CREATE INDEX IF NOT EXISTS idx_curriculums_status ON curriculums(status);
CREATE INDEX IF NOT EXISTS idx_curriculums_course_id ON curriculums(course_id);

CREATE INDEX IF NOT EXISTS idx_curriculum_labs_curriculum_id ON curriculum_labs(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_labs_lab_id ON curriculum_labs(lab_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_labs_week_number ON curriculum_labs(week_number);
CREATE INDEX IF NOT EXISTS idx_curriculum_labs_status ON curriculum_labs(status);

CREATE INDEX IF NOT EXISTS idx_lab_skills_category ON lab_skills(skill_category);
CREATE INDEX IF NOT EXISTS idx_lab_skills_level ON lab_skills(skill_level);

CREATE INDEX IF NOT EXISTS idx_lab_skill_tags_lab_id ON lab_skill_tags(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_skill_tags_skill_id ON lab_skill_tags(skill_id);

CREATE INDEX IF NOT EXISTS idx_curriculum_collaborators_curriculum_id ON curriculum_collaborators(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_collaborators_user_id ON curriculum_collaborators(user_id);

CREATE INDEX IF NOT EXISTS idx_curriculum_progress_curriculum_id ON curriculum_progress(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_progress_student_id ON curriculum_progress(student_id);

-- Triggers for updated_at columns
CREATE TRIGGER update_curriculums_updated_at 
    BEFORE UPDATE ON curriculums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculum_labs_updated_at 
    BEFORE UPDATE ON curriculum_labs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculum_templates_updated_at 
    BEFORE UPDATE ON curriculum_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculum_progress_updated_at 
    BEFORE UPDATE ON curriculum_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize curriculum progress for enrolled students
CREATE OR REPLACE FUNCTION initialize_curriculum_progress(p_curriculum_id UUID, p_course_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    student_record RECORD;
    lab_count INTEGER;
BEGIN
    -- Get lab count for this curriculum
    SELECT COUNT(*) INTO lab_count 
    FROM curriculum_labs 
    WHERE curriculum_id = p_curriculum_id;
    
    -- Get students to initialize (either from course or all students)
    FOR student_record IN 
        SELECT DISTINCT u.id as student_id
        FROM users u
        LEFT JOIN lms_course_enrollments ce ON u.id = ce.student_id
        WHERE u.role = 'student' 
          AND (p_course_id IS NULL OR ce.course_id = p_course_id)
          AND ce.status = 'enrolled'
    LOOP
        -- Insert or update progress record
        INSERT INTO curriculum_progress (
            curriculum_id, 
            student_id, 
            total_labs_assigned
        )
        VALUES (
            p_curriculum_id, 
            student_record.student_id, 
            lab_count
        )
        ON CONFLICT (curriculum_id, student_id)
        DO UPDATE SET 
            total_labs_assigned = lab_count,
            updated_at = CURRENT_TIMESTAMP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate curriculum completion percentage
CREATE OR REPLACE FUNCTION calculate_curriculum_completion(p_curriculum_id UUID, p_student_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_labs INTEGER;
    completed_labs INTEGER;
    completion_percentage DECIMAL(5,2);
BEGIN
    -- Count total required labs in curriculum
    SELECT COUNT(*) INTO total_labs
    FROM curriculum_labs
    WHERE curriculum_id = p_curriculum_id AND is_required = true;
    
    -- Count completed labs by student
    SELECT COUNT(*) INTO completed_labs
    FROM curriculum_labs cl
    JOIN lab_scores ls ON cl.lab_id = ls.lab_id
    WHERE cl.curriculum_id = p_curriculum_id 
      AND ls.student_id = p_student_id
      AND ls.final_score IS NOT NULL
      AND cl.is_required = true;
    
    -- Calculate percentage
    IF total_labs > 0 THEN
        completion_percentage := (completed_labs::DECIMAL / total_labs) * 100;
    ELSE
        completion_percentage := 0;
    END IF;
    
    -- Update progress record
    UPDATE curriculum_progress 
    SET 
        labs_completed = completed_labs,
        total_labs_assigned = total_labs,
        last_activity_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE curriculum_id = p_curriculum_id AND student_id = p_student_id;
    
    RETURN completion_percentage;
END;
$$ LANGUAGE plpgsql;

-- Insert default skills
INSERT INTO lab_skills (skill_name, skill_category, skill_description, skill_level) VALUES
('Data Collection', 'measurement', 'Ability to gather and record experimental data accurately', 'beginner'),
('Graph Creation', 'graphing', 'Creating various types of graphs and charts', 'beginner'),
('Graph Interpretation', 'graphing', 'Reading and analyzing data from graphs', 'intermediate'),
('Mathematical Calculation', 'calculation', 'Performing calculations related to experimental results', 'beginner'),
('Hypothesis Formation', 'analysis', 'Developing testable hypotheses based on observations', 'intermediate'),
('Variable Identification', 'analysis', 'Identifying independent and dependent variables', 'beginner'),
('Pattern Recognition', 'analysis', 'Identifying trends and patterns in data', 'intermediate'),
('Scientific Reasoning', 'analysis', 'Drawing logical conclusions from experimental evidence', 'advanced'),
('Unit Conversion', 'calculation', 'Converting between different units of measurement', 'beginner'),
('Statistical Analysis', 'calculation', 'Basic statistical analysis of experimental data', 'advanced'),
('Measurement Precision', 'measurement', 'Understanding and applying measurement precision', 'intermediate'),
('Error Analysis', 'analysis', 'Identifying and analyzing sources of experimental error', 'advanced')
ON CONFLICT (skill_name) DO NOTHING;

COMMENT ON TABLE curriculums IS 'Main curriculum plans with timeline structure';
COMMENT ON TABLE curriculum_labs IS 'Labs assigned to specific weeks in curriculum timeline';
COMMENT ON TABLE lab_skills IS 'Skills and competencies framework for lab activities';
COMMENT ON TABLE lab_skill_tags IS 'Tags linking labs to specific skills they develop';
COMMENT ON TABLE curriculum_templates IS 'Reusable curriculum templates for quick setup';
COMMENT ON TABLE curriculum_collaborators IS 'Sharing and collaboration permissions for curricula';
COMMENT ON TABLE curriculum_progress IS 'Student progress tracking through curriculum timelines';
COMMENT ON FUNCTION initialize_curriculum_progress IS 'Initializes progress tracking for students in a curriculum';
COMMENT ON FUNCTION calculate_curriculum_completion IS 'Calculates completion percentage for a student in a curriculum';