-- Add all STEM lab simulations to the database
-- This script adds Physics, Chemistry, Biology, and Mathematics simulations

-- Physics Labs
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
    'Understand Ohm''s law',
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
    'Understand Newton''s laws of motion',
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
),
-- Chemistry Labs
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
),
-- Biology Labs
-- Natural Selection
(
  'natural-selection',
  'Natural Selection',
  'ការជ្រើសរើសធម្មជាតិ',
  'Explore how organisms evolve over time through natural selection. Control environment factors and observe adaptations.',
  'ស្វែងយល់របៀបដែលសារពាង្គកាយវិវត្តតាមរយៈការជ្រើសរើសធម្មជាតិ។ គ្រប់គ្រងកត្តាបរិស្ថាន និងសង្កេតការសម្របខ្លួន។',
  'Biology',
  'Advanced',
  ARRAY[9, 10, 11, 12],
  60,
  ARRAY[
    'Understand natural selection',
    'Explore genetic mutations',
    'Observe population changes',
    'Control environmental factors'
  ],
  ARRAY[
    'យល់ដឹងការជ្រើសរើសធម្មជាតិ',
    'ស្វែងយល់ការផ្លាស់ប្តូរហ្សែន',
    'សង្កេតការផ្លាស់ប្តូរចំនួនប្រជាជន',
    'គ្រប់គ្រងកត្តាបរិស្ថាន'
  ],
  '/simulations/natural-selection',
  '/images/natural-selection-preview.png',
  ARRAY['Biology', 'Evolution', 'Natural Selection', 'Genetics', 'Adaptation'],
  true,
  true
),
-- Gene Expression Essentials
(
  'gene-expression-essentials',
  'Gene Expression Essentials',
  'មូលដ្ឋានការបញ្ចេញហ្សែន',
  'Learn how genes create proteins. Explore transcription, translation, and protein synthesis.',
  'រៀនរបៀបដែលហ្សែនបង្កើតប្រូតេអ៊ីន។ ស្វែងយល់ការចម្លង ការបកប្រែ និងការសំយោគប្រូតេអ៊ីន។',
  'Biology',
  'Advanced',
  ARRAY[10, 11, 12],
  55,
  ARRAY[
    'Understand DNA structure',
    'Learn transcription process',
    'Explore translation',
    'Build proteins from genes'
  ],
  ARRAY[
    'យល់ដឹងរចនាសម្ព័ន្ធ DNA',
    'រៀនដំណើរការចម្លង',
    'ស្វែងយល់ការបកប្រែ',
    'សាងសង់ប្រូតេអ៊ីនពីហ្សែន'
  ],
  '/simulations/gene-expression',
  '/images/gene-expression-preview.png',
  ARRAY['Biology', 'Genetics', 'DNA', 'Proteins', 'Gene Expression'],
  false,
  true
),
-- Neuron Lab
(
  'neuron-lab',
  'Neuron Lab',
  'មន្ទីរពិសោធន៍ណឺរ៉ូន',
  'Stimulate a neuron and monitor its response. Learn about action potentials and neural communication.',
  'ជំរុញណឺរ៉ូន និងតាមដានការឆ្លើយតប។ រៀនអំពីសក្តានុពលសកម្មភាព និងការទំនាក់ទំនងប្រសាទ។',
  'Biology',
  'Intermediate',
  ARRAY[9, 10, 11],
  45,
  ARRAY[
    'Understand neuron structure',
    'Explore action potentials',
    'Learn neural communication',
    'Control stimulation parameters'
  ],
  ARRAY[
    'យល់ដឹងរចនាសម្ព័ន្ធណឺរ៉ូន',
    'ស្វែងយល់សក្តានុពលសកម្មភាព',
    'រៀនការទំនាក់ទំនងប្រសាទ',
    'គ្រប់គ្រងប៉ារ៉ាម៉ែត្រជំរុញ'
  ],
  '/simulations/neuron',
  '/images/neuron-preview.png',
  ARRAY['Biology', 'Neuroscience', 'Neurons', 'Brain', 'Nervous System'],
  false,
  true
),
-- Food Chain
(
  'food-chain',
  'Food Chain',
  'ខ្សែសង្វាក់អាហារ',
  'Build a food chain and explore energy flow in ecosystems. Balance producers, consumers, and decomposers.',
  'សាងសង់ខ្សែសង្វាក់អាហារ និងស្វែងយល់លំហូរថាមពលក្នុងប្រព័ន្ធអេកូឡូស៊ី។ តុល្យភាពអ្នកផលិត អ្នកប្រើប្រាស់ និងអ្នកបំបែក។',
  'Biology',
  'Beginner',
  ARRAY[6, 7, 8, 9],
  35,
  ARRAY[
    'Build food chains',
    'Understand energy transfer',
    'Identify ecosystem roles',
    'Explore ecological balance'
  ],
  ARRAY[
    'សាងសង់ខ្សែសង្វាក់អាហារ',
    'យល់ដឹងការផ្ទេរថាមពល',
    'កំណត់តួនាទីប្រព័ន្ធអេកូឡូស៊ី',
    'ស្វែងយល់តុល្យភាពអេកូឡូស៊ី'
  ],
  '/simulations/food-chain',
  '/images/food-chain-preview.png',
  ARRAY['Biology', 'Ecology', 'Food Chain', 'Ecosystem', 'Energy'],
  true,
  true
),
-- Mathematics Labs
-- Function Builder
(
  'function-builder',
  'Function Builder',
  'អ្នកសាងសង់មុខងារ',
  'Build and explore functions using patterns, equations, and graphs. Create mystery functions for others to solve.',
  'សាងសង់ និងស្វែងយល់មុខងារដោយប្រើលំនាំ សមីការ និងក្រាហ្វ។ បង្កើតមុខងារអាថ៌កំបាំងសម្រាប់អ្នកដទៃដោះស្រាយ។',
  'Mathematics',
  'Intermediate',
  ARRAY[8, 9, 10],
  40,
  ARRAY[
    'Build linear functions',
    'Explore function patterns',
    'Create and solve equations',
    'Understand input-output relationships'
  ],
  ARRAY[
    'សាងសង់មុខងារលីនេអ៊ែរ',
    'ស្វែងយល់លំនាំមុខងារ',
    'បង្កើត និងដោះស្រាយសមីការ',
    'យល់ដឹងទំនាក់ទំនងចូល-ចេញ'
  ],
  '/simulations/function-builder',
  '/images/function-builder-preview.png',
  ARRAY['Mathematics', 'Functions', 'Algebra', 'Equations', 'Graphs'],
  true,
  true
),
-- Graphing Lines
(
  'graphing-lines',
  'Graphing Lines',
  'គូសក្រាហ្វបន្ទាត់',
  'Explore slope and y-intercept. Graph lines using slope-intercept, point-slope, and standard forms.',
  'ស្វែងយល់ជម្រាល និងចំណុចប្រសព្វអ័ក្ស y។ គូរក្រាហ្វបន្ទាត់ដោយប្រើទម្រង់ជម្រាល-ប្រសព្វ ចំណុច-ជម្រាល និងស្តង់ដារ។',
  'Mathematics',
  'Beginner',
  ARRAY[7, 8, 9],
  35,
  ARRAY[
    'Understand slope concept',
    'Find y-intercept',
    'Graph linear equations',
    'Convert between forms'
  ],
  ARRAY[
    'យល់ដឹងគំនិតជម្រាល',
    'រកចំណុចប្រសព្វអ័ក្ស y',
    'គូរក្រាហ្វសមីការលីនេអ៊ែរ',
    'បំលែងរវាងទម្រង់'
  ],
  '/simulations/graphing-lines',
  '/images/graphing-lines-preview.png',
  ARRAY['Mathematics', 'Algebra', 'Graphing', 'Linear', 'Slope'],
  false,
  true
),
-- Area Builder
(
  'area-builder',
  'Area Builder',
  'អ្នកសាងសង់ផ្ទៃ',
  'Create shapes using unit squares and explore area and perimeter. Compare different shapes with same area.',
  'បង្កើតរូបរាងដោយប្រើការ៉េឯកតា និងស្វែងយល់ផ្ទៃ និងបរិមាត្រ។ ប្រៀបធៀបរូបរាងផ្សេងៗដែលមានផ្ទៃដូចគ្នា។',
  'Mathematics',
  'Beginner',
  ARRAY[5, 6, 7, 8],
  30,
  ARRAY[
    'Calculate area',
    'Measure perimeter',
    'Build shapes',
    'Compare areas'
  ],
  ARRAY[
    'គណនាផ្ទៃ',
    'វាស់បរិមាត្រ',
    'សាងសង់រូបរាង',
    'ប្រៀបធៀបផ្ទៃ'
  ],
  '/simulations/area-builder',
  '/images/area-builder-preview.png',
  ARRAY['Mathematics', 'Geometry', 'Area', 'Perimeter', 'Shapes'],
  true,
  true
),
-- Fraction Matcher
(
  'fraction-matcher',
  'Fraction Matcher',
  'ផ្គូផ្គងប្រភាគ',
  'Match fractions using numbers, pictures, and number lines. Build equivalent fractions and mixed numbers.',
  'ផ្គូផ្គងប្រភាគដោយប្រើលេខ រូបភាព និងបន្ទាត់លេខ។ សាងសង់ប្រភាគស្មើគ្នា និងលេខចម្រុះ។',
  'Mathematics',
  'Beginner',
  ARRAY[4, 5, 6, 7],
  25,
  ARRAY[
    'Understand fractions',
    'Find equivalent fractions',
    'Compare fractions',
    'Work with mixed numbers'
  ],
  ARRAY[
    'យល់ដឹងប្រភាគ',
    'រកប្រភាគស្មើគ្នា',
    'ប្រៀបធៀបប្រភាគ',
    'ធ្វើការជាមួយលេខចម្រុះ'
  ],
  '/simulations/fraction-matcher',
  '/images/fraction-matcher-preview.png',
  ARRAY['Mathematics', 'Fractions', 'Numbers', 'Elementary', 'Arithmetic'],
  false,
  true
),
-- Trig Tour
(
  'trig-tour',
  'Trigonometry Tour',
  'ដំណើរកម្សាន្តត្រីកោណមាត្រ',
  'Explore sine, cosine, and tangent functions using the unit circle. Visualize angle relationships.',
  'ស្វែងយល់មុខងារស៊ីនុស កូស៊ីនុស និងតង់សង់ដោយប្រើរង្វង់ឯកតា។ មើលឃើញទំនាក់ទំនងមុំ។',
  'Mathematics',
  'Advanced',
  ARRAY[10, 11, 12],
  50,
  ARRAY[
    'Understand unit circle',
    'Explore trig functions',
    'Visualize angles',
    'Connect to right triangles'
  ],
  ARRAY[
    'យល់ដឹងរង្វង់ឯកតា',
    'ស្វែងយល់មុខងារត្រីកោណមាត្រ',
    'មើលឃើញមុំ',
    'ភ្ជាប់ទៅត្រីកោណកែង'
  ],
  '/simulations/trig-tour',
  '/images/trig-tour-preview.png',
  ARRAY['Mathematics', 'Trigonometry', 'Functions', 'Angles', 'Unit Circle'],
  true,
  true
)
ON CONFLICT (simulation_name) DO UPDATE SET
  display_name_en = EXCLUDED.display_name_en,
  display_name_km = EXCLUDED.display_name_km,
  description_en = EXCLUDED.description_en,
  description_km = EXCLUDED.description_km,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;