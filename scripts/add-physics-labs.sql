-- Add Physics lab simulations
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
-- Wave Interference Lab
(
  'wave-interference',
  'Wave Interference',
  'ការជ្រៀតជ្រែករលក',
  'Explore wave interference patterns with water, sound, and light waves. Create interference patterns and measure wavelength.',
  'ស្វែងយល់ពីលំនាំការជ្រៀតជ្រែករលកជាមួយរលកទឹក សំឡេង និងពន្លឺ។ បង្កើតលំនាំជ្រៀតជ្រែក និងវាស់ប្រវែងរលក។',
  'Physics',
  'Advanced',
  ARRAY[10, 11, 12],
  60,
  ARRAY[
    'Understand constructive and destructive interference',
    'Measure wavelength and frequency relationships',
    'Explore double-slit experiment',
    'Compare different types of waves'
  ],
  ARRAY[
    'យល់ដឹងពីការជ្រៀតជ្រែកស្ថាបនា និងបំផ្លាញ',
    'វាស់ទំនាក់ទំនងប្រវែងរលក និងប្រេកង់',
    'ស្វែងយល់ពិសោធន៍ចន្លោះពីរ',
    'ប្រៀបធៀបប្រភេទរលកផ្សេងៗ'
  ],
  '/simulations/wave-interference',
  '/images/wave-interference-preview.png',
  ARRAY['Physics', 'Waves', 'Interference', 'Light', 'Sound'],
  false,
  true
),
-- Circuit Construction Kit
(
  'circuit-construction-kit',
  'Circuit Construction Kit',
  'ឧបករណ៍សាងសង់សៀគ្វី',
  'Build circuits with resistors, light bulbs, batteries and switches. Explore circuit concepts and measure current and voltage.',
  'សាងសង់សៀគ្វីជាមួយរេស៊ីស្ទ័រ អំពូលភ្លើង ថ្ម និងកុងតាក់។ ស្វែងយល់គំនិតសៀគ្វី និងវាស់ចរន្ត និងវ៉ុល។',
  'Physics',
  'Intermediate',
  ARRAY[8, 9, 10, 11],
  45,
  ARRAY[
    'Build series and parallel circuits',
    'Understand Ohm\'s law',
    'Measure current and voltage',
    'Explore conductors and insulators'
  ],
  ARRAY[
    'សាងសង់សៀគ្វីស៊េរី និងប៉ារ៉ាឡែល',
    'យល់ដឹងច្បាប់អូម',
    'វាស់ចរន្ត និងវ៉ុល',
    'ស្វែងយល់អង្គធាតុចម្លង និងអ៊ីសូឡង់'
  ],
  '/simulations/circuit-construction',
  '/images/circuit-kit-preview.png',
  ARRAY['Physics', 'Electricity', 'Circuits', 'Current', 'Voltage'],
  true,
  true
),
-- Forces and Motion
(
  'forces-and-motion',
  'Forces and Motion',
  'កម្លាំង និងចលនា',
  'Explore forces, motion, acceleration and friction. Push objects and see how forces affect motion.',
  'ស្វែងយល់ពីកម្លាំង ចលនា សំទុះ និងកកិត។ រុញវត្ថុ និងមើលរបៀបដែលកម្លាំងប៉ះពាល់ដល់ចលនា។',
  'Physics',
  'Beginner',
  ARRAY[6, 7, 8, 9],
  30,
  ARRAY[
    'Understand Newton\'s laws of motion',
    'Explore friction effects',
    'Measure acceleration',
    'Balance forces'
  ],
  ARRAY[
    'យល់ដឹងច្បាប់ចលនារបស់ញូតុន',
    'ស្វែងយល់ពីផលប៉ះពាល់កកិត',
    'វាស់សំទុះ',
    'តុល្យភាពកម្លាំង'
  ],
  '/simulations/forces-motion',
  '/images/forces-motion-preview.png',
  ARRAY['Physics', 'Forces', 'Motion', 'Newton', 'Friction'],
  false,
  true
),
-- Energy Skate Park
(
  'energy-skate-park',
  'Energy Skate Park',
  'ឧទ្យានជិះស្គីថាមពល',
  'Learn about conservation of energy with a skater. Build tracks and explore kinetic and potential energy.',
  'រៀនអំពីការអភិរក្សថាមពលជាមួយអ្នកជិះស្គី។ សាងសង់ផ្លូវ និងស្វែងយល់ថាមពលស៊ីនេទិច និងប៉ូតង់ស្យែល។',
  'Physics',
  'Intermediate',
  ARRAY[7, 8, 9, 10],
  40,
  ARRAY[
    'Understand energy conservation',
    'Convert between kinetic and potential energy',
    'Explore friction and thermal energy',
    'Design efficient tracks'
  ],
  ARRAY[
    'យល់ដឹងការអភិរក្សថាមពល',
    'បំលែងរវាងថាមពលស៊ីនេទិច និងប៉ូតង់ស្យែល',
    'ស្វែងយល់កកិត និងថាមពលកម្តៅ',
    'រចនាផ្លូវប្រសិទ្ធភាព'
  ],
  '/simulations/energy-skate-park',
  '/images/energy-skate-preview.png',
  ARRAY['Physics', 'Energy', 'Conservation', 'Kinetic', 'Potential'],
  true,
  true
);

-- Add sample exercises for Wave Interference
DO $$
DECLARE
  sim_id UUID;
  teacher_id UUID;
BEGIN
  SELECT id INTO sim_id FROM stem_simulations_catalog WHERE simulation_name = 'wave-interference' LIMIT 1;
  SELECT id INTO teacher_id FROM users WHERE role = 'teacher' LIMIT 1;
  
  IF sim_id IS NOT NULL AND teacher_id IS NOT NULL THEN
    INSERT INTO simulation_exercises (
      simulation_id, teacher_id, question_number, question_type,
      question_en, question_km, correct_answer, points, difficulty_level,
      is_required, is_active
    ) VALUES
    (sim_id, teacher_id, 1, 'multiple_choice',
     'What happens when two wave crests meet?',
     'តើមានអ្វីកើតឡើងនៅពេលកំពូលរលកពីរជួបគ្នា?',
     'Constructive interference', 10, 'medium', true, true),
    (sim_id, teacher_id, 2, 'true_false',
     'Destructive interference occurs when a crest meets a trough.',
     'ការជ្រៀតជ្រែកបំផ្លាញកើតឡើងនៅពេលកំពូលជួបជាមួយបាតរលក។',
     'true', 10, 'easy', true, true);
  END IF;
END $$;