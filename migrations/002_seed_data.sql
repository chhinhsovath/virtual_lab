-- TaRL Assessment System - Comprehensive Seed Data
-- This script creates realistic data for the TaRL assessment system
-- Including provinces, schools, teachers, students, and assessments

BEGIN;

-- Clear existing data (in correct order to respect foreign keys)
DELETE FROM tarl_student_selection;
DELETE FROM tarl_assessments;
DELETE FROM user_sessions;
DELETE FROM user_permissions;
DELETE FROM tbl_child_information;
DELETE FROM tbl_child;
DELETE FROM tbl_teacher_information;
DELETE FROM tbl_school_list;
DELETE FROM clusters;
DELETE FROM districts;
DELETE FROM tbl_province;

-- Insert Provinces
INSERT INTO tbl_province (prvProvinceID, prvProvinceName, prvProvinceNameKH) VALUES 
(1, 'Battambang', 'បាត់ដំបង'),
(2, 'Kampong Cham', 'កំពង់ចាម');

-- Insert Districts
INSERT INTO districts (id, name_kh, name_en, province_id) VALUES 
(gen_random_uuid(), 'ស្រុកបាត់ដំបង', 'Battambang District', 1),
(gen_random_uuid(), 'ស្រុកមោងឬស្សី', 'Moung Ruessei District', 1),
(gen_random_uuid(), 'ស្រុកកំពង់ចាម', 'Kampong Cham District', 2),
(gen_random_uuid(), 'ស្រុកចំការលើ', 'Chamkar Leu District', 2);

-- Get district IDs for clusters
WITH district_ids AS (
  SELECT id, name_en, province_id FROM districts
)
-- Insert Clusters
INSERT INTO clusters (id, name, district_id)
SELECT 
  gen_random_uuid(),
  CASE 
    WHEN name_en = 'Battambang District' THEN 'Battambang Central Cluster'
    WHEN name_en = 'Moung Ruessei District' THEN 'Moung Ruessei Rural Cluster'
    WHEN name_en = 'Kampong Cham District' THEN 'Kampong Cham Urban Cluster'
    WHEN name_en = 'Chamkar Leu District' THEN 'Chamkar Leu Agricultural Cluster'
  END,
  id
FROM district_ids;

-- Insert Schools
INSERT INTO tbl_school_list (sclAutoID, sclName, sclNameKH, sclProvince, sclDistrict, sclCommune, sclVillage) VALUES 
-- Battambang Province Schools
(1, 'Wat Kandal Primary School', 'សាលាបឋមសិក្សាវត្តកណ្តាល', 1, 'Battambang', 'Kandal', 'Kandal'),
(2, 'Phum Thmey Primary School', 'សាលាបឋមសិក្សាភូមិថ្មី', 1, 'Battambang', 'Thmey', 'Phum Thmey'),
(3, 'Boeng Pring Primary School', 'សាលាបឋមសិក្សាបឹងព្រីង', 1, 'Moung Ruessei', 'Pring', 'Boeng Pring'),
(4, 'Kampong Svay Primary School', 'សាលាបឋមសិក្សាកំពង់ស្វាយ', 1, 'Moung Ruessei', 'Svay', 'Kampong Svay'),

-- Kampong Cham Province Schools  
(5, 'Prey Veng Primary School', 'សាលាបឋមសិក្សាព្រៃវែង', 2, 'Kampong Cham', 'Prey Veng', 'Prey Veng'),
(6, 'Chrey Thom Primary School', 'សាលាបឋមសិក្សាច្រៃធំ', 2, 'Kampong Cham', 'Chrey', 'Chrey Thom'),
(7, 'Toul Preah Primary School', 'សាលាបឋមសិក្សាទួលព្រះ', 2, 'Chamkar Leu', 'Toul', 'Toul Preah'),
(8, 'Samrong Primary School', 'សាលាបឋមសិក្សាសំរោង', 2, 'Chamkar Leu', 'Samrong', 'Samrong');

