-- Lab Assessment Schema
-- Phase 3: LabAssessment module database tables

-- Lab Scores Table
CREATE TABLE IF NOT EXISTS lab_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lab_id UUID REFERENCES lms_labs(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES lab_submissions(id) ON DELETE CASCADE,
    auto_score FLOAT,
    manual_score FLOAT,
    final_score FLOAT GENERATED ALWAYS AS (COALESCE(manual_score, auto_score)) STORED,
    teacher_comments TEXT,
    rubric_breakdown JSONB,
    graded_by UUID REFERENCES users(id),
    graded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, lab_id) -- One score record per student per lab
);

-- Lab Rubric Criteria (enhanced from existing structure)
CREATE TABLE IF NOT EXISTS lab_rubric_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID REFERENCES lms_labs(id) ON DELETE CASCADE,
    criterion_name VARCHAR(200) NOT NULL,
    criterion_description TEXT,
    max_points DECIMAL(5,2) NOT NULL,
    weight DECIMAL(3,2) DEFAULT 1.0, -- Weighting factor for this criterion
    auto_gradable BOOLEAN DEFAULT false, -- Whether this can be auto-graded
    auto_grade_config JSONB, -- Configuration for auto-grading rules
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lab Score Annotations (detailed comments per section/criterion)
CREATE TABLE IF NOT EXISTS lab_score_annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    score_id UUID REFERENCES lab_scores(id) ON DELETE CASCADE,
    criterion_id UUID REFERENCES lab_rubric_criteria(id) ON DELETE CASCADE,
    points_awarded DECIMAL(5,2),
    teacher_comment TEXT,
    annotation_type VARCHAR(50) DEFAULT 'feedback', -- 'feedback', 'correction', 'praise'
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auto-grading Rules Table
CREATE TABLE IF NOT EXISTS lab_auto_grading_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID REFERENCES lms_labs(id) ON DELETE CASCADE,
    criterion_id UUID REFERENCES lab_rubric_criteria(id) ON DELETE CASCADE,
    field_id VARCHAR(100) NOT NULL, -- Field from the worksheet form
    rule_type VARCHAR(50) NOT NULL, -- 'exact_match', 'range', 'pattern', 'keyword', 'numeric_comparison'
    rule_config JSONB NOT NULL, -- Configuration for the specific rule type
    points_value DECIMAL(5,2) NOT NULL, -- Points awarded if rule passes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Analytics View
CREATE OR REPLACE VIEW lab_assessment_analytics AS
SELECT 
    ls.id as score_id,
    ls.student_id,
    u.name as student_name,
    ls.lab_id,
    l.title as lab_title,
    l.subject,
    l.grade,
    ls.auto_score,
    ls.manual_score,
    ls.final_score,
    ls.teacher_comments,
    ls.graded_at,
    teacher.name as graded_by_name,
    lsub.submitted_at,
    lsess.duration_minutes,
    -- Calculate percentage scores
    CASE 
        WHEN (SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id) > 0 
        THEN (ls.final_score / (SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id)) * 100
        ELSE NULL 
    END as percentage_score,
    -- Grade categorization
    CASE 
        WHEN ls.final_score IS NULL THEN 'Not Graded'
        WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 90 THEN 'A'
        WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 80 THEN 'B'
        WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 70 THEN 'C'
        WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 60 THEN 'D'
        ELSE 'F'
    END as letter_grade
