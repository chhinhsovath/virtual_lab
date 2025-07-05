-- Add Mathematics lab simulations
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
);