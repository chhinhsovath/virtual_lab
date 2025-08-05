-- Add the missing balancing-act simulation to complete the collection

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
(
    'balancing-act',
    'Balancing Act',
    'សកម្មភាពតុល្យភាព',
    'Play with objects on a teeter totter to learn about balance. Test what you''ve learned by trying the Balance Challenge game.',
    'លេងជាមួយវត្ថុនៅលើរទេះទឹកទល់ដើម្បីរៀនអំពីតុល្យភាព។ សាកល្បងអ្វីដែលអ្នកបានរៀនដោយព្យាយាមលេងហ្គេមបញ្ហាប្រឈមតុល្យភាព។',
    'Physics',
    'Beginner',
    '{3,4,5,6,7}',
    25,
    '{"Understand balance and equilibrium", "Learn about torque", "Apply lever principles", "Solve balance puzzles"}',
    '{"យល់ដឹងពីតុល្យភាព និងលំនឹង", "រៀនអំពីម៉ូម៉ង់", "អនុវត្តគោលការណ៍ដងថ្លឹង", "ដោះស្រាយល្បែងផ្គុំតុល្យភាព"}',
    'https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_km.html',
    'https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act-600.png',
    '{"physics", "balance", "torque", "lever", "equilibrium", "តុល្យភាព", "ម៉ូម៉ង់", "ដងថ្លឹង", "លំនឹង"}',
    true,
    true
);