FROM lab_scores ls
LEFT JOIN users u ON ls.student_id = u.id
LEFT JOIN lms_labs l ON ls.lab_id = l.id
LEFT JOIN users teacher ON ls.graded_by = teacher.id
LEFT JOIN lab_submissions lsub ON ls.submission_id = lsub.id
LEFT JOIN lab_sessions lsess ON lsub.session_id = lsess.id;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lab_scores_student_lab ON lab_scores(student_id, lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_scores_lab_id ON lab_scores(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_scores_graded_by ON lab_scores(graded_by);
CREATE INDEX IF NOT EXISTS idx_lab_scores_graded_at ON lab_scores(graded_at);
CREATE INDEX IF NOT EXISTS idx_lab_scores_final_score ON lab_scores(final_score);

CREATE INDEX IF NOT EXISTS idx_lab_rubric_criteria_lab_id ON lab_rubric_criteria(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_rubric_criteria_auto_gradable ON lab_rubric_criteria(auto_gradable);

CREATE INDEX IF NOT EXISTS idx_lab_score_annotations_score_id ON lab_score_annotations(score_id);
CREATE INDEX IF NOT EXISTS idx_lab_score_annotations_criterion_id ON lab_score_annotations(criterion_id);

CREATE INDEX IF NOT EXISTS idx_lab_auto_grading_rules_lab_id ON lab_auto_grading_rules(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_auto_grading_rules_active ON lab_auto_grading_rules(is_active);

-- Add triggers for updated_at columns
CREATE TRIGGER update_lab_scores_updated_at 
    BEFORE UPDATE ON lab_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_score_annotations_updated_at 
    BEFORE UPDATE ON lab_score_annotations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate auto-score based on submission responses
CREATE OR REPLACE FUNCTION calculate_auto_score(p_lab_id UUID, p_submission_responses JSONB)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    rule RECORD;
    total_score DECIMAL(10,2) := 0;
    response_value TEXT;
    numeric_response DECIMAL;
    rule_passes BOOLEAN;
BEGIN
    -- Loop through all active auto-grading rules for this lab
    FOR rule IN 
        SELECT * FROM lab_auto_grading_rules 
        WHERE lab_id = p_lab_id AND is_active = true
    LOOP
        -- Get the response value for this field
        response_value := p_submission_responses ->> rule.field_id;
        
        IF response_value IS NOT NULL THEN
            rule_passes := false;
            
            -- Apply different rule types
            CASE rule.rule_type
                WHEN 'exact_match' THEN
                    rule_passes := response_value = (rule.rule_config ->> 'expected_value');
                
                WHEN 'range' THEN
                    BEGIN
                        numeric_response := response_value::DECIMAL;
                        rule_passes := numeric_response >= (rule.rule_config ->> 'min_value')::DECIMAL 
                                      AND numeric_response <= (rule.rule_config ->> 'max_value')::DECIMAL;
                    EXCEPTION WHEN OTHERS THEN
                        rule_passes := false;
                    END;
                
                WHEN 'pattern' THEN
                    rule_passes := response_value ~* (rule.rule_config ->> 'regex_pattern');
                
                WHEN 'keyword' THEN
                    rule_passes := position(lower(rule.rule_config ->> 'keyword') IN lower(response_value)) > 0;
                
                WHEN 'numeric_comparison' THEN
                    BEGIN
                        numeric_response := response_value::DECIMAL;
                        CASE rule.rule_config ->> 'operator'
                            WHEN 'gt' THEN rule_passes := numeric_response > (rule.rule_config ->> 'value')::DECIMAL;
                            WHEN 'gte' THEN rule_passes := numeric_response >= (rule.rule_config ->> 'value')::DECIMAL;
                            WHEN 'lt' THEN rule_passes := numeric_response < (rule.rule_config ->> 'value')::DECIMAL;
                            WHEN 'lte' THEN rule_passes := numeric_response <= (rule.rule_config ->> 'value')::DECIMAL;
                            WHEN 'eq' THEN rule_passes := numeric_response = (rule.rule_config ->> 'value')::DECIMAL;
                            ELSE rule_passes := false;
                        END CASE;
                    EXCEPTION WHEN OTHERS THEN
                        rule_passes := false;
                    END;
                
                ELSE
                    rule_passes := false;
            END CASE;
            
            -- Add points if rule passes
            IF rule_passes THEN
                total_score := total_score + rule.points_value;
            END IF;
        END IF;
    END LOOP;
    
    RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Function to generate rubric breakdown JSON
CREATE OR REPLACE FUNCTION generate_rubric_breakdown(p_lab_id UUID, p_submission_responses JSONB)
RETURNS JSONB AS $$
DECLARE
    breakdown JSONB := '{}';
    criterion RECORD;
    criterion_score DECIMAL(10,2);
    rules_for_criterion RECORD;
BEGIN
    -- Loop through all criteria for this lab
    FOR criterion IN 
        SELECT * FROM lab_rubric_criteria 
        WHERE lab_id = p_lab_id 
        ORDER BY order_index
    LOOP
        criterion_score := 0;
        
        -- If criterion is auto-gradable, calculate score from rules
        IF criterion.auto_gradable THEN
            SELECT COALESCE(SUM(
                CASE WHEN calculate_auto_score(p_lab_id, p_submission_responses) > 0 
                THEN points_value ELSE 0 END
            ), 0) INTO criterion_score
            FROM lab_auto_grading_rules
            WHERE criterion_id = criterion.id AND is_active = true;
        END IF;
        
        -- Add to breakdown
        breakdown := breakdown || jsonb_build_object(
            criterion.id::text, 
            jsonb_build_object(
                'name', criterion.criterion_name,
                'max_points', criterion.max_points,
                'awarded_points', criterion_score,
                'auto_gradable', criterion.auto_gradable,
                'percentage', 
                CASE WHEN criterion.max_points > 0 
                THEN (criterion_score / criterion.max_points) * 100 
                ELSE 0 END
            )
        );
    END LOOP;
    
    RETURN breakdown;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE lab_scores IS 'Stores auto and manual scores for lab submissions';
COMMENT ON TABLE lab_rubric_criteria IS 'Defines scoring criteria and rubrics for labs';
COMMENT ON TABLE lab_score_annotations IS 'Detailed teacher comments and feedback per criterion';
COMMENT ON TABLE lab_auto_grading_rules IS 'Rules for automatic scoring of lab responses';
COMMENT ON FUNCTION calculate_auto_score IS 'Calculates automatic score based on submission responses and grading rules';
COMMENT ON FUNCTION generate_rubric_breakdown IS 'Generates detailed rubric breakdown for a submission';