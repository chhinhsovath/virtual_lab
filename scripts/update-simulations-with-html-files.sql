-- Update existing simulations and add new ones based on HTML files in public/labs/

-- First, update the pendulum lab to use the new location
UPDATE stem_simulations_catalog 
SET simulation_url = '/labs/simulation_pendulum_lab_km.html'
WHERE simulation_name = 'pendulum-lab';

-- Add or update simulations for the HTML files
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
-- Balancing Act
(
  'balancing-act',
  'Balancing Act',
  'សកម្មភាពតុល្យភាព',
  'Explore the principles of balance and torque. Place objects on a seesaw and learn about lever arms and equilibrium.',
  'ស្វែងយល់គោលការណ៍នៃតុល្យភាព និងម៉ូម៉ង់។ ដាក់វត្ថុនៅលើរន្ទះញញួរ និងរៀនអំពីដៃរំកិល និងលំនឹង។',
  'Physics',
  'Beginner',
  ARRAY[5, 6, 7, 8],
  30,
  ARRAY[
    'Understand balance and equilibrium',
    'Explore torque and lever arms',
    'Predict balance points',
    'Compare masses and distances'
  ],
  ARRAY[
    'យល់ដឹងពីតុល្យភាព និងលំនឹង',
    'ស្វែងយល់ម៉ូម៉ង់ និងដៃរំកិល',
    'ទស្សន៍ទាយចំណុចតុល្យភាព',
    'ប្រៀបធៀបម៉ាស់ និងចម្ងាយ'
  ],
  '/labs/balancing-act_en.html',
  '/images/balancing-act-preview.png',
  ARRAY['Physics', 'Balance', 'Torque', 'Equilibrium', 'Lever'],
  true,
  true
),
-- Build a Nucleus
(
  'build-a-nucleus',
  'Build a Nucleus',
  'សាងសង់ស្នូល',
  'Construct atomic nuclei and explore nuclear stability. Add protons and neutrons to create isotopes.',
  'សាងសង់ស្នូលអាតូម និងស្វែងយល់ស្ថេរភាពនុយក្លេអ៊ែរ។ បន្ថែមប្រូតុង និងនឺត្រុងដើម្បីបង្កើតអ៊ីសូតូប។',
  'Physics',
  'Advanced',
  ARRAY[10, 11, 12],
  45,
  ARRAY[
    'Understand nuclear structure',
    'Build stable and unstable nuclei',
    'Explore isotopes',
    'Learn about nuclear forces'
  ],
  ARRAY[
    'យល់ដឹងរចនាសម្ព័ន្ធនុយក្លេអ៊ែរ',
    'សាងសង់ស្នូលស្ថិរ និងមិនស្ថិរ',
    'ស្វែងយល់អ៊ីសូតូប',
    'រៀនអំពីកម្លាំងនុយក្លេអ៊ែរ'
  ],
  '/labs/build-a-nucleus_en.html',
  '/images/build-nucleus-preview.png',
  ARRAY['Physics', 'Nuclear', 'Atoms', 'Isotopes', 'Protons', 'Neutrons'],
  false,
  true
),
-- Geometric Optics Basics
(
  'geometric-optics-basics',
  'Geometric Optics Basics',
  'មូលដ្ឋានអុបទិកធរណីមាត្រ',
  'Explore how light rays interact with mirrors and lenses. Learn about reflection, refraction, and image formation.',
  'ស្វែងយល់របៀបដែលកាំរស្មីពន្លឺមានអន្តរកម្មជាមួយកញ្ចក់ និងកែវ។ រៀនអំពីការឆ្លុះ ការបត់ និងការបង្កើតរូបភាព។',
  'Physics',
  'Intermediate',
  ARRAY[8, 9, 10, 11],
  40,
  ARRAY[
    'Understand reflection and refraction',
    'Trace light rays through lenses',
    'Form real and virtual images',
    'Explore focal points'
  ],
  ARRAY[
    'យល់ដឹងការឆ្លុះ និងការបត់',
    'តាមដានកាំរស្មីពន្លឺតាមរយៈកែវ',
    'បង្កើតរូបភាពពិត និងនិម្មិត',
    'ស្វែងយល់ចំណុចប្រមូលផ្តុំ'
  ],
  '/labs/geometric-optics-basics_en.html',
  '/images/geometric-optics-preview.png',
  ARRAY['Physics', 'Optics', 'Light', 'Lenses', 'Mirrors', 'Refraction'],
  true,
  true
),
-- Gravity Force Lab Basics
(
  'gravity-force-lab-basics',
  'Gravity Force Lab Basics',
  'មូលដ្ឋានមន្ទីរពិសោធន៍កម្លាំងទំនាញ',
  'Visualize gravitational force between two masses. Explore how mass and distance affect gravitational attraction.',
  'មើលឃើញកម្លាំងទំនាញរវាងម៉ាស់ពីរ។ ស្វែងយល់របៀបដែលម៉ាស់ និងចម្ងាយប៉ះពាល់ដល់ការទាក់ទាញទំនាញ។',
  'Physics',
  'Intermediate',
  ARRAY[9, 10, 11],
  35,
  ARRAY[
    'Understand gravitational force',
    'Explore inverse square law',
    'Compare forces between objects',
    'Visualize force vectors'
  ],
  ARRAY[
    'យល់ដឹងកម្លាំងទំនាញ',
    'ស្វែងយល់ច្បាប់ការ៉េច្រាស',
    'ប្រៀបធៀបកម្លាំងរវាងវត្ថុ',
    'មើលឃើញវ៉ិចទ័រកម្លាំង'
  ],
  '/labs/gravity-force-lab-basics_en.html',
  '/images/gravity-force-preview.png',
  ARRAY['Physics', 'Gravity', 'Forces', 'Newton', 'Mass'],
  false,
  true
),
-- Projectile Data Lab
(
  'projectile-data-lab',
  'Projectile Data Lab',
  'មន្ទីរពិសោធន៍ទិន្នន័យគ្រាប់កាំភ្លើង',
  'Launch projectiles and analyze motion data. Study trajectory, range, and the effects of initial conditions.',
  'បាញ់គ្រាប់ និងវិភាគទិន្នន័យចលនា។ សិក្សាគន្លង ចម្ងាយ និងផលប៉ះពាល់នៃលក្ខខណ្ឌដំបូង។',
  'Physics',
  'Intermediate',
  ARRAY[9, 10, 11, 12],
  50,
  ARRAY[
    'Analyze projectile motion',
    'Collect and interpret data',
    'Understand trajectory factors',
    'Calculate range and height'
  ],
  ARRAY[
    'វិភាគចលនាគ្រាប់',
    'ប្រមូល និងបកស្រាយទិន្នន័យ',
    'យល់ដឹងកត្តាគន្លង',
    'គណនាចម្ងាយ និងកម្ពស់'
  ],
  '/labs/projectile-data-lab_en.html',
  '/images/projectile-data-preview.png',
  ARRAY['Physics', 'Projectile', 'Motion', 'Data Analysis', 'Trajectory'],
  true,
  true
),
-- Quantum Coin Toss
(
  'quantum-coin-toss',
  'Quantum Coin Toss',
  'ការបោះកាក់កង់ទិច',
  'Explore quantum probability with a virtual coin toss. Learn about superposition and measurement in quantum mechanics.',
  'ស្វែងយល់ប្រូបាប៊ីលីតេកង់ទិចជាមួយការបោះកាក់និម្មិត។ រៀនអំពីការត្រួតស៊ី និងការវាស់ក្នុងមេកានិចកង់ទិច។',
  'Physics',
  'Advanced',
  ARRAY[11, 12],
  30,
  ARRAY[
    'Understand quantum superposition',
    'Explore probability in quantum mechanics',
    'Learn about measurement effects',
    'Compare classical and quantum coins'
  ],
  ARRAY[
    'យល់ដឹងការត្រួតស៊ីកង់ទិច',
    'ស្វែងយល់ប្រូបាប៊ីលីតេក្នុងមេកានិចកង់ទិច',
    'រៀនអំពីផលប៉ះពាល់នៃការវាស់',
    'ប្រៀបធៀបកាក់បុរាណ និងកង់ទិច'
  ],
  '/labs/quantum-coin-toss_en.html',
  '/images/quantum-coin-preview.png',
  ARRAY['Physics', 'Quantum', 'Probability', 'Superposition', 'Advanced'],
  false,
  true
),
-- Quantum Measurement
(
  'quantum-measurement',
  'Quantum Measurement',
  'ការវាស់កង់ទិច',
  'Investigate how measurement affects quantum systems. Explore wave function collapse and uncertainty.',
  'ស៊ើបអង្កេតរបៀបដែលការវាស់ប៉ះពាល់ដល់ប្រព័ន្ធកង់ទិច។ ស្វែងយល់ការដួលរលំមុខងាររលក និងភាពមិនច្បាស់លាស់។',
  'Physics',
  'Advanced',
  ARRAY[11, 12],
  45,
  ARRAY[
    'Understand quantum measurement',
    'Explore wave function collapse',
    'Learn about uncertainty principle',
    'Visualize quantum states'
  ],
  ARRAY[
    'យល់ដឹងការវាស់កង់ទិច',
    'ស្វែងយល់ការដួលរលំមុខងាររលក',
    'រៀនអំពីគោលការណ៍មិនច្បាស់លាស់',
    'មើលឃើញស្ថានភាពកង់ទិច'
  ],
  '/labs/quantum-measurement_en.html',
  '/images/quantum-measurement-preview.png',
  ARRAY['Physics', 'Quantum', 'Measurement', 'Wave Function', 'Advanced'],
  false,
  true
)
ON CONFLICT (simulation_name) DO UPDATE SET
  simulation_url = EXCLUDED.simulation_url,
  display_name_en = EXCLUDED.display_name_en,
  display_name_km = EXCLUDED.display_name_km,
  description_en = EXCLUDED.description_en,
  description_km = EXCLUDED.description_km,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;

