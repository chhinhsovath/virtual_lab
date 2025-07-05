-- Virtual Lab Cambodia - STEM Simulations Seed Data
-- Populate the simulations catalog with PhET-inspired interactive simulations

-- Insert STEM simulations into catalog
INSERT INTO stem_simulations_catalog (
  simulation_name, 
  display_name_en, 
  display_name_km, 
  description_en, 
  description_km,
  subject_area,
  difficulty_level,
  grade_levels,
  estimated_duration,
  learning_objectives_en,
  learning_objectives_km,
  simulation_url,
  preview_image,
  tags,
  is_featured
) VALUES 
-- Physics Simulations
(
  'pendulum-lab',
  'Pendulum Lab',
  'ភេនឌុលម៉ាម',
  'Explore the physics of pendular motion, investigating how length, mass, and gravity affect the period of a pendulum.',
  'ស្វែងយល់រូបវិទ្យាចលនាភេនឌុលម៉ាម ស្រាវជ្រាវពីរបៀបដែលប្រវែង បរិមាណ និងទំនាញផែនដីប៉ះពាល់ដល់រយៈពេលភេនឌុលម៉ាម។',
  'Physics',
  'Intermediate',
  ARRAY[9, 10, 11, 12],
  45,
  ARRAY['Understand periodic motion', 'Analyze energy conservation', 'Investigate gravitational effects', 'Apply mathematical relationships'],
  ARRAY['យល់ដឹងអំពីចលនាតាមរយៈពេល', 'វិភាគការអភិរក្សថាមពល', 'ស្រាវជ្រាវឥទ្ធិពលទំនាញផែនដី', 'អនុវត្តទំនាក់ទំនងគណិតវិទ្យា'],
  '/simulation_pendulum_lab_km.html',
  '/images/simulations/pendulum-lab-preview.png',
  ARRAY['Motion', 'Energy', 'Gravity', 'Periodic Motion', 'Mathematical Modeling'],
  true
),
(
  'circuit-construction-kit',
  'Circuit Construction Kit',
  'បង្កើតសៀគ្វីអគ្គិសនី',
  'Build circuits with resistors, light bulbs, batteries, and switches. Take measurements with realistic ammeter and voltmeter.',
  'បង្កើតសៀគ្វីជាមួយទប់ធ្វើ ក្រុមភ្លើង ថ្ម និងកុងតាក់។ វាស់ស្ទង់ដោយប្រើឧបករណ៍វាស់អំពេរ និងវ៉ុលមេទ័រ។',
  'Physics',
  'Beginner',
  ARRAY[6, 7, 8, 9, 10, 11, 12],
  60,
  ARRAY['Build electrical circuits', 'Understand current and voltage', 'Apply Ohms Law', 'Measure electrical quantities'],
  ARRAY['បង្កើតសៀគ្វីអគ្គិសនី', 'យល់ដឹងអំពីអំពេរ និងវ៉ុលតាស', 'អនុវត្តច្បាប់អូម', 'វាស់ក្រាលបរិមាណអគ្គិសនី'],
  '#',
  '/images/simulations/circuit-kit-preview.png',
  ARRAY['Electricity', 'Current', 'Voltage', 'Resistance', 'Circuits'],
  true
),
(
  'wave-interference',
  'Wave Interference',
  'ការជ្រៀតជ្រែករលក',
  'Watch waves spread out and interfere as they pass through a double slit, then take measurements.',
  'សង្កេតរលករាលដាល និងជ្រៀតជ្រែកនៅពេលដែលវាឆ្លងកាត់រន្ធពីរ បន្ទាប់មកធ្វើការវាស់ស្ទង់។',
  'Physics',
  'Advanced',
  ARRAY[10, 11, 12],
  50,
  ARRAY['Understand wave properties', 'Observe wave interference', 'Analyze double-slit experiment', 'Connect to quantum physics'],
  ARRAY['យល់ដឹងអំពីលក្ខណៈរលក', 'សង្កេតការជ្រៀតជ្រែករលក', 'វិភាគការពិសោធន៍រន្ធពីរ', 'ភ្ជាប់ទៅនឹងរូបវិទ្យាក្វានតុម'],
  '#',
  '/images/simulations/wave-interference-preview.png',
  ARRAY['Waves', 'Interference', 'Double Slit', 'Quantum Physics', 'Optics'],
  false
),

