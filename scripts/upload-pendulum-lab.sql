-- Upload Pendulum Lab to Virtual Lab LMS Database
-- This script creates the pendulum lab entry and associates it with the simulation file

-- Create the Pendulum Lab entry
INSERT INTO lms_labs (
    id,
    title,
    title_km,
    description,
    description_km,
    subject,
    grade_level,
    duration_minutes,
    difficulty_level,
    learning_objectives,
    learning_objectives_km,
    instructions,
    instructions_km,
    simulation_type,
    simulation_url,
    is_active,
    created_by,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Pendulum Physics Lab',
    'ការពិសោធន៍មន្ទីរពិសោធន៍ភេនឌុលម៉ាម',
    'Investigate the factors that affect pendulum motion including length, mass, and gravity through interactive simulation.',
    'ស្រាវជ្រាវកត្តាដែលប៉ះពាល់ដល់ចលនាភេនឌុលម៉ាម រួមទាំងប្រវែង បរិមាណ និងទំនាញផែនដី តាមរយៈការពិសោធន៍អន្តរកម្ម។',
    'Physics',
    9,
    45,
    'intermediate',
    ARRAY[
        'Understand the relationship between pendulum length and period',
        'Investigate whether mass affects pendulum motion',
        'Explore the effect of gravity on pendulum behavior',
        'Apply scientific method through controlled experimentation',
        'Analyze experimental data and create graphs',
        'Connect physics concepts to real-world applications'
    ],
    ARRAY[
        'យល់ដឹងអំពីទំនាក់ទំនងរវាងប្រវែងនិងរយៈពេលលំយោលភេនឌុលម៉ាម',
        'ស្រាវជ្រាវថាតើបរិមាណប៉ះពាល់ដល់ចលនាភេនឌុលម៉ាមដែរឬទេ',
        'ស្វែងយល់ពីឥទ្ធិពលនៃទំនាញផែនដីលើអាកប្បកិរិយាភេនឌុលម៉ាម',
        'អនុវត្តវិធីសាស្ត្រវិទ្យាសាស្ត្រតាមរយៈការពិសោធន៍ដែលបានគ្រប់គ្រង',
        'វិភាគទិន្នន័យពិសោធន៍ និងបង្កើតកែកា្សដី',
        'ភ្ជាប់គោលគំនិតរូបវិទ្យាទៅនឹងការអនុវត្តជាក់ស្តែង'
    ],
    'Complete the pre-lab predictions, manipulate pendulum parameters in the simulation, collect data for different variables, analyze your results, and submit your lab report.',
    'បំពេញការទាយទុកជាមុនមុនពិសោធន៍ គ្រប់គ្រងកត្តាភេនឌុលម៉ាមក្នុងការធ្វើត្រាប់តាម ប្រមូលទិន្នន័យសម្រាប់អថេរផ្សេងៗ វិភាគលទ្ធផលរបស់អ្នក និងដាក់ស្នើរបាយការណ៍ពិសោធន៍របស់អ្នក។',
    'phet_simulation',
    '/simulation_pendulum_lab_km.html',
    true,
    '550e8400-e29b-41d4-a716-446655440002', -- Teacher demo user
    NOW(),
    NOW()
) ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    description_km = EXCLUDED.description_km,
    updated_at = NOW();