-- Insert Teachers with realistic Cambodian names
INSERT INTO tbl_teacher_information (teiAutoID, teiName, teiGender, teiPhone, teiSchoolID, teiSubject) VALUES 
-- Battambang Teachers
(1001, 'Sok Pisey', 'Female', '012-345-678', 1, 'Khmer'),
(1002, 'Chan Dara', 'Male', '012-345-679', 2, 'Math'),
(1003, 'Meas Sophea', 'Female', '012-345-680', 3, 'Khmer'),  
(1004, 'Ly Chanthy', 'Male', '012-345-681', 4, 'Math'),

-- Kampong Cham Teachers
(2001, 'Pich Srey Leak', 'Female', '012-345-682', 5, 'Khmer'),
(2002, 'Kem Pisach', 'Male', '012-345-683', 6, 'Math'),
(2003, 'Nov Sreypov', 'Female', '012-345-684', 7, 'Khmer'),
(2004, 'Heng Vibol', 'Male', '012-345-685', 8, 'Math');

-- Function to generate student data
DO $$
DECLARE
    school_id INTEGER;
    student_counter INTEGER := 1;
    grade INTEGER;
    i INTEGER;
    student_names TEXT[] := ARRAY[
        'Chhay Devi', 'Seng Molika', 'Pich Ratanak', 'Ly Phearum', 'Nov Sreyleak', 'Kem Chenda', 'Heng Nisa', 'Chan Vichet',
        'Meas Kosal', 'Sok Srey Pich', 'Touch Senghak', 'Pov Sreynich', 'Long Dara', 'Hun Chamroeun', 'Keo Sopheak', 'Pen Channary',
        'Sam Sreypov', 'Prom Sophea', 'Chea Pisach', 'Kong Bopha', 'Ouk Chandara', 'Yim Sreyka', 'Ros Mengheang', 'Tep Vicheka',
        'Sim Rithy', 'Chhem Davi', 'Horn Sreyneath', 'Kang Vannak', 'Nhem Channtha', 'Penh Raksmey', 'Chheng Piseth', 'Tan Thida'
    ];
    genders TEXT[] := ARRAY['Male', 'Female'];
    current_name TEXT;
    current_gender TEXT;
BEGIN
    -- Generate students for each school (32 students per school)
    FOR school_id IN 1..8 LOOP
        FOR grade IN 3..6 LOOP
            FOR i IN 1..8 LOOP
                current_name := student_names[((student_counter - 1) % array_length(student_names, 1)) + 1];
                current_gender := genders[((student_counter - 1) % 2) + 1];
                
                -- Insert into tbl_child
                INSERT INTO tbl_child (chiID, chiName, chiGender, chiDOB) 
                VALUES (
                    student_counter,
                    current_name,
                    current_gender,
                    CURRENT_DATE - INTERVAL '1 year' * (8 + grade) + INTERVAL '1 day' * (RANDOM() * 365)::INTEGER
                );
                
                -- Insert into tbl_child_information  
                INSERT INTO tbl_child_information (chiChildID, chiSchoolID, chiClass)
                VALUES (student_counter, school_id, grade);
                
                student_counter := student_counter + 1;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Generate baseline assessments for all students
DO $$
DECLARE
    student_record RECORD;
    school_record RECORD;
    teacher_id INTEGER;
    assessment_level TEXT;
    khmer_levels TEXT[] := ARRAY['Beginner', 'Letter', 'Word', 'Paragraph', 'Story'];
    math_levels TEXT[] := ARRAY['Beginner', '1-Digit', '2-Digit', 'Subtraction', 'Advanced'];
    level_probabilities NUMERIC[] := ARRAY[0.2, 0.3, 0.25, 0.15, 0.1]; -- Realistic distribution
    random_val NUMERIC;
    cumulative_prob NUMERIC;
    level_index INTEGER;