-- Chemistry Simulations
(
  'build-a-molecule',
  'Build a Molecule',
  'បង្កើតម៉ូលេគុល',
  'Build molecules using atoms and see how they connect to form compounds. Explore 3D molecular structures.',
  'បង្កើតម៉ូលេគុលដោយប្រើអាតូម និងមើលពីរបៀបដែលពួកវាភ្ជាប់គ្នាបង្កើតជាសមាសធាតុ។ ស្វែងយល់រចនាសម្ព័ន្ធម៉ូលេគុល 3D។',
  'Chemistry',
  'Beginner',
  ARRAY[6, 7, 8, 9, 10, 11, 12],
  30,
  ARRAY['Understand molecular structure', 'Learn chemical bonding', 'Identify atoms and elements', 'Build common compounds'],
  ARRAY['យល់ដឹងអំពីរចនាសម្ព័ន្ធម៉ូលេគុល', 'រៀនពីការភ្ជាប់គីមី', 'កំណត់អាតូម និងធាតុ', 'បង្កើតសមាសធាតុទូទៅ'],
  '#',
  '/images/simulations/molecule-builder-preview.png',
  ARRAY['Molecular Structure', 'Chemical Bonds', 'Atoms', 'Compounds', '3D Visualization'],
  true
),
(
  'ph-scale',
  'pH Scale',
  'មាត្រដ្ឋាន pH',
  'Test the pH of everyday substances and learn about acids, bases, and neutralization.',
  'ធ្វើតេស្ត pH របស់សារធាតុប្រចាំថ្ងៃ និងរៀនអំពីអាស៊ីត បាស និងការបង្អត់។',
  'Chemistry',
  'Intermediate',
  ARRAY[8, 9, 10, 11, 12],
  35,
  ARRAY['Understand pH scale', 'Identify acids and bases', 'Learn neutralization', 'Test common substances'],
  ARRAY['យល់ដឹងអំពីមាត្រដ្ឋាន pH', 'កំណត់អាស៊ីត និងបាស', 'រៀនការបង្អត់', 'ធ្វើតេស្តសារធាតុទូទៅ'],
  '#',
  '/images/simulations/ph-scale-preview.png',
  ARRAY['pH', 'Acids', 'Bases', 'Neutralization', 'Chemical Properties'],
  false
),

-- Biology Simulations
(
  'gene-expression-essentials',
  'Gene Expression Essentials',
  'ការបញ្ចេញហ្សែនសំខាន់ៗ',
  'Explore how genes are turned on and off, and how this affects the traits of living organisms.',
  'ស្វែងយល់ពីរបៀបដែលហ្សែនត្រូវបានបើក និងបិទ និងវាប៉ះពាល់យ៉ាងណាដល់លក្ខណៈរបស់សារពាង្គកម្ម។',
  'Biology',
  'Advanced',
  ARRAY[9, 10, 11, 12],
  40,
  ARRAY['Understand gene regulation', 'Learn protein synthesis', 'Explore DNA transcription', 'Study cellular processes'],
  ARRAY['យល់ដឹងអំពីការគ្រប់គ្រងហ្សែន', 'រៀនការសំយោគប្រូតេអ៊ីន', 'ស្វែងយល់ការចម្លង DNA', 'សិក្សាដំណើរការកោសិកា'],
  '#',
  '/images/simulations/gene-expression-preview.png',
  ARRAY['DNA', 'RNA', 'Protein Synthesis', 'Genetics', 'Molecular Biology'],
  false
),
(
  'natural-selection',
  'Natural Selection',
  'ការបរិវត្តន៍ធម្មជាតិ',
  'Observe how environmental factors influence the evolution of populations over time.',
  'សង្កេតពីរបៀបដែលកត្តាបរិស្ថានប៉ះពាល់ដល់ការវិវត្តន៍ចំនួនប្រជាជនតាមពេលវេលា។',
  'Biology',
  'Intermediate',
  ARRAY[8, 9, 10, 11, 12],
  45,
  ARRAY['Understand natural selection', 'Observe population changes', 'Learn about adaptation', 'Study evolutionary processes'],
  ARRAY['យល់ដឹងអំពីការបរិវត្តន៍ធម្មជាតិ', 'សង្កេតការផ្លាស់ប្តូរចំនួនប្រជាជន', 'រៀនអំពីការសម្របខ្លួន', 'សិក្សាដំណើរការវិវត្តន៍'],
  '#',
  '/images/simulations/natural-selection-preview.png',
  ARRAY['Evolution', 'Natural Selection', 'Adaptation', 'Population Genetics', 'Environment'],
  true
),

