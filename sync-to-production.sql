-- Virtual Lab Cambodia - Production Sync Script
-- This script contains the essential data from local development to sync to production

-- Clear existing simulation data
DELETE FROM student_simulation_progress;
DELETE FROM teacher_simulation_assignments;
DELETE FROM stem_simulations_catalog;

-- Insert STEM simulations catalog
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
  is_featured,
  is_active
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
  true,
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
  true,
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
  false,
  true
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
  true,
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
  false,
  true
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
  false,
  true
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
  true,
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
  false,
  true
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
  true,
  true
);

-- Record the sync completion
INSERT INTO learning_analytics (student_id, school_id, subject_area, metric_name, metric_value, metric_unit, additional_data) 
VALUES (0, 0, 'System', 'production_sync', 1, 'completed', 
  '{"sync_date": "' || CURRENT_TIMESTAMP || '", "simulations_synced": 9, "version": "v1.0"}'::jsonb)
ON CONFLICT DO NOTHING;