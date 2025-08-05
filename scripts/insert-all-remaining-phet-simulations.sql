-- Insert remaining PhET Khmer simulations into production database
-- This adds ~100 more simulations to the existing 20

-- PHYSICS SIMULATIONS (45 new)
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

-- 1. Models of the Hydrogen Atom
(
    'models-of-the-hydrogen-atom',
    'Models of the Hydrogen Atom',
    'គំរូនៃអាតូមអ៊ីដ្រូសែន',
    'How did scientists figure out the structure of atoms without looking at them? Try out different models by shooting light at the atom. Check how the prediction of the model matches the experimental results.',
    'តើអ្នកវិទ្យាសាស្ត្របានរកឃើញរចនាសម្ព័ន្ធអាតូមដោយរបៀបណាដោយមិនមើលពួកវា? សាកល្បងគំរូផ្សេងៗដោយបាញ់ពន្លឺទៅអាតូម។ ពិនិត្យមើលថាការទស្សន៍ទាយរបស់គំរូត្រូវគ្នានឹងលទ្ធផលពិសោធន៍។',
    'Physics',
    'Advanced',
    '{11,12}',
    45,
    '{"Understand atomic models", "Learn about quantum mechanics", "Explore light-matter interaction", "Compare historical atomic models"}',
    '{"យល់ដឹងពីគំរូអាតូម", "រៀនអំពីមេកានិចកង់ទិច", "ស្វែងយល់អន្តរកម្មពន្លឺ-សារធាតុ", "ប្រៀបធៀបគំរូអាតូមប្រវត្តិសាស្ត្រ"}',
    'https://phet.colorado.edu/sims/html/models-of-the-hydrogen-atom/latest/models-of-the-hydrogen-atom_km.html',
    'https://phet.colorado.edu/sims/html/models-of-the-hydrogen-atom/latest/models-of-the-hydrogen-atom-600.png',
    '{"physics", "quantum", "atom", "hydrogen", "model", "កង់ទិច", "អាតូម", "អ៊ីដ្រូសែន", "គំរូ"}',
    false,
    true
),

-- 2. Buoyancy
(
    'buoyancy',
    'Buoyancy',
    'កម្លាំងរំកិល',
    'When will objects float and when will they sink? Learn how buoyancy works with blocks. Arrows show the applied forces, and you can modify the properties of the blocks and the fluid.',
    'តើវត្ថុនឹងអណ្តែតនៅពេលណា ហើយនឹងលិចនៅពេលណា? រៀនពីរបៀបដែលកម្លាំងរំកិលដំណើរការជាមួយប្លុក។ ព្រួញបង្ហាញកម្លាំងប្រើប្រាស់ ហើយអ្នកអាចកែប្រែលក្ខណៈសម្បត្តិនៃប្លុក និងអង្គធាតុរាវ។',
    'Physics',
    'Intermediate',
    '{8,9,10,11}',
    35,
    '{"Understand buoyancy principles", "Learn Archimedes principle", "Explore density relationships", "Analyze floating and sinking"}',
    '{"យល់ដឹងពីគោលការណ៍កម្លាំងរំកិល", "រៀនគោលការណ៍អាកីមេដ", "ស្វែងយល់ទំនាក់ទំនងដង់ស៊ីតេ", "វិភាគការអណ្តែត និងការលិច"}',
    'https://phet.colorado.edu/sims/html/buoyancy/latest/buoyancy_km.html',
    'https://phet.colorado.edu/sims/html/buoyancy/latest/buoyancy-600.png',
    '{"physics", "buoyancy", "float", "sink", "density", "កម្លាំងរំកិល", "អណ្តែត", "លិច", "ដង់ស៊ីតេ"}',
    true,
    true
),