-- Mathematics Simulations
(
  'function-builder',
  'Function Builder',
  'កម្មវិធីបង្កើតអនុគមន៍',
  'Build functions using mathematical operations and see their graphical representations.',
  'បង្កើតអនុគមន៍ដោយប្រើប្រតិបត្តិការគណិតវិទ្យា និងមើលការបង្ហាញក្រាហ្វិករបស់ពួកវា។',
  'Mathematics',
  'Intermediate',
  ARRAY[8, 9, 10, 11, 12],
  35,
  ARRAY['Build mathematical functions', 'Understand graphical representation', 'Apply algebraic concepts', 'Explore function transformations'],
  ARRAY['បង្កើតអនុគមន៍គណិតវិទ្យា', 'យល់ដឹងអំពីការបង្ហាញក្រាហ្វិក', 'អនុវត្តគំនិតពិជគណិត', 'ស្វែងយល់ការបំប្លែងអនុគមន៍'],
  '#',
  '/images/simulations/function-builder-preview.png',
  ARRAY['Functions', 'Graphs', 'Algebra', 'Mathematical Modeling', 'Transformations'],
  false
),
(
  'graphing-lines',
  'Graphing Lines',
  'គូសបន្ទាត់ក្រាហ្វិក',
  'Explore the relationship between linear equations and their graphs. Change the slope and y-intercept and observe the effects.',
  'ស្វែងយល់ទំនាក់ទំនងរវាងសមីការលីនេអ៊ែរ និងក្រាហ្វិករបស់ពួកវា។ ផ្លាស់ប្តូរជម្រាល និងចំណុចកាត់ y ហើយសង្កេតឥទ្ធិពល។',
  'Mathematics',
  'Beginner',
  ARRAY[7, 8, 9, 10],
  25,
  ARRAY['Understand linear equations', 'Learn slope and intercept', 'Graph linear functions', 'Connect algebra and geometry'],
  ARRAY['យល់ដឹងអំពីសមីការលីនេអ៊ែរ', 'រៀនជម្រាល និងចំណុចកាត់', 'គូសអនុគមន៍លីនេអ៊ែរ', 'ភ្ជាប់ពិជគណិត និងធរណីមាត្រ'],
  '#',
  '/images/simulations/graphing-lines-preview.png',
  ARRAY['Linear Equations', 'Slope', 'Y-intercept', 'Coordinate Plane', 'Algebra'],
  true
);

-- Insert demo teacher assignments
INSERT INTO teacher_simulation_assignments (
  teacher_id,
  simulation_id,
  school_id,
  class_grade,
  instructions_en,
  instructions_km,
  learning_goals,
  is_featured
) SELECT 
  1, -- Demo teacher ID
  sc.id,
  1, -- Demo school ID
  10, -- Grade 10
  'Complete this simulation and answer the reflection questions. Focus on understanding the scientific concepts.',
  'បញ្ចប់ការធ្វើត្រាប់តាមនេះ និងឆ្លើយសំណួរឆ្លុះបញ្ចាំង។ ផ្តោតលើការយល់ដឹងគំនិតវិទ្យាសាស្ត្រ។',
  ARRAY['Understand core concepts', 'Apply scientific method', 'Analyze results', 'Connect to real world'],
  sc.is_featured
FROM stem_simulations_catalog sc 
WHERE sc.is_featured = true
LIMIT 5;

