-- Create Pendulum Lab Demo - Final Version
-- Compatible with actual database schema

-- Create demo course
INSERT INTO lms_courses (
    id,
    name,
    description,
    subject,
    grade,
    academic_year,
    status,
    created_by,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440100',
    'Grade 9 Physics - Virtual Lab Experiments',
    'Interactive physics experiments for Grade 9 students including pendulum motion, energy conservation, and scientific methodology',
    'Physics',
    'Grade 9',
    '2024-2025',
    'active',
    '550e8400-e29b-41d4-a716-446655440002', -- Teacher demo user
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Create the Pendulum Lab
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
    '🎯 LEARNING OBJECTIVES:
• Understand the relationship between pendulum length and period
• Investigate whether mass affects pendulum motion  
• Explore the effect of gravity on pendulum behavior
• Apply scientific method through controlled experimentation
• Analyze experimental data and create graphs
• Connect physics concepts to real-world applications

🧪 INTERACTIVE SIMULATION:
Students use PhET''s pendulum simulation with full Khmer language support to discover physics laws through hands-on experimentation.

📊 ASSESSMENT ACTIVITIES:
1. Pre-lab predictions and hypothesis formation
2. Controlled experiments with data collection
3. Graph creation and pattern analysis
4. Lab report with conclusions and real-world connections

🇰🇭 CAMBODIAN CONTEXT:
This lab connects to traditional Cambodian temple bells, grandfather clocks, and modern timekeeping devices, helping students understand the physics behind familiar objects.

Perfect for donor demonstrations showcasing interactive, bilingual STEM education!',
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

-- Display created resources
SELECT 
    '🎉 Pendulum Lab Created Successfully!' as status,
    l.title as lab_title,
    l.status as lab_status,
    l.estimated_duration_minutes || ' minutes' as duration,
    c.name as course_name
FROM lms_labs l
JOIN lms_courses c ON l.course_id = c.id
WHERE l.id = '550e8400-e29b-41d4-a716-446655440101';

-- Show demo readiness
SELECT 
    '✅ DEMO READY - Access Details:' as info
UNION ALL
SELECT 
    'Platform: https://vlab.openplp.com'
UNION ALL
SELECT 
    'Student Login: student@vlab.edu.kh / demo123'
UNION ALL
SELECT 
    'Teacher Login: teacher@vlab.edu.kh / demo123'
UNION ALL
SELECT 
    'Admin Login: admin@vlab.edu.kh / demo123'
UNION ALL
SELECT 
    'Parent Login: parent@vlab.edu.kh / demo123';