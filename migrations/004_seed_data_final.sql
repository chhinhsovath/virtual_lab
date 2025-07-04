-- TaRL Assessment System - Final Corrected Seed Data
-- This script works with the actual existing database schema

BEGIN;

-- Clear existing data (in correct order to respect foreign keys)
DELETE FROM tarl_student_selection;
DELETE FROM tarl_assessments;
DELETE FROM tbl_child;
DELETE FROM tbl_teacher_information;
DELETE FROM tbl_school_list;
DELETE FROM clusters;
DELETE FROM districts;
DELETE FROM tbl_province;

-- Insert Provinces
INSERT INTO tbl_province ("prvProvinceID", "prvProvinceNameKH", "prvProvinceNameEN") VALUES 
(1, 'បាត់ដំបង', 'Battambang'),
(2, 'កំពង់ចាម', 'Kampong Cham');

-- Insert Districts
INSERT INTO districts ("nameKh", "nameEn", "provinceId") VALUES 
('ស្រុកបាត់ដំបង', 'Battambang District', 1),
('ស្រុកមោងឬស្សី', 'Moung Ruessei District', 1),
('ស្រុកកំពង់ចាម', 'Kampong Cham District', 2),
('ស្រុកចំការលើ', 'Chamkar Leu District', 2);

-- Get district IDs for clusters
WITH district_ids AS (
  SELECT id, "nameEn", "provinceId" FROM districts
)
-- Insert Clusters
INSERT INTO clusters (name, "districtId")
SELECT 
  CASE 
    WHEN "nameEn" = 'Battambang District' THEN 'Battambang Central Cluster'
    WHEN "nameEn" = 'Moung Ruessei District' THEN 'Moung Ruessei Rural Cluster'
    WHEN "nameEn" = 'Kampong Cham District' THEN 'Kampong Cham Urban Cluster'
    WHEN "nameEn" = 'Chamkar Leu District' THEN 'Chamkar Leu Agricultural Cluster'
  END,
  id
FROM district_ids;

-- Insert Schools
INSERT INTO tbl_school_list ("sclAutoID", "sclSchoolNameKH", "sclSchoolNameEN", "sclSchoolCode", "prvProvinceID") VALUES 
-- Battambang Province Schools
(1, 'សាលាបឋមសិក្សាវត្តកណ្តាល', 'Wat Kandal Primary School', 'WK001', 1),
(2, 'សាលាបឋមសិក្សាភូមិថ្មី', 'Phum Thmey Primary School', 'PT002', 1),
(3, 'សាលាបឋមសិក្សាបឹងព្រីង', 'Boeng Pring Primary School', 'BP003', 1),
(4, 'សាលាបឋមសិក្សាកំពង់ស្វាយ', 'Kampong Svay Primary School', 'KS004', 1),

-- Kampong Cham Province Schools  
(5, 'សាលាបឋមសិក្សាព្រៃវែង', 'Prey Veng Primary School', 'PV005', 2),
(6, 'សាលាបឋមសិក្សាច្រៃធំ', 'Chrey Thom Primary School', 'CT006', 2),
(7, 'សាលាបឋមសិក្សាទួលព្រះ', 'Toul Preah Primary School', 'TP007', 2),
(8, 'សាលាបឋមសិក្សាសំរោង', 'Samrong Primary School', 'SR008', 2);

-- Insert Teachers with realistic Cambodian names
INSERT INTO tbl_teacher_information ("teiAutoID", "teiFirstName", "teiLastName", "teiGender", "teiPhone", "sclAutoID", "subject") VALUES 
-- Battambang Teachers
(1001, 'Sok', 'Pisey', 'Female', '012-345-678', 1, 'khmer'),
(1002, 'Chan', 'Dara', 'Male', '012-345-679', 2, 'math'),
(1003, 'Meas', 'Sophea', 'Female', '012-345-680', 3, 'khmer'),  
(1004, 'Ly', 'Chanthy', 'Male', '012-345-681', 4, 'math'),

-- Kampong Cham Teachers
(2001, 'Pich', 'Srey Leak', 'Female', '012-345-682', 5, 'khmer'),
(2002, 'Kem', 'Pisach', 'Male', '012-345-683', 6, 'math'),
(2003, 'Nov', 'Sreypov', 'Female', '012-345-684', 7, 'khmer'),
(2004, 'Heng', 'Vibol', 'Male', '012-345-685', 8, 'math');