-- Add sample exercises for Balancing Act
DO $$
DECLARE
  sim_id UUID;
  teacher_id UUID;
BEGIN
  SELECT id INTO sim_id FROM stem_simulations_catalog WHERE simulation_name = 'balancing-act' LIMIT 1;
  SELECT id INTO teacher_id FROM users WHERE role = 'teacher' LIMIT 1;
  
  IF sim_id IS NOT NULL AND teacher_id IS NOT NULL THEN
    -- Check if exercises already exist
    IF NOT EXISTS (SELECT 1 FROM simulation_exercises WHERE simulation_id = sim_id) THEN
      INSERT INTO simulation_exercises (
        simulation_id, teacher_id, question_number, question_type,
        question_en, question_km,
        instructions_en, instructions_km,
        options, correct_answer, points, difficulty_level,
        is_required, is_active
      ) VALUES
      (sim_id, teacher_id, 1, 'multiple_choice',
       'If you place a 10kg mass 2 meters from the pivot, where should you place a 5kg mass to balance it?',
       'ប្រសិនបើអ្នកដាក់ម៉ាស់ 10kg ចម្ងាយ 2 ម៉ែត្រពីចំណុចរំកិល តើអ្នកគួរដាក់ម៉ាស់ 5kg នៅឯណាដើម្បីធ្វើឱ្យវាមានតុល្យភាព?',
       'Use the principle of torque balance',
       'ប្រើគោលការណ៍តុល្យភាពម៉ូម៉ង់',
       '{"options_en": ["1 meter", "2 meters", "3 meters", "4 meters"], "options_km": ["1 ម៉ែត្រ", "2 ម៉ែត្រ", "3 ម៉ែត្រ", "4 ម៉ែត្រ"]}',
       '4 meters', 15, 'medium', true, true),
      (sim_id, teacher_id, 2, 'true_false',
       'The torque depends on both the force and the distance from the pivot.',
       'ម៉ូម៉ង់អាស្រ័យលើទាំងកម្លាំង និងចម្ងាយពីចំណុចរំកិល។',
       'Think about the lever arm principle',
       'គិតអំពីគោលការណ៍ដៃរំកិល',
       null,
       'true', 10, 'easy', true, true);
    END IF;
  END IF;
END $$;