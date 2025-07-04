-- Lab Analytics Schema
-- Phase 4: LabAnalytics module database enhancements

-- Enhanced analytics view for teacher dashboard
CREATE OR REPLACE VIEW lab_teacher_analytics AS
SELECT 
    l.id as lab_id,
    l.title as lab_title,
    l.subject,
    l.grade,
    l.course_id,
    l.created_at as lab_created_at,
    
    -- Submission statistics
    COUNT(DISTINCT lsess.student_id) as total_students_attempted,
    COUNT(DISTINCT lsub.id) as total_submissions,
    COUNT(DISTINCT CASE WHEN lsub.submitted_at IS NOT NULL THEN lsub.id END) as completed_submissions,
    
    -- Submission rate
    ROUND(
        (COUNT(DISTINCT CASE WHEN lsub.submitted_at IS NOT NULL THEN lsub.id END)::DECIMAL / 
         NULLIF(COUNT(DISTINCT lsess.student_id), 0)) * 100, 
        2
    ) as submission_rate_percentage,
    
    -- Time analytics
    AVG(lsess.duration_minutes) as avg_time_minutes,
    MIN(lsess.duration_minutes) as min_time_minutes,
    MAX(lsess.duration_minutes) as max_time_minutes,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY lsess.duration_minutes) as median_time_minutes,
    
    -- Score analytics
    AVG(ls.final_score) as avg_score,
    MIN(ls.final_score) as min_score,
    MAX(ls.final_score) as max_score,
    STDDEV(ls.final_score) as score_stddev,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ls.final_score) as median_score,
    
    -- Auto vs Manual scoring
    AVG(ls.auto_score) as avg_auto_score,
    AVG(ls.manual_score) as avg_manual_score,
    COUNT(CASE WHEN ls.manual_score IS NOT NULL THEN 1 END) as manual_override_count,
    
    -- Grade distribution
    COUNT(CASE WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 90 THEN 1 END) as grade_a_count,
    COUNT(CASE WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 80 AND (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 < 90 THEN 1 END) as grade_b_count,
    COUNT(CASE WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 70 AND (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 < 80 THEN 1 END) as grade_c_count,
    COUNT(CASE WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 60 AND (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 < 70 THEN 1 END) as grade_d_count,
    COUNT(CASE WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 < 60 THEN 1 END) as grade_f_count,
    
    -- Latest activity
    MAX(lsub.submitted_at) as latest_submission,
    MAX(ls.graded_at) as latest_grading
    
FROM lms_labs l
LEFT JOIN lab_sessions lsess ON l.id = lsess.lab_id
LEFT JOIN lab_submissions lsub ON lsess.id = lsub.session_id
LEFT JOIN lab_scores ls ON l.id = ls.lab_id AND lsub.student_id = ls.student_id
GROUP BY l.id, l.title, l.subject, l.grade, l.course_id, l.created_at;

-- Parent view for student lab performance
CREATE OR REPLACE VIEW lab_parent_view AS
SELECT 
    ls.student_id,
    u.name as student_name,
    l.id as lab_id,
    l.title as lab_title,
    l.subject,
    l.grade,
    l.course_id,
    c.name as course_name,
    
    -- Student performance
    ls.final_score,
    ls.auto_score,
    ls.manual_score,
    ls.teacher_comments,
    ls.graded_at,
    teacher.name as graded_by_name,
    
    -- Session info
    lsess.start_time,
    lsess.end_time,
    lsess.duration_minutes,
    lsess.status as session_status,
    
    -- Submission info
    lsub.submitted_at,
    lsub.responses,
    
    -- Score analysis
    CASE 
        WHEN (SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id) > 0 
        THEN (ls.final_score / (SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id)) * 100
        ELSE NULL 
    END as percentage_score,
    
    CASE 
        WHEN ls.final_score IS NULL THEN 'Not Graded'
        WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 90 THEN 'A'
        WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 80 THEN 'B'
        WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 70 THEN 'C'
        WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 60 THEN 'D'
        ELSE 'F'
    END as letter_grade,
    
    -- Class average for comparison
    (SELECT AVG(final_score) FROM lab_scores WHERE lab_id = l.id) as class_average_score
    
FROM lab_scores ls
JOIN users u ON ls.student_id = u.id
JOIN lms_labs l ON ls.lab_id = l.id
LEFT JOIN lms_courses c ON l.course_id = c.id
LEFT JOIN users teacher ON ls.graded_by = teacher.id
LEFT JOIN lab_submissions lsub ON ls.submission_id = lsub.id
LEFT JOIN lab_sessions lsess ON lsub.session_id = lsess.id;

-- Student progress summary for parent dashboard
CREATE OR REPLACE VIEW student_lab_summary AS
SELECT 
    student_id,
    student_name,
    course_id,
    course_name,
    
    -- Overall performance
    COUNT(lab_id) as total_labs_taken,
    AVG(percentage_score) as avg_percentage,
    AVG(duration_minutes) as avg_time_minutes,
    
    -- Grade distribution
    COUNT(CASE WHEN letter_grade = 'A' THEN 1 END) as grade_a_count,
    COUNT(CASE WHEN letter_grade = 'B' THEN 1 END) as grade_b_count,
    COUNT(CASE WHEN letter_grade = 'C' THEN 1 END) as grade_c_count,
    COUNT(CASE WHEN letter_grade = 'D' THEN 1 END) as grade_d_count,
    COUNT(CASE WHEN letter_grade = 'F' THEN 1 END) as grade_f_count,
    
    -- Recent activity
    MAX(submitted_at) as latest_submission,
    MAX(graded_at) as latest_grading,
    
    -- Improvement tracking
    FIRST_VALUE(percentage_score) OVER (PARTITION BY student_id, course_id ORDER BY submitted_at) as first_score,
    LAST_VALUE(percentage_score) OVER (PARTITION BY student_id, course_id ORDER BY submitted_at RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as latest_score

FROM lab_parent_view
WHERE percentage_score IS NOT NULL
GROUP BY student_id, student_name, course_id, course_name;

-- Lab export data view for CSV/PDF generation
CREATE OR REPLACE VIEW lab_export_data AS
SELECT 
    l.id as lab_id,
    l.title as lab_title,
    l.subject,
    l.grade,
    c.name as course_name,
    
    -- Student info
    u.id as student_id,
    u.name as student_name,
    u.email as student_email,
    
    -- Performance data
    ls.final_score,
    ls.auto_score,
    ls.manual_score,
    
    -- Calculated fields
    CASE 
        WHEN (SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id) > 0 
        THEN (ls.final_score / (SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id)) * 100
        ELSE NULL 
    END as percentage_score,
    
    CASE 
        WHEN ls.final_score IS NULL THEN 'Not Graded'
        WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 90 THEN 'A'
        WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 80 THEN 'B'
        WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 70 THEN 'C'
        WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 60 THEN 'D'
        ELSE 'F'
    END as letter_grade,
    
    -- Time and submission data
    lsess.duration_minutes,
    lsub.submitted_at,
    ls.graded_at,
    ls.teacher_comments,
    teacher.name as graded_by,
    
    -- Session status
    lsess.status as session_status
    
FROM lms_labs l
LEFT JOIN lms_courses c ON l.course_id = c.id
LEFT JOIN lab_scores ls ON l.id = ls.lab_id
LEFT JOIN users u ON ls.student_id = u.id
LEFT JOIN users teacher ON ls.graded_by = teacher.id
LEFT JOIN lab_submissions lsub ON ls.submission_id = lsub.id
LEFT JOIN lab_sessions lsess ON lsub.session_id = lsess.id;

-- Indexes for analytics performance
CREATE INDEX IF NOT EXISTS idx_lab_sessions_lab_student ON lab_sessions(lab_id, student_id);
CREATE INDEX IF NOT EXISTS idx_lab_sessions_duration ON lab_sessions(duration_minutes);
CREATE INDEX IF NOT EXISTS idx_lab_submissions_submitted_at ON lab_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_lab_scores_final_score_lab ON lab_scores(lab_id, final_score);

-- Analytics aggregation table for caching heavy queries
CREATE TABLE IF NOT EXISTS lab_analytics_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID REFERENCES lms_labs(id) ON DELETE CASCADE,
    cache_type VARCHAR(50) NOT NULL, -- 'teacher_summary', 'grade_distribution', etc.
    cache_data JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lab_id, cache_type)
);

CREATE INDEX IF NOT EXISTS idx_lab_analytics_cache_lab_type ON lab_analytics_cache(lab_id, cache_type);
CREATE INDEX IF NOT EXISTS idx_lab_analytics_cache_expires ON lab_analytics_cache(expires_at);

-- Function to refresh analytics cache
CREATE OR REPLACE FUNCTION refresh_lab_analytics_cache(p_lab_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Clear existing cache for this lab
    DELETE FROM lab_analytics_cache WHERE lab_id = p_lab_id;
    
    -- Insert fresh teacher summary cache (expires in 1 hour)
    INSERT INTO lab_analytics_cache (lab_id, cache_type, cache_data, expires_at)
    SELECT 
        p_lab_id,
        'teacher_summary',
        row_to_json(lta.*),
        CURRENT_TIMESTAMP + INTERVAL '1 hour'
    FROM lab_teacher_analytics lta
    WHERE lta.lab_id = p_lab_id;
    
END;
$$ LANGUAGE plpgsql;

COMMENT ON VIEW lab_teacher_analytics IS 'Comprehensive analytics for teacher dashboard per lab';
COMMENT ON VIEW lab_parent_view IS 'Student lab performance data for parent portal';
COMMENT ON VIEW student_lab_summary IS 'Aggregated student performance summary for parents';
COMMENT ON VIEW lab_export_data IS 'Formatted data for CSV/PDF exports';
COMMENT ON TABLE lab_analytics_cache IS 'Cache for heavy analytics queries to improve performance';
COMMENT ON FUNCTION refresh_lab_analytics_cache IS 'Refreshes cached analytics data for a specific lab';