-- Create lab resources for the pendulum simulation
INSERT INTO lms_resources (
    id,
    lab_id,
    title,
    title_km,
    resource_type,
    file_path,
    file_size,
    mime_type,
    description,
    description_km,
    is_required,
    display_order,
    created_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM lms_labs WHERE title = 'Pendulum Physics Lab'),
    'Interactive Pendulum Simulation',
    'ការធ្វើត្រាប់តាមភេនឌុលម៉ាមអន្តរកម្ម',
    'simulation',
    '/simulation_pendulum_lab_km.html',
    3600000, -- Approximate file size in bytes
    'text/html',
    'PhET Interactive Simulation for exploring pendulum motion with Khmer language support',
    'ការពិសោធន៍ PhET អន្តរកម្មសម្រាប់ស្វែងយល់ចលនាភេនឌុលម៉ាមដែលគាំទ្រភាសាខ្មែរ',
    true,
    1,
    NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM lms_labs WHERE title = 'Pendulum Physics Lab'),
    'Lab Worksheet & Data Collection',
    'សន្លឹកការងារពិសោធន៍ និងការប្រមូលទិន្នន័យ',
    'worksheet',
    '/pendulum_lab_worksheet.pdf',
    512000,
    'application/pdf',
    'Comprehensive worksheet with data tables, analysis questions, and lab report template',
    'សន្លឹកការងារពេញលេញដែលមានតារាងទិន្នន័យ សំណួរវិភាគ និងទម្រង់របាយការណ៍ពិសោធន៍',
    true,
    2,
    NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM lms_labs WHERE title = 'Pendulum Physics Lab'),
    'Teacher Guide',
    'ការណែនាំគ្រូបង្រៀន',
    'guide',
    '/pendulum_teacher_guide.pdf',
    256000,
    'application/pdf',
    'Complete teaching guide with learning objectives, common misconceptions, and assessment rubric',
    'ការណែនាំបង្រៀនពេញលេញដែលមានគោលបំណងការសិក្សា ការយល់ខុសទូទៅ និងលក្ខខណ្ឌវាយតម្លៃ',
    false,
    3,
    NOW()
);

-- Create lab skills associations
INSERT INTO lab_skills (
    id,
    lab_id,
    skill_name,
    skill_category,
    proficiency_level,
    created_at
) VALUES
(gen_random_uuid(), (SELECT id FROM lms_labs WHERE title = 'Pendulum Physics Lab'), 'Experimental Design', 'scientific_method', 'intermediate', NOW()),
(gen_random_uuid(), (SELECT id FROM lms_labs WHERE title = 'Pendulum Physics Lab'), 'Data Collection', 'research_skills', 'beginner', NOW()),
(gen_random_uuid(), (SELECT id FROM lms_labs WHERE title = 'Pendulum Physics Lab'), 'Graph Creation', 'data_analysis', 'intermediate', NOW()),
(gen_random_uuid(), (SELECT id FROM lms_labs WHERE title = 'Pendulum Physics Lab'), 'Pattern Recognition', 'critical_thinking', 'intermediate', NOW()),
(gen_random_uuid(), (SELECT id FROM lms_labs WHERE title = 'Pendulum Physics Lab'), 'Physics Concepts', 'subject_knowledge', 'intermediate', NOW()),
(gen_random_uuid(), (SELECT id FROM lms_labs WHERE title = 'Pendulum Physics Lab'), 'Mathematical Modeling', 'mathematics', 'advanced', NOW());

-- Create sample lab assignment for demo
INSERT INTO lms_assignments (
    id,
    lab_id,
    title,
    title_km,
    description,
    description_km,
    assigned_to,
    assigned_by,
    due_date,
    max_attempts,
    passing_score,
    is_active,
    created_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM lms_labs WHERE title = 'Pendulum Physics Lab'),
    'Grade 9 Physics - Pendulum Motion Investigation',
    'រូបវិទ្យាថ្នាក់ទី៩ - ការស្រាវជ្រាវចលនាភេនឌុលម៉ាម',
    'Complete the pendulum lab simulation, collect experimental data, and submit your analysis report.',
    'បំពេញការពិសោធន៍ភេនឌុលម៉ាម ប្រមូលទិន្នន័យពិសោធន៍ និងដាក់ស្នើរបាយការណ៍វិភាគរបស់អ្នក។',
    'grade_9_physics',
    '550e8400-e29b-41d4-a716-446655440002', -- Teacher demo user
    NOW() + INTERVAL '7 days',
    3,
    70,
    true,
    NOW()
);

-- Display confirmation
SELECT 
    'Pendulum Lab Successfully Created!' as status,
    l.title,
    l.title_km,
    COUNT(r.id) as resource_count,
    COUNT(s.id) as skill_count
FROM lms_labs l
LEFT JOIN lms_resources r ON l.id = r.lab_id
LEFT JOIN lab_skills s ON l.id = s.lab_id
WHERE l.title = 'Pendulum Physics Lab'
GROUP BY l.id, l.title, l.title_km;