-- 3. Generator
(
    'generator',
    'Generator',
    'ម៉ាស៊ីនភ្លើង',
    'Generate electricity with a bar magnet! Discover the physics behind the phenomena by exploring magnets and how you can use them to make a light bulb light.',
    'បង្កើតអគ្គិសនីជាមួយដែកអំបៅ! រកឃើញរូបវិទ្យាពីក្រោយបាតុភូតដោយស្វែងយល់ដែកអំបៅ និងរបៀបដែលអ្នកអាចប្រើវាដើម្បីធ្វើឲ្យអំពូលភ្លើងភ្លឺ។',
    'Physics',
    'Intermediate',
    '{9,10,11,12}',
    30,
    '{"Understand electromagnetic induction", "Learn generator principles", "Explore magnetic fields", "Apply Faradays law"}',
    '{"យល់ដឹងពីអាំងឌុចស្យុងអេឡិចត្រូម៉ាញេទិច", "រៀនគោលការណ៍ម៉ាស៊ីនភ្លើង", "ស្វែងយល់វាលម៉ាញេទិច", "អនុវត្តច្បាប់ហ្វារ៉ាដេ"}',
    'https://phet.colorado.edu/sims/html/generator/latest/generator_km.html',
    'https://phet.colorado.edu/sims/html/generator/latest/generator-600.png',
    '{"physics", "generator", "electricity", "magnetism", "induction", "ម៉ាស៊ីនភ្លើង", "អគ្គិសនី", "ម៉ាញេទិច", "អាំងឌុចស្យុង"}',
    false,
    true
),

-- 4. Magnets and Electromagnets
(
    'magnets-and-electromagnets',
    'Magnets and Electromagnets',
    'ដែកអំបៅ និងអេឡិចត្រូម៉ាញេទិច',
    'Explore the interactions between a compass and bar magnet. Discover how you can use a battery and wire to make a magnet! Can you make it a stronger magnet?',
    'ស្វែងយល់អន្តរកម្មរវាងត្រីវិស័យ និងដែកអំបៅ។ រកឃើញរបៀបដែលអ្នកអាចប្រើថ្ម និងខ្សែដើម្បីបង្កើតដែកអំបៅ! តើអ្នកអាចធ្វើឲ្យវាក្លាយជាដែកអំបៅខ្លាំងជាងមុនបានទេ?',
    'Physics',
    'Intermediate',
    '{8,9,10,11}',
    35,
    '{"Understand magnetism", "Create electromagnets", "Explore magnetic fields", "Compare permanent and electromagnets"}',
    '{"យល់ដឹងពីម៉ាញេទិច", "បង្កើតអេឡិចត្រូម៉ាញេទិច", "ស្វែងយល់វាលម៉ាញេទិច", "ប្រៀបធៀបដែកអំបៅអចិន្ត្រៃយ៍ និងអេឡិចត្រូម៉ាញេទិច"}',
    'https://phet.colorado.edu/sims/html/magnets-and-electromagnets/latest/magnets-and-electromagnets_km.html',
    'https://phet.colorado.edu/sims/html/magnets-and-electromagnets/latest/magnets-and-electromagnets-600.png',
    '{"physics", "magnets", "electromagnets", "magnetic field", "compass", "ដែកអំបៅ", "អេឡិចត្រូម៉ាញេទិច", "វាលម៉ាញេទិច", "ត្រីវិស័យ"}',
    true,
    true
),

-- 5. Magnet and Compass
(
    'magnet-and-compass',
    'Magnet and Compass',
    'ដែកអំបៅ និងត្រីវិស័យ',
    'Ever wonder how a compass works to point you to the North? Explore the interactions between a compass and bar magnet, and then add the Earth and find the surprising answer!',
    'ធ្លាប់ឆ្ងល់ថាត្រីវិស័យដំណើរការយ៉ាងណាដើម្បីចង្អុលអ្នកទៅខាងជើង? ស្វែងយល់អន្តរកម្មរវាងត្រីវិស័យ និងដែកអំបៅ បន្ទាប់មកបន្ថែមផែនដី ហើយរកឃើញចម្លើយគួរឲ្យភ្ញាក់ផ្អើល!',
    'Physics',
    'Beginner',
    '{6,7,8,9}',
    25,
    '{"Understand compass function", "Learn about Earths magnetic field", "Explore magnetic interactions", "Apply magnetic principles"}',
    '{"យល់ដឹងពីមុខងារត្រីវិស័យ", "រៀនអំពីវាលម៉ាញេទិចផែនដី", "ស្វែងយល់អន្តរកម្មម៉ាញេទិច", "អនុវត្តគោលការណ៍ម៉ាញេទិច"}',
    'https://phet.colorado.edu/sims/html/magnet-and-compass/latest/magnet-and-compass_km.html',
    'https://phet.colorado.edu/sims/html/magnet-and-compass/latest/magnet-and-compass-600.png',
    '{"physics", "magnet", "compass", "magnetic field", "Earth", "ដែកអំបៅ", "ត្រីវិស័យ", "វាលម៉ាញេទិច", "ផែនដី"}',
    false,
    true
),