-- Function to generate student data
DO $$
DECLARE
    school_id INTEGER;
    student_counter INTEGER := 1;
    grade INTEGER;
    i INTEGER;
    student_first_names TEXT[] := ARRAY[
        'Chhay', 'Seng', 'Pich', 'Ly', 'Nov', 'Kem', 'Heng', 'Chan',
        'Meas', 'Sok', 'Touch', 'Pov', 'Long', 'Hun', 'Keo', 'Pen',
        'Sam', 'Prom', 'Chea', 'Kong', 'Ouk', 'Yim', 'Ros', 'Tep',
        'Sim', 'Chhem', 'Horn', 'Kang', 'Nhem', 'Penh', 'Chheng', 'Tan'
    ];
    student_last_names TEXT[] := ARRAY[
        'Devi', 'Molika', 'Ratanak', 'Phearum', 'Sreyleak', 'Chenda', 'Nisa', 'Vichet',
        'Kosal', 'Srey Pich', 'Senghak', 'Sreynich', 'Dara', 'Chamroeun', 'Sopheak', 'Channary',
        'Sreypov', 'Sophea', 'Pisach', 'Bopha', 'Chandara', 'Sreyka', 'Mengheang', 'Vicheka',
        'Rithy', 'Davi', 'Sreyneath', 'Vannak', 'Channtha', 'Raksmey', 'Piseth', 'Thida'
    ];
    genders TEXT[] := ARRAY['Male', 'Female'];
    current_first_name TEXT;
    current_last_name TEXT;
    current_gender TEXT;
    current_province INTEGER;
BEGIN
    -- Generate students for each school (32 students per school)
    FOR school_id IN 1..8 LOOP
        -- Determine province based on school ID
        IF school_id <= 4 THEN
            current_province := 1; -- Battambang
        ELSE
            current_province := 2; -- Kampong Cham
        END IF;
        
        FOR grade IN 3..6 LOOP
            FOR i IN 1..8 LOOP
                current_first_name := student_first_names[((student_counter - 1) % array_length(student_first_names, 1)) + 1];
                current_last_name := student_last_names[((student_counter - 1) % array_length(student_last_names, 1)) + 1];
                current_gender := genders[((student_counter - 1) % 2) + 1];
                
                -- Insert into tbl_child with corrected column names
                INSERT INTO tbl_child ("chiID", "chiFirstName", "chiLastName", "chiGrade", "chiGender", "chiAge", "sclAutoID", "prvProvinceID") 
                VALUES (
                    student_counter,
                    current_first_name,
                    current_last_name,
                    grade,
                    current_gender,
                    8 + grade + (RANDOM() * 2)::INTEGER, -- Age 11-16 based on grade
                    school_id,
                    current_province
                );
                
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
    current_subject TEXT;