BEGIN
    -- Get all students with their school info
    FOR student_record IN 
        SELECT c.chiID as student_id, ci.chiSchoolID as school_id, ci.chiClass as grade
        FROM tbl_child c
        JOIN tbl_child_information ci ON c.chiID = ci.chiChildID
    LOOP
        -- Get school info to determine subject
        SELECT * INTO school_record FROM tbl_school_list WHERE sclAutoID = student_record.school_id;
        
        -- Generate assessments for both Khmer and Math teachers at the school
        FOR teacher_id IN 
            SELECT teiAutoID FROM tbl_teacher_information WHERE teiSchoolID = student_record.school_id
        LOOP
            -- Determine assessment level based on realistic distribution
            random_val := RANDOM();
            cumulative_prob := 0;
            level_index := 1;
            
            FOR i IN 1..array_length(level_probabilities, 1) LOOP
                cumulative_prob := cumulative_prob + level_probabilities[i];
                IF random_val <= cumulative_prob THEN
                    level_index := i;
                    EXIT;
                END IF;
            END LOOP;
            
            -- Select appropriate level based on teacher subject
            SELECT teiSubject INTO assessment_level FROM tbl_teacher_information WHERE teiAutoID = teacher_id;
            
            IF assessment_level = 'Khmer' THEN
                assessment_level := khmer_levels[level_index];
            ELSE
                assessment_level := math_levels[level_index];
            END IF;
            
            -- Insert baseline assessment
            INSERT INTO tarl_assessments (
                student_id, teacher_id, school_id, subject, cycle, level_achieved, assessment_date, notes
            ) 
            SELECT 
                student_record.student_id,
                teacher_id,
                student_record.school_id,
                ti.teiSubject,
                'Baseline',
                assessment_level,
                CURRENT_DATE - INTERVAL '90 days' + INTERVAL '1 day' * (RANDOM() * 30)::INTEGER,
                CASE WHEN RANDOM() > 0.7 THEN 'Good progress shown' ELSE NULL END
            FROM tbl_teacher_information ti WHERE ti.teiAutoID = teacher_id;
        END LOOP;
    END LOOP;
END $$;

-- Select students for TaRL program (20 students per school, focusing on lower levels)
DO $$
DECLARE
    school_id INTEGER;
    student_record RECORD;
    selection_count INTEGER;
BEGIN
    FOR school_id IN 1..8 LOOP
        selection_count := 0;
        
        -- Select students with lower baseline levels first
        FOR student_record IN 
            SELECT DISTINCT ta.student_id, ta.school_id, ta.subject, ta.level_achieved
            FROM tarl_assessments ta
            WHERE ta.school_id = school_id 
            AND ta.cycle = 'Baseline'
            AND ta.level_achieved IN ('Beginner', 'Letter', '1-Digit', 'Word', '2-Digit')
            ORDER BY 
                CASE ta.level_achieved 
                    WHEN 'Beginner' THEN 1
                    WHEN 'Letter' THEN 2  
                    WHEN '1-Digit' THEN 2
                    WHEN 'Word' THEN 3
                    WHEN '2-Digit' THEN 3
                    ELSE 4
                END,
                RANDOM()
            LIMIT 20
        LOOP
            INSERT INTO tarl_student_selection (
                student_id, school_id, subject, baseline_level, selected_for_program, selection_date, selection_criteria
            ) VALUES (
                student_record.student_id,
                student_record.school_id,
                student_record.subject,
                student_record.level_achieved,
                true,
                CURRENT_DATE - INTERVAL '60 days',
                'Selected based on baseline assessment - needs additional support'
            );
            
            selection_count := selection_count + 1;
            IF selection_count >= 20 THEN
                EXIT;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- Generate midline assessments for selected students (showing some improvement)
DO $$
DECLARE
    selection_record RECORD;
    teacher_id INTEGER;
    new_level TEXT;
    khmer_levels TEXT[] := ARRAY['Beginner', 'Letter', 'Word', 'Paragraph', 'Story'];
    math_levels TEXT[] := ARRAY['Beginner', '1-Digit', '2-Digit', 'Subtraction', 'Advanced'];
    current_level_index INTEGER;
    levels_array TEXT[];