-- 6. Faraday's Electromagnetic Lab
(
    'faradays-electromagnetic-lab',
    'Faraday''s Electromagnetic Lab',
    'មន្ទីរពិសោធន៍អេឡិចត្រូម៉ាញេទិចរបស់ហ្វារ៉ាដេ',
    'Play with a bar magnet and coils to learn about Faraday''s law. Move a bar magnet near one or two coils to make a light bulb glow. View the magnetic field lines.',
    'លេងជាមួយដែកអំបៅ និងរង្វិលដើម្បីរៀនអំពីច្បាប់ហ្វារ៉ាដេ។ ផ្លាស់ទីដែកអំបៅនៅជិតរង្វិលមួយ ឬពីរដើម្បីធ្វើឲ្យអំពូលភ្លើងភ្លឺ។ មើលបន្ទាត់វាលម៉ាញេទិច។',
    'Physics',
    'Advanced',
    '{10,11,12}',
    40,
    '{"Master Faradays law", "Understand electromagnetic induction", "Visualize magnetic fields", "Create electricity from magnetism"}',
    '{"ស្ទាត់ជំនាញច្បាប់ហ្វារ៉ាដេ", "យល់ដឹងពីអាំងឌុចស្យុងអេឡិចត្រូម៉ាញេទិច", "មើលឃើញវាលម៉ាញេទិច", "បង្កើតអគ្គិសនីពីម៉ាញេទិច"}',
    'https://phet.colorado.edu/sims/html/faradays-electromagnetic-lab/latest/faradays-electromagnetic-lab_km.html',
    'https://phet.colorado.edu/sims/html/faradays-electromagnetic-lab/latest/faradays-electromagnetic-lab-600.png',
    '{"physics", "Faraday", "electromagnetic", "induction", "coil", "ហ្វារ៉ាដេ", "អេឡិចត្រូម៉ាញេទិច", "អាំងឌុចស្យុង", "រង្វិល"}',
    true,
    true
),

-- 7. Sound Waves
(
    'sound-waves',
    'Sound Waves',
    'រលកសំឡេង',
    'This simulation lets you see sound waves. Adjust the frequency or volume and you can see and hear how the wave changes. Move the listener around and hear what she hears.',
    'ការក្លែងធ្វើនេះអនុញ្ញាតឲ្យអ្នកមើលរលកសំឡេង។ កែតម្រូវប្រេកង់ ឬកម្រិតសំឡេង ហើយអ្នកអាចមើល និងស្តាប់ពីរបៀបដែលរលកផ្លាស់ប្តូរ។ ផ្លាស់ទីអ្នកស្តាប់ ហើយស្តាប់អ្វីដែលនាងលឺ។',
    'Physics',
    'Intermediate',
    '{8,9,10,11}',
    30,
    '{"Understand sound waves", "Explore frequency and amplitude", "Learn about wave interference", "Analyze sound propagation"}',
    '{"យល់ដឹងពីរលកសំឡេង", "ស្វែងយល់ប្រេកង់ និងអំព្លីទុត", "រៀនអំពីការជ្រៀតជ្រែករលក", "វិភាគការរីករាលដាលសំឡេង"}',
    'https://phet.colorado.edu/sims/html/sound-waves/latest/sound-waves_km.html',
    'https://phet.colorado.edu/sims/html/sound-waves/latest/sound-waves-600.png',
    '{"physics", "sound", "waves", "frequency", "amplitude", "សំឡេង", "រលក", "ប្រេកង់", "អំព្លីទុត"}',
    true,
    true
),

-- 8. My Solar System
(
    'my-solar-system',
    'My Solar System',
    'ប្រព័ន្ធព្រះអាទិត្យរបស់ខ្ញុំ',
    'Build your own system of heavenly bodies and watch the gravitational ballet. With this orbit simulator, you can set initial positions, velocities, and masses of 2, 3, or 4 bodies, and then see them orbit each other.',
    'សាងសង់ប្រព័ន្ធតារាវត្ថុផ្ទាល់ខ្លួនរបស់អ្នក ហើយមើលរបាំទំនាញ។ ជាមួយឧបករណ៍ក្លែងធ្វើគន្លងនេះ អ្នកអាចកំណត់ទីតាំងដំបូង ល្បឿន និងម៉ាស់នៃវត្ថុ 2, 3, ឬ 4 ហើយមើលពួកវាគោចរជុំវិញគ្នា។',
    'Physics',
    'Advanced',
    '{9,10,11,12}',
    40,
    '{"Design orbital systems", "Apply gravitational laws", "Understand orbital mechanics", "Explore many-body problems"}',
    '{"រចនាប្រព័ន្ធគន្លង", "អនុវត្តច្បាប់ទំនាញ", "យល់ដឹងពីមេកានិចគន្លង", "ស្វែងយល់បញ្ហាវត្ថុច្រើន"}',
    'https://phet.colorado.edu/sims/html/my-solar-system/latest/my-solar-system_km.html',
    'https://phet.colorado.edu/sims/html/my-solar-system/latest/my-solar-system-600.png',
    '{"physics", "solar system", "gravity", "orbit", "space", "ប្រព័ន្ធព្រះអាទិត្យ", "ទំនាញ", "គន្លង", "អវកាស"}',
    false,
    true
),