BEGIN
    -- Get all students with their school info
    FOR student_record IN 
        SELECT "chiID" as student_id, "sclAutoID" as school_id, "chiGrade" as grade
        FROM tbl_child
    LOOP
        -- Get school info to determine subject
        SELECT * INTO school_record FROM tbl_school_list WHERE "sclAutoID" = student_record.school_id;
        
        -- Generate assessments for both Khmer and Math teachers at the school
        FOR teacher_id IN 
            SELECT "teiAutoID" FROM tbl_teacher_information WHERE "sclAutoID" = student_record.school_id
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
            SELECT subject INTO current_subject FROM tbl_teacher_information WHERE "teiAutoID" = teacher_id;
            
            IF current_subject = 'khmer' THEN
                assessment_level := khmer_levels[level_index];
            ELSE
                assessment_level := math_levels[level_index];
            END IF;
            
            -- Insert baseline assessment with corrected column names and enum values
            INSERT INTO tarl_assessments (
                "studentId", "teacherId", "schoolId", subject, "assessmentCycle", "levelAchieved", "assessmentDate"
            ) 
            VALUES (
                student_record.student_id,
                teacher_id,
                student_record.school_id,
                current_subject::text::tarl_assessments_subject_enum,
                'baseline'::tarl_assessments_assessmentcycle_enum,
                assessment_level,
                CURRENT_DATE - INTERVAL '90 days' + INTERVAL '1 day' * (RANDOM() * 30)::INTEGER
            );
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
            SELECT DISTINCT ta."studentId", ta."schoolId", ta.subject, ta."levelAchieved",
                CASE ta."levelAchieved" 
                    WHEN 'Beginner' THEN 1
                    WHEN 'Letter' THEN 2  
                    WHEN '1-Digit' THEN 2
                    WHEN 'Word' THEN 3
                    WHEN '2-Digit' THEN 3
                    ELSE 4
                END as priority_order,
                RANDOM() as random_order
            FROM tarl_assessments ta
            WHERE ta."schoolId" = school_id 
            AND ta."assessmentCycle" = 'baseline'
            AND ta."levelAchieved" IN ('Beginner', 'Letter', '1-Digit', 'Word', '2-Digit')
            ORDER BY priority_order, random_order
            LIMIT 20
        LOOP
            INSERT INTO tarl_student_selection (
                "studentId", "schoolId", subject, "baselineLevel", "selectedForProgram", "selectionDate", "selectionCriteria"
            ) VALUES (
                student_record."studentId",
                student_record."schoolId",
                student_record.subject::text::tarl_student_selection_subject_enum,
                student_record."levelAchieved",
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
        SELECT tss."studentId", tss."schoolId", tss.subject, tss."baselineLevel"
        FROM tarl_student_selection tss
        WHERE tss."selectedForProgram" = true
    LOOP
        -- Get teacher for this subject and school
        SELECT "teiAutoID" INTO teacher_id 
        FROM tbl_teacher_information 
        WHERE "sclAutoID" = selection_record."schoolId" 
        AND subject::text = selection_record.subject::text;
        
        -- Determine level progression (50% chance of improvement)
        IF selection_record.subject = 'khmer' THEN
            levels_array := khmer_levels;
        ELSE
            levels_array := math_levels;
        END IF;
        
        -- Find current level index
        SELECT array_position(levels_array, selection_record."baselineLevel") INTO current_level_index;
        
        -- 50% chance of moving up one level, 50% staying same
        IF RANDOM() > 0.5 AND current_level_index < array_length(levels_array, 1) THEN
            new_level := levels_array[current_level_index + 1];
        ELSE
            new_level := selection_record."baselineLevel";
        END IF;
        
        -- Insert midline assessment
        INSERT INTO tarl_assessments (
            "studentId", "teacherId", "schoolId", subject, "assessmentCycle", "levelAchieved", "assessmentDate"
        ) VALUES (
            selection_record."studentId",
            teacher_id,
            selection_record."schoolId",
            selection_record.subject::text::tarl_assessments_subject_enum,
            'midline'::tarl_assessments_assessmentcycle_enum,
            new_level,
            CURRENT_DATE - INTERVAL '30 days' + INTERVAL '1 day' * (RANDOM() * 15)::INTEGER
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
        SELECT tss."studentId", tss."schoolId", tss.subject, tss."baselineLevel"
        FROM tarl_student_selection tss
        WHERE tss."selectedForProgram" = true
        AND RANDOM() > 0.4
    LOOP
        -- Get teacher for this subject and school
        SELECT "teiAutoID" INTO teacher_id 
        FROM tbl_teacher_information 
        WHERE "sclAutoID" = selection_record."schoolId" 
        AND subject::text = selection_record.subject::text;
        
        -- Get midline level
        SELECT "levelAchieved" INTO midline_level
        FROM tarl_assessments 
        WHERE "studentId" = selection_record."studentId" 
        AND "schoolId" = selection_record."schoolId"
        AND subject::text = selection_record.subject::text
        AND "assessmentCycle" = 'midline';
        
        -- Determine level progression (60% chance of improvement from midline)
        IF selection_record.subject = 'khmer' THEN
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
            "studentId", "teacherId", "schoolId", subject, "assessmentCycle", "levelAchieved", "assessmentDate"
        ) VALUES (
            selection_record."studentId",
            teacher_id,
            selection_record."schoolId",
            selection_record.subject::text::tarl_assessments_subject_enum,
            'endline'::tarl_assessments_assessmentcycle_enum,
            new_level,
            CURRENT_DATE - INTERVAL '5 days' + INTERVAL '1 day' * (RANDOM() * 5)::INTEGER
        );
    END LOOP;
END $$;

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
SELECT 'Baseline Assessments', COUNT(*) FROM tarl_assessments WHERE "assessmentCycle" = 'baseline'
UNION ALL
SELECT 'Midline Assessments', COUNT(*) FROM tarl_assessments WHERE "assessmentCycle" = 'midline'  
UNION ALL
SELECT 'Endline Assessments', COUNT(*) FROM tarl_assessments WHERE "assessmentCycle" = 'endline'
UNION ALL
SELECT 'Selected Students', COUNT(*) FROM tarl_student_selection WHERE "selectedForProgram" = true;

-- Show sample data
SELECT 'Sample Schools:' as info;
SELECT "sclAutoID", "sclSchoolNameEN", "sclSchoolNameKH", "prvProvinceID" FROM tbl_school_list LIMIT 5;

SELECT 'Sample Teachers:' as info;  
SELECT "teiAutoID", "teiFirstName", "teiLastName", subject, s."sclSchoolNameEN" as school_name 
FROM tbl_teacher_information t
JOIN tbl_school_list s ON t."sclAutoID" = s."sclAutoID"
LIMIT 5;

SELECT 'Assessment Summary by School:' as info;
SELECT 
    s."sclSchoolNameEN",
    COUNT(DISTINCT ta."studentId") as students_assessed,
    COUNT(CASE WHEN ta."assessmentCycle" = 'baseline' THEN 1 END) as baseline_count,
    COUNT(CASE WHEN ta."assessmentCycle" = 'midline' THEN 1 END) as midline_count,
    COUNT(CASE WHEN ta."assessmentCycle" = 'endline' THEN 1 END) as endline_count
FROM tbl_school_list s
LEFT JOIN tarl_assessments ta ON s."sclAutoID" = ta."schoolId"
GROUP BY s."sclAutoID", s."sclSchoolNameEN"
ORDER BY s."sclAutoID";