BEGIN
    FOR selection_record IN 
        SELECT tss.student_id, tss.school_id, tss.subject, tss.baseline_level
        FROM tarl_student_selection tss
        WHERE tss.selected_for_program = true
    LOOP
        -- Get teacher for this subject and school
        SELECT teiAutoID INTO teacher_id 
        FROM tbl_teacher_information 
        WHERE teiSchoolID = selection_record.school_id 
        AND teiSubject = selection_record.subject;
        
        -- Determine level progression (50% chance of improvement)
        IF selection_record.subject = 'Khmer' THEN
            levels_array := khmer_levels;
        ELSE
            levels_array := math_levels;
        END IF;
        
        -- Find current level index
        SELECT array_position(levels_array, selection_record.baseline_level) INTO current_level_index;
        
        -- 50% chance of moving up one level, 50% staying same
        IF RANDOM() > 0.5 AND current_level_index < array_length(levels_array, 1) THEN
            new_level := levels_array[current_level_index + 1];
        ELSE
            new_level := selection_record.baseline_level;
        END IF;
        
        -- Insert midline assessment
        INSERT INTO tarl_assessments (
            student_id, teacher_id, school_id, subject, cycle, level_achieved, assessment_date, notes
        ) VALUES (
            selection_record.student_id,
            teacher_id,
            selection_record.school_id,
            selection_record.subject,
            'Midline',
            new_level,
            CURRENT_DATE - INTERVAL '30 days' + INTERVAL '1 day' * (RANDOM() * 15)::INTEGER,
            CASE WHEN new_level != selection_record.baseline_level 
                 THEN 'Showing improvement in TaRL program' 
                 ELSE 'Maintaining current level, needs continued support' 
            END
        );
    END LOOP;
END $$;

-- Generate some endline assessments for selected students (further improvement)
DO $$
DECLARE
    selection_record RECORD;
    teacher_id INTEGER;
    midline_level TEXT;
    new_level TEXT;
    khmer_levels TEXT[] := ARRAY['Beginner', 'Letter', 'Word', 'Paragraph', 'Story'];
    math_levels TEXT[] := ARRAY['Beginner', '1-Digit', '2-Digit', 'Subtraction', 'Advanced'];
    current_level_index INTEGER;
    levels_array TEXT[];
BEGIN
    -- Only create endline for about 60% of selected students (simulation of ongoing program)
    FOR selection_record IN 
        SELECT tss.student_id, tss.school_id, tss.subject, tss.baseline_level
        FROM tarl_student_selection tss
        WHERE tss.selected_for_program = true
        AND RANDOM() > 0.4
    LOOP
        -- Get teacher for this subject and school
        SELECT teiAutoID INTO teacher_id 
        FROM tbl_teacher_information 
        WHERE teiSchoolID = selection_record.school_id 
        AND teiSubject = selection_record.subject;
        
        -- Get midline level
        SELECT level_achieved INTO midline_level
        FROM tarl_assessments 
        WHERE student_id = selection_record.student_id 
        AND school_id = selection_record.school_id
        AND subject = selection_record.subject
        AND cycle = 'Midline';
        
        -- Determine level progression (60% chance of improvement from midline)
        IF selection_record.subject = 'Khmer' THEN
            levels_array := khmer_levels;
        ELSE
            levels_array := math_levels;
        END IF;
        
        -- Find current level index
        SELECT array_position(levels_array, midline_level) INTO current_level_index;
        
        -- 60% chance of moving up one level, 40% staying same
        IF RANDOM() > 0.4 AND current_level_index < array_length(levels_array, 1) THEN
            new_level := levels_array[current_level_index + 1];
        ELSE
            new_level := midline_level;
        END IF;
        
        -- Insert endline assessment
        INSERT INTO tarl_assessments (
            student_id, teacher_id, school_id, subject, cycle, level_achieved, assessment_date, notes
        ) VALUES (
            selection_record.student_id,
            teacher_id,
            selection_record.school_id,
            selection_record.subject,
            'Endline',
            new_level,
            CURRENT_DATE - INTERVAL '5 days' + INTERVAL '1 day' * (RANDOM() * 5)::INTEGER,
            CASE WHEN new_level != midline_level 
                 THEN 'Excellent progress through TaRL intervention program' 
                 ELSE 'Consolidated skills at current level' 
            END
        );
    END LOOP;