-- 9. Geometric Optics: Basics
(
    'geometric-optics-basics',
    'Geometric Optics: Basics',
    'អុបទិចធរណីមាត្រ៖ មូលដ្ឋាន',
    'How does a lens or mirror form an image? See how light rays are refracted by a lens or reflected by a mirror. Observe how the image changes when you adjust the focal length, move the object, or move the screen.',
    'តើកញ្ចក់ ឬកែវបង្កើតរូបភាពដោយរបៀបណា? មើលពីរបៀបដែលកាំរស្មីពន្លឺត្រូវបានបត់ដោយកញ្ចក់ ឬឆ្លុះដោយកែវ។ សង្កេតពីរបៀបដែលរូបភាពផ្លាស់ប្តូរនៅពេលអ្នកកែតម្រូវចម្ងាយប្រមូលផ្តុំ ផ្លាស់ទីវត្ថុ ឬផ្លាស់ទីអេក្រង់។',
    'Physics',
    'Beginner',
    '{8,9,10}',
    30,
    '{"Understand lens and mirror optics", "Learn about image formation", "Explore refraction and reflection", "Apply ray diagrams"}',
    '{"យល់ដឹងពីអុបទិចកញ្ចក់ និងកែវ", "រៀនអំពីការបង្កើតរូបភាព", "ស្វែងយល់ការបត់ និងការឆ្លុះ", "អនុវត្តដ្យាក្រាមកាំរស្មី"}',
    'https://phet.colorado.edu/sims/html/geometric-optics-basics/latest/geometric-optics-basics_km.html',
    'https://phet.colorado.edu/sims/html/geometric-optics-basics/latest/geometric-optics-basics-600.png',
    '{"physics", "optics", "lens", "mirror", "light", "អុបទិច", "កញ្ចក់", "កែវ", "ពន្លឺ"}',
    true,
    true
),

-- 10. Geometric Optics
(
    'geometric-optics',
    'Geometric Optics',
    'អុបទិចធរណីមាត្រ',
    'How does a lens form an image? See how light rays are refracted by a lens. Watch how the image changes when you adjust the focal length of the lens, move the object, move the lens, or move the screen.',
    'តើកញ្ចក់បង្កើតរូបភាពដោយរបៀបណា? មើលពីរបៀបដែលកាំរស្មីពន្លឺត្រូវបានបត់ដោយកញ្ចក់។ មើលពីរបៀបដែលរូបភាពផ្លាស់ប្តូរនៅពេលអ្នកកែតម្រូវចម្ងាយប្រមូលផ្តុំនៃកញ្ចក់ ផ្លាស់ទីវត្ថុ ផ្លាស់ទីកញ្ចក់ ឬផ្លាស់ទីអេក្រង់។',
    'Physics',
    'Intermediate',
    '{9,10,11,12}',
    35,
    '{"Master lens optics", "Understand image formation", "Calculate magnification", "Apply lens equations"}',
    '{"ស្ទាត់ជំនាញអុបទិចកញ្ចក់", "យល់ដឹងពីការបង្កើតរូបភាព", "គណនាការពង្រីក", "អនុវត្តសមីការកញ្ចក់"}',
    'https://phet.colorado.edu/sims/html/geometric-optics/latest/geometric-optics_km.html',
    'https://phet.colorado.edu/sims/html/geometric-optics/latest/geometric-optics-600.png',
    '{"physics", "optics", "lens", "refraction", "image", "អុបទិច", "កញ្ចក់", "ការបត់", "រូបភាព"}',
    false,
    true
),

-- Continue with more physics simulations...
-- (Due to length, I'll continue in the next part)