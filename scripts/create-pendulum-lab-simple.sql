-- Create Pendulum Lab for Virtual Lab LMS Demo
-- Compatible with current database schema

-- First, create a demo course if it doesn't exist
INSERT INTO lms_courses (
    id,
    title,
    description,
    subject,
    grade,
    duration_hours,
    is_active,
    created_by,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440100',
    'Grade 9 Physics - Virtual Lab Experiments',
    'Interactive physics experiments for Grade 9 students including pendulum motion, energy conservation, and scientific methodology',
    'Physics',
    'Grade 9',
    20,
    true,
    '550e8400-e29b-41d4-a716-446655440002', -- Teacher demo user
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Create the Pendulum Lab entry
INSERT INTO lms_labs (
    id,
    course_id,
    title,
    description,
    subject,
    grade,
    estimated_duration_minutes,
    status,
    simulation_url,
    worksheet_url,
    rubric_url,
    created_by,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440101',
    '550e8400-e29b-41d4-a716-446655440100',
    'Pendulum Physics Lab - ភេនឌុលម៉ាមរូបវិទ្យាពិសោធន៍',
    'Investigate the factors that affect pendulum motion including length, mass, and gravity through interactive PhET simulation. Students will discover the mathematical relationship between pendulum length and period while testing common misconceptions about mass effects.

Learning Objectives:
• Understand the relationship between pendulum length and period
• Investigate whether mass affects pendulum motion  
• Explore the effect of gravity on pendulum behavior
• Apply scientific method through controlled experimentation
• Analyze experimental data and create graphs
• Connect physics concepts to real-world applications

Cambodian Context:
This lab connects to traditional Cambodian temple bells and modern timekeeping, helping students understand the physics behind familiar objects.',
    'Physics',
    'Grade 9',
    45,
    'published',
    '/simulation_pendulum_lab_km.html',
    '/pendulum_lab_worksheet.pdf',
    '/pendulum_lab_rubric.pdf',
    '550e8400-e29b-41d4-a716-446655440002', -- Teacher demo user
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    simulation_url = EXCLUDED.simulation_url,
    updated_at = NOW();

-- Create lab resources in the lms_resources table
INSERT INTO lms_resources (
    id,
    title,
    description,
    resource_type,
    file_path,
    file_size,
    mime_type,
    is_public,
    created_by,
    created_at
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440200',
    'Pendulum Lab Simulation (Khmer)',
    'Interactive PhET simulation for pendulum physics with full Khmer language support',
    'simulation',
    '/simulation_pendulum_lab_km.html',
    3600000,
    'text/html',
    true,
    '550e8400-e29b-41d4-a716-446655440002',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440201',
    'Pendulum Lab Worksheet',
    'Comprehensive bilingual worksheet with data collection tables and analysis questions',
    'worksheet',
    '/pendulum_lab_worksheet.pdf',
    512000,
    'application/pdf',
    true,
    '550e8400-e29b-41d4-a716-446655440002',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440202',
    'Teacher Assessment Rubric',
    'Detailed scoring rubric for evaluating student lab reports and understanding',
    'rubric',
    '/pendulum_lab_rubric.pdf',
    256000,
    'application/pdf',
    false,
    '550e8400-e29b-41d4-a716-446655440002',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Create some sample lab sessions for demo purposes
INSERT INTO lab_sessions (
    id,
    lab_id,
    student_id,
    started_at,
    completed_at,
    total_time_minutes,
    interaction_count,
    status
) VALUES 
(
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440101',
    '550e8400-e29b-41d4-a716-446655440003', -- Student demo user
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour 15 minutes',
    45,
    127,
    'completed'
),
(
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440101',
    '550e8400-e29b-41d4-a716-446655440003', -- Student demo user (second attempt)
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '23 hours',
    38,
    98,
    'completed'
);

-- Create sample lab scores for demo
INSERT INTO lab_scores (
    id,
    lab_id,
    student_id,
    submission_data,
    auto_score,
    manual_score,
    final_score,
    feedback,
    graded_by,
    graded_at,
    created_at
) VALUES 
(
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440101',
    '550e8400-e29b-41d4-a716-446655440003',
    '{"predictions": {"length_effect": "slower", "mass_effect": "no_change", "gravity_effect": "slower"}, "experiments": {"length_data": [{"length": 0.5, "period": 1.42}, {"length": 1.0, "period": 2.01}, {"length": 2.0, "period": 2.84}], "mass_data": [{"mass": 0.5, "period": 2.01}, {"mass": 1.0, "period": 2.01}, {"mass": 2.0, "period": 2.01}]}, "analysis": {"correct_patterns": true, "graph_quality": "excellent", "conclusions": "Length affects period, mass does not"}}',
    85,
    90,
    88,
    'Excellent experimental work! You correctly identified that length affects pendulum period while mass does not. Your graphs clearly show the mathematical relationship. Consider improving your explanation of the physics behind these observations.',
    '550e8400-e29b-41d4-a716-446655440002', -- Teacher demo user
    NOW() - INTERVAL '12 hours',
    NOW() - INTERVAL '1 day'
);

-- Display created lab information
SELECT 
    'Virtual Lab Resources Created Successfully!' as status,
    l.title as lab_title,
    l.status as lab_status,
    l.estimated_duration_minutes as duration,
    COUNT(DISTINCT s.id) as demo_sessions,
    COUNT(DISTINCT sc.id) as demo_scores
FROM lms_labs l
LEFT JOIN lab_sessions s ON l.id = s.lab_id
LEFT JOIN lab_scores sc ON l.id = sc.lab_id
WHERE l.id = '550e8400-e29b-41d4-a716-446655440101'
GROUP BY l.id, l.title, l.status, l.estimated_duration_minutes;