END $$;

-- Create user accounts and permissions
-- Admin user
INSERT INTO user_sessions (user_id, session_token, user_role, expires_at) VALUES 
(9999, 'admin_session_token', 'admin', CURRENT_TIMESTAMP + INTERVAL '24 hours');

-- Cluster mentor users  
INSERT INTO user_sessions (user_id, session_token, user_role, school_ids, expires_at) VALUES 
(8001, 'mentor1_session_token', 'cluster_mentor', ARRAY[1,2,3,4], CURRENT_TIMESTAMP + INTERVAL '24 hours'),
(8002, 'mentor2_session_token', 'cluster_mentor', ARRAY[5,6,7,8], CURRENT_TIMESTAMP + INTERVAL '24 hours');

-- Insert user permissions for cluster mentors
INSERT INTO user_permissions (user_id, resource, action, school_id) VALUES 
-- Mentor 1 (Battambang)
(8001, 'assessments', 'read', 1),
(8001, 'assessments', 'read', 2), 
(8001, 'assessments', 'read', 3),
(8001, 'assessments', 'read', 4),
(8001, 'students', 'read', 1),
(8001, 'students', 'read', 2),
(8001, 'students', 'read', 3), 
(8001, 'students', 'read', 4),

-- Mentor 2 (Kampong Cham)
(8002, 'assessments', 'read', 5),
(8002, 'assessments', 'read', 6),
(8002, 'assessments', 'read', 7),
(8002, 'assessments', 'read', 8),
(8002, 'students', 'read', 5),
(8002, 'students', 'read', 6),
(8002, 'students', 'read', 7),
(8002, 'students', 'read', 8);

COMMIT;

-- Verification Queries
SELECT 'Provinces' as table_name, COUNT(*) as count FROM tbl_province
UNION ALL
SELECT 'Districts', COUNT(*) FROM districts  
UNION ALL
SELECT 'Clusters', COUNT(*) FROM clusters
UNION ALL
SELECT 'Schools', COUNT(*) FROM tbl_school_list
UNION ALL  
SELECT 'Teachers', COUNT(*) FROM tbl_teacher_information
UNION ALL
SELECT 'Students', COUNT(*) FROM tbl_child
UNION ALL
SELECT 'Baseline Assessments', COUNT(*) FROM tarl_assessments WHERE cycle = 'Baseline'
UNION ALL
SELECT 'Midline Assessments', COUNT(*) FROM tarl_assessments WHERE cycle = 'Midline'  
UNION ALL
SELECT 'Endline Assessments', COUNT(*) FROM tarl_assessments WHERE cycle = 'Endline'
UNION ALL
SELECT 'Selected Students', COUNT(*) FROM tarl_student_selection WHERE selected_for_program = true;

-- Show sample data
SELECT 'Sample Schools:' as info;
SELECT sclAutoID, sclName, sclNameKH, sclProvince FROM tbl_school_list LIMIT 5;

SELECT 'Sample Teachers:' as info;  
SELECT teiAutoID, teiName, teiSubject, s.sclName as school_name 
FROM tbl_teacher_information t
JOIN tbl_school_list s ON t.teiSchoolID = s.sclAutoID
LIMIT 5;

SELECT 'Assessment Summary by School:' as info;
SELECT 
    s.sclName,
    COUNT(DISTINCT ta.student_id) as students_assessed,
    COUNT(CASE WHEN ta.cycle = 'Baseline' THEN 1 END) as baseline_count,
    COUNT(CASE WHEN ta.cycle = 'Midline' THEN 1 END) as midline_count,
    COUNT(CASE WHEN ta.cycle = 'Endline' THEN 1 END) as endline_count
FROM tbl_school_list s
LEFT JOIN tarl_assessments ta ON s.sclAutoID = ta.school_id
GROUP BY s.sclAutoID, s.sclName
ORDER BY s.sclAutoID;