-- Insert sample student progress data
INSERT INTO student_simulation_progress (
  student_id,
  simulation_id,
  assignment_id,
  started_at,
  total_time_spent,
  attempts_count,
  best_score,
  achievements
) SELECT 
  (ROW_NUMBER() OVER ()) % 100 + 1, -- Demo student IDs 1-100
  sc.id,
  ta.id,
  CURRENT_TIMESTAMP - INTERVAL '7 days',
  FLOOR(RANDOM() * 3600 + 600)::INTEGER, -- 10-60 minutes
  FLOOR(RANDOM() * 5 + 1)::INTEGER, -- 1-5 attempts
  (RANDOM() * 40 + 60)::DECIMAL(5,2), -- Scores 60-100
  CASE 
    WHEN RANDOM() > 0.7 THEN ARRAY['First Completion', 'Excellent Score']
    WHEN RANDOM() > 0.4 THEN ARRAY['First Completion']
    ELSE ARRAY[]::TEXT[]
  END
FROM stem_simulations_catalog sc
CROSS JOIN teacher_simulation_assignments ta
WHERE sc.is_featured = true AND ta.is_featured = true
LIMIT 50;

-- Insert learning analytics data
INSERT INTO learning_analytics (
  student_id,
  school_id,
  subject_area,
  metric_name,
  metric_value,
  metric_unit,
  academic_year,
  semester
) VALUES 
-- Physics metrics
(1, 1, 'Physics', 'simulations_completed', 5, 'count', '2024-25', 'Semester 1'),
(1, 1, 'Physics', 'average_score', 87.5, 'percentage', '2024-25', 'Semester 1'),
(1, 1, 'Physics', 'total_learning_time', 180, 'minutes', '2024-25', 'Semester 1'),
-- Chemistry metrics
(1, 1, 'Chemistry', 'simulations_completed', 3, 'count', '2024-25', 'Semester 1'),
(1, 1, 'Chemistry', 'average_score', 92.0, 'percentage', '2024-25', 'Semester 1'),
(1, 1, 'Chemistry', 'total_learning_time', 120, 'minutes', '2024-25', 'Semester 1'),
-- Biology metrics
(1, 1, 'Biology', 'simulations_completed', 2, 'count', '2024-25', 'Semester 1'),
(1, 1, 'Biology', 'average_score', 78.5, 'percentage', '2024-25', 'Semester 1'),
(1, 1, 'Biology', 'total_learning_time', 95, 'minutes', '2024-25', 'Semester 1'),
-- Mathematics metrics
(1, 1, 'Mathematics', 'simulations_completed', 4, 'count', '2024-25', 'Semester 1'),
(1, 1, 'Mathematics', 'average_score', 85.0, 'percentage', '2024-25', 'Semester 1'),
(1, 1, 'Mathematics', 'total_learning_time', 160, 'minutes', '2024-25', 'Semester 1');

-- Update system metadata
INSERT INTO learning_analytics (student_id, school_id, subject_area, metric_name, metric_value, metric_unit, additional_data) 
VALUES (0, 0, 'System', 'simulations_catalog_populated', 10, 'count', 
  '{"migration_name": "stem_simulations_seed_data", "completed_at": "' || CURRENT_TIMESTAMP || '", "total_simulations": 10}');

-- Create view for active simulations with statistics
CREATE OR REPLACE VIEW active_simulations_stats AS
SELECT 
  sc.id,
  sc.simulation_name,
  sc.display_name_en,
  sc.display_name_km,
  sc.subject_area,
  sc.difficulty_level,
  sc.is_featured,
  COUNT(DISTINCT ssp.student_id) as total_users,
  ROUND(AVG(ssp.best_score), 2) as average_score,
  ROUND(AVG(ssp.total_time_spent::DECIMAL / 60), 2) as avg_time_minutes,
  COUNT(ssp.id) as total_attempts
FROM stem_simulations_catalog sc
LEFT JOIN student_simulation_progress ssp ON sc.id = ssp.simulation_id
WHERE sc.is_active = true
GROUP BY sc.id, sc.simulation_name, sc.display_name_en, sc.display_name_km, 
         sc.subject_area, sc.difficulty_level, sc.is_featured
ORDER BY sc.is_featured DESC, total_users DESC;

COMMENT ON VIEW active_simulations_stats IS 'Statistics view for active simulations including usage metrics and performance data';