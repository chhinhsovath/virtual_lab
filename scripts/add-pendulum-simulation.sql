-- Add Pendulum Lab simulation to the catalog
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
) VALUES (
  'pendulum-lab',
  'Pendulum Lab',
  'មន្ទីរពិសោធន៍ប៉ោល',
  'Explore the physics of pendulums with this interactive simulation. Adjust length, mass, and gravity to see how they affect the period.',
  'ស្វែងយល់ពីរូបវិទ្យានៃប៉ោលជាមួយការធ្វើត្រាប់តាមអន្តរកម្មនេះ។ កែតម្រូវប្រវែង ម៉ាស់ និងទំនាញដើម្បីមើលពីរបៀបដែលវាប៉ះពាល់ដល់រយៈពេល។',
  'Physics',
  'Beginner',
  ARRAY[7, 8, 9, 10, 11, 12],
  45,
  ARRAY[
    'Understand the relationship between pendulum length and period',
    'Explore how mass affects pendulum motion',
    'Investigate the effect of gravity on pendulum behavior',
    'Learn about simple harmonic motion',
    'Develop skills in scientific measurement and data collection'
  ],
  ARRAY[
    'យល់ដឹងពីទំនាក់ទំនងរវាងប្រវែងប៉ោល និងរយៈពេល',
    'ស្វែងយល់ពីរបៀបដែលម៉ាស់ប៉ះពាល់ដល់ចលនាប៉ោល',
    'ស៊ើបអង្កេតពីឥទ្ធិពលនៃទំនាញលើឥរិយាបថប៉ោល',
    'រៀនអំពីចលនាអាម៉ូនិកសាមញ្ញ',
    'អភិវឌ្ឍជំនាញក្នុងការវាស់វែងវិទ្យាសាស្ត្រ និងការប្រមូលទិន្នន័យ'
  ],
  '/simulation_pendulum_lab_km.html',
  '/images/pendulum-preview.png',
  ARRAY['Physics', 'Motion', 'Gravity', 'Harmonic Motion', 'Measurement'],
  true,
  true
) ON CONFLICT (simulation_name) DO UPDATE SET
  display_name_km = EXCLUDED.display_name_km,
  description_km = EXCLUDED.description_km,
  learning_objectives_km = EXCLUDED.learning_objectives_km,
  is_featured = EXCLUDED.is_featured,
  updated_at = CURRENT_TIMESTAMP;