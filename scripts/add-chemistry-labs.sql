-- Add Chemistry lab simulations
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
-- Build a Molecule
(
  'build-a-molecule',
  'Build a Molecule',
  'សាងសង់ម៉ូលេគុល',
  'Build molecules from atoms and learn about molecular formulas. Explore how atoms bond to form molecules.',
  'សាងសង់ម៉ូលេគុលពីអាតូម និងរៀនអំពីរូបមន្តម៉ូលេគុល។ ស្វែងយល់របៀបដែលអាតូមភ្ជាប់ដើម្បីបង្កើតម៉ូលេគុល។',
  'Chemistry',
  'Beginner',
  ARRAY[7, 8, 9],
  35,
  ARRAY[
    'Understand atomic structure',
    'Build simple molecules',
    'Learn molecular formulas',
    'Explore chemical bonds'
  ],
  ARRAY[
    'យល់ដឹងរចនាសម្ព័ន្ធអាតូម',
    'សាងសង់ម៉ូលេគុលសាមញ្ញ',
    'រៀនរូបមន្តម៉ូលេគុល',
    'ស្វែងយល់ចំណងគីមី'
  ],
  '/simulations/build-molecule',
  '/images/build-molecule-preview.png',
  ARRAY['Chemistry', 'Molecules', 'Atoms', 'Bonds', 'Structure'],
  true,
  true
),
-- pH Scale
(
  'ph-scale',
  'pH Scale',
  'មាត្រដ្ឋាន pH',
  'Test pH of everyday liquids. Explore acids and bases, and learn about the pH scale.',
  'សាកល្បង pH នៃសារធាតុរាវប្រចាំថ្ងៃ។ ស្វែងយល់អាស៊ីត និងបាស និងរៀនអំពីមាត្រដ្ឋាន pH។',
  'Chemistry',
  'Intermediate',
  ARRAY[8, 9, 10],
  40,
  ARRAY[
    'Understand pH scale',
    'Identify acids and bases',
    'Test common substances',
    'Explore neutralization'
  ],
  ARRAY[
    'យល់ដឹងមាត្រដ្ឋាន pH',
    'កំណត់អាស៊ីត និងបាស',
    'សាកល្បងសារធាតុទូទៅ',
    'ស្វែងយល់អព្យាក្រឹតកម្ម'
  ],
  '/simulations/ph-scale',
  '/images/ph-scale-preview.png',
  ARRAY['Chemistry', 'pH', 'Acids', 'Bases', 'Solutions'],
  false,
  true
),
-- States of Matter
(
  'states-of-matter',
  'States of Matter',
  'សភាពរូបធាតុ',
  'Explore solid, liquid and gas states. See how temperature and pressure affect molecular behavior.',
  'ស្វែងយល់សភាពរឹង រាវ និងឧស្ម័ន។ មើលរបៀបដែលសីតុណ្ហភាព និងសម្ពាធប៉ះពាល់ដល់ឥរិយាបថម៉ូលេគុល។',
  'Chemistry',
  'Beginner',
  ARRAY[6, 7, 8],
  30,
  ARRAY[
    'Identify states of matter',
    'Understand phase transitions',
    'Explore molecular motion',
    'Effect of temperature and pressure'
  ],
  ARRAY[
    'កំណត់សភាពរូបធាតុ',
    'យល់ដឹងការផ្លាស់ប្តូរដំណាក់កាល',
    'ស្វែងយល់ចលនាម៉ូលេគុល',
    'ឥទ្ធិពលនៃសីតុណ្ហភាព និងសម្ពាធ'
  ],
  '/simulations/states-matter',
  '/images/states-matter-preview.png',
  ARRAY['Chemistry', 'States', 'Matter', 'Temperature', 'Pressure'],
  true,
  true
),
-- Concentration Lab
(
  'concentration-lab',
  'Concentration Lab',
  'មន្ទីរពិសោធន៍កំហាប់',
  'Mix solutions of different concentrations. Learn about molarity, dilution, and saturation.',
  'លាយសូលុយស្យុងនៃកំហាប់ផ្សេងៗ។ រៀនអំពីម៉ូឡារីតេ ការពន្លិច និងការឆ្អែត។',
  'Chemistry',
  'Advanced',
  ARRAY[10, 11, 12],
  50,
  ARRAY[
    'Calculate molarity',
    'Perform dilutions',
    'Understand saturation',
    'Use concentration formulas'
  ],
  ARRAY[
    'គណនាម៉ូឡារីតេ',
    'អនុវត្តការពន្លិច',
    'យល់ដឹងការឆ្អែត',
    'ប្រើរូបមន្តកំហាប់'
  ],
  '/simulations/concentration',
  '/images/concentration-preview.png',
  ARRAY['Chemistry', 'Solutions', 'Concentration', 'Molarity', 'Dilution'],
  false,
  true
);