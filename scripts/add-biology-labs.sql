-- Add Biology lab simulations
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
);