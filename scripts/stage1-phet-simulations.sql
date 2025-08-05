-- Stage 1: First 30% of PhET Khmer simulations (30 simulations)
-- This adds the first batch to production database

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

-- PHYSICS SIMULATIONS (1-15)

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

-- 11. Circuit Construction Kit: AC
(
    'circuit-construction-kit-ac',
    'Circuit Construction Kit: AC',
    'ឧបករណ៍សាងសង់សៀគ្វី៖ AC',
    'Build circuits with capacitors, inductors, resistors and AC or DC voltage sources, and inspect them using lab instruments such as voltmeters and ammeters.',
    'សាងសង់សៀគ្វីជាមួយកុងដង់សាទ័រ អាំងឌុចទ័រ រេស៊ីស្ទ័រ និងប្រភពវ៉ុល AC ឬ DC ហើយពិនិត្យពួកវាដោយប្រើឧបករណ៍មន្ទីរពិសោធន៍ដូចជាវ៉ុលម៉ែត្រ និងអំពែរម៉ែត្រ។',
    'Physics',
    'Advanced',
    '{10,11,12}',
    45,
    '{"Build AC circuits", "Understand impedance", "Analyze phase relationships", "Use circuit instruments"}',
    '{"សាងសង់សៀគ្វី AC", "យល់ដឹងពីអាំងពេដង់", "វិភាគទំនាក់ទំនងដំណាក់កាល", "ប្រើឧបករណ៍សៀគ្វី"}',
    'https://phet.colorado.edu/sims/html/circuit-construction-kit-ac/latest/circuit-construction-kit-ac_km.html',
    'https://phet.colorado.edu/sims/html/circuit-construction-kit-ac/latest/circuit-construction-kit-ac-600.png',
    '{"physics", "circuit", "AC", "electricity", "electronics", "សៀគ្វី", "អគ្គិសនី", "អេឡិចត្រូនិច"}',
    true,
    true
),

-- 12. Circuit Construction Kit: AC - Virtual Lab
(
    'circuit-construction-kit-ac-virtual-lab',
    'Circuit Construction Kit: AC - Virtual Lab',
    'ឧបករណ៍សាងសង់សៀគ្វី៖ AC - មន្ទីរពិសោធន៍និម្មិត',
    'Build circuits with capacitors, inductors, resistors and AC or DC voltage sources, and inspect them using lab instruments such as voltmeters and ammeters.',
    'សាងសង់សៀគ្វីជាមួយកុងដង់សាទ័រ អាំងឌុចទ័រ រេស៊ីស្ទ័រ និងប្រភពវ៉ុល AC ឬ DC ហើយពិនិត្យពួកវាដោយប្រើឧបករណ៍មន្ទីរពិសោធន៍ដូចជាវ៉ុលម៉ែត្រ និងអំពែរម៉ែត្រ។',
    'Physics',
    'Advanced',
    '{10,11,12}',
    50,
    '{"Design complex AC circuits", "Measure circuit parameters", "Analyze frequency response", "Troubleshoot circuits"}',
    '{"រចនាសៀគ្វី AC ស្មុគស្មាញ", "វាស់ប៉ារ៉ាម៉ែត្រសៀគ្វី", "វិភាគការឆ្លើយតបប្រេកង់", "ដោះស្រាយបញ្ហាសៀគ្វី"}',
    'https://phet.colorado.edu/sims/html/circuit-construction-kit-ac-virtual-lab/latest/circuit-construction-kit-ac-virtual-lab_km.html',
    'https://phet.colorado.edu/sims/html/circuit-construction-kit-ac-virtual-lab/latest/circuit-construction-kit-ac-virtual-lab-600.png',
    '{"physics", "circuit", "AC", "virtual lab", "electronics", "សៀគ្វី", "មន្ទីរពិសោធន៍និម្មិត", "អេឡិចត្រូនិច"}',
    false,
    true
),

-- 13. Gravity Force Lab: Basics
(
    'gravity-force-lab-basics',
    'Gravity Force Lab: Basics',
    'មន្ទីរពិសោធន៍កម្លាំងទំនាញ៖ មូលដ្ឋាន',
    'Visualize the gravitational force that two objects exert on each other. Change properties of the objects in order to see how it changes the gravity force.',
    'មើលឃើញកម្លាំងទំនាញដែលវត្ថុពីរបញ្ចេញលើគ្នាទៅវិញទៅមក។ ផ្លាស់ប្តូរលក្ខណៈសម្បត្តិនៃវត្ថុដើម្បីមើលពីរបៀបដែលវាផ្លាស់ប្តូរកម្លាំងទំនាញ។',
    'Physics',
    'Beginner',
    '{7,8,9,10}',
    25,
    '{"Understand gravitational force", "Explore mass relationships", "Learn inverse square law", "Apply Newton''s law of gravitation"}',
    '{"យល់ដឹងពីកម្លាំងទំនាញ", "ស្វែងយល់ទំនាក់ទំនងម៉ាស់", "រៀនច្បាប់ការេច្រាស", "អនុវត្តច្បាប់ទំនាញរបស់ញូតុន"}',
    'https://phet.colorado.edu/sims/html/gravity-force-lab-basics/latest/gravity-force-lab-basics_km.html',
    'https://phet.colorado.edu/sims/html/gravity-force-lab-basics/latest/gravity-force-lab-basics-600.png',
    '{"physics", "gravity", "force", "mass", "Newton", "ទំនាញ", "កម្លាំង", "ម៉ាស់", "ញូតុន"}',
    true,
    true
),

-- 14. Waves Intro
(
    'waves-intro',
    'Waves Intro',
    'ការណែនាំរលក',
    'Make waves with water, sound, and light and see how they are related. Design an experiment to measure the speed of the wave.',
    'បង្កើតរលកជាមួយទឹក សំឡេង និងពន្លឺ ហើយមើលពីរបៀបដែលពួកវាទាក់ទងគ្នា។ រចនាការពិសោធន៍ដើម្បីវាស់ល្បឿនរលក។',
    'Physics',
    'Beginner',
    '{7,8,9,10}',
    30,
    '{"Understand wave basics", "Compare wave types", "Measure wave properties", "Design wave experiments"}',
    '{"យល់ដឹងពីមូលដ្ឋានរលក", "ប្រៀបធៀបប្រភេទរលក", "វាស់លក្ខណៈសម្បត្តិរលក", "រចនាការពិសោធន៍រលក"}',
    'https://phet.colorado.edu/sims/html/waves-intro/latest/waves-intro_km.html',
    'https://phet.colorado.edu/sims/html/waves-intro/latest/waves-intro-600.png',
    '{"physics", "waves", "water", "sound", "light", "រលក", "ទឹក", "សំឡេង", "ពន្លឺ"}',
    true,
    true
),

-- 15. Gas Properties
(
    'gas-properties',
    'Gas Properties',
    'លក្ខណៈសម្បត្តិឧស្ម័ន',
    'Pump gas molecules to a box and see what happens as you change the volume, add or remove heat, and more. Measure the temperature and pressure, and discover how the properties of the gas vary in relation to each other.',
    'បូមម៉ូលេគុលឧស្ម័នទៅក្នុងប្រអប់ ហើយមើលអ្វីដែលកើតឡើងនៅពេលអ្នកផ្លាស់ប្តូរមាឌ បន្ថែម ឬដកកំដៅ និងច្រើនទៀត។ វាស់សីតុណ្ហភាព និងសម្ពាធ ហើយរកឃើញពីរបៀបដែលលក្ខណៈសម្បត្តិឧស្ម័នប្រែប្រួលទាក់ទងគ្នា។',
    'Physics',
    'Intermediate',
    '{9,10,11,12}',
    35,
    '{"Understand gas laws", "Explore PVT relationships", "Apply kinetic theory", "Analyze molecular behavior"}',
    '{"យល់ដឹងពីច្បាប់ឧស្ម័ន", "ស្វែងយល់ទំនាក់ទំនង PVT", "អនុវត្តទ្រឹស្តីស៊ីនេទិច", "វិភាគឥរិយាបថម៉ូលេគុល"}',
    'https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_km.html',
    'https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties-600.png',
    '{"physics", "gas", "pressure", "temperature", "volume", "ឧស្ម័ន", "សម្ពាធ", "សីតុណ្ហភាព", "មាឌ"}',
    true,
    true
),

-- CHEMISTRY SIMULATIONS (16-25)

-- 16. Molecule Polarity
(
    'molecule-polarity',
    'Molecule Polarity',
    'ប៉ូលនៃម៉ូលេគុល',
    'When is a molecule polar? Change the electronegativity of atoms in a molecule to see how it affects polarity. See how the molecule behaves in an electric field.',
    'តើម៉ូលេគុលមានប៉ូលនៅពេលណា? ផ្លាស់ប្តូរអេឡិចត្រូអវិជ្ជមាននៃអាតូមក្នុងម៉ូលេគុលដើម្បីមើលពីរបៀបដែលវាប៉ះពាល់ដល់ប៉ូល។ មើលពីរបៀបដែលម៉ូលេគុលមានឥរិយាបថក្នុងវាលអគ្គិសនី។',
    'Chemistry',
    'Intermediate',
    '{10,11,12}',
    30,
    '{"Understand molecular polarity", "Explore electronegativity", "Predict molecular behavior", "Apply dipole concepts"}',
    '{"យល់ដឹងពីប៉ូលម៉ូលេគុល", "ស្វែងយល់អេឡិចត្រូអវិជ្ជមាន", "ទស្សន៍ទាយឥរិយាបថម៉ូលេគុល", "អនុវត្តគំនិតឌីប៉ូល"}',
    'https://phet.colorado.edu/sims/html/molecule-polarity/latest/molecule-polarity_km.html',
    'https://phet.colorado.edu/sims/html/molecule-polarity/latest/molecule-polarity-600.png',
    '{"chemistry", "polarity", "molecule", "electronegativity", "dipole", "ប៉ូល", "ម៉ូលេគុល", "អេឡិចត្រូអវិជ្ជមាន", "ឌីប៉ូល"}',
    false,
    true
),

-- 17. Molecules and Light
(
    'molecules-and-light',
    'Molecules and Light',
    'ម៉ូលេគុល និងពន្លឺ',
    'Do you ever wonder how greenhouse gases trap heat in the atmosphere? Explore how light interacts with molecules in our atmosphere.',
    'តើអ្នកធ្លាប់ឆ្ងល់ថាឧស្ម័នផ្ទះកញ្ចក់ចាប់កំដៅក្នុងបរិយាកាសដោយរបៀបណា? ស្វែងយល់ពីរបៀបដែលពន្លឺមានអន្តរកម្មជាមួយម៉ូលេគុលក្នុងបរិយាកាសរបស់យើង។',
    'Chemistry',
    'Intermediate',
    '{9,10,11,12}',
    30,
    '{"Understand light-molecule interactions", "Learn about greenhouse effect", "Explore molecular vibrations", "Apply energy absorption concepts"}',
    '{"យល់ដឹងពីអន្តរកម្មពន្លឺ-ម៉ូលេគុល", "រៀនអំពីឥទ្ធិពលផ្ទះកញ្ចក់", "ស្វែងយល់រំញ័រម៉ូលេគុល", "អនុវត្តគំនិតស្រូបថាមពល"}',
    'https://phet.colorado.edu/sims/html/molecules-and-light/latest/molecules-and-light_km.html',
    'https://phet.colorado.edu/sims/html/molecules-and-light/latest/molecules-and-light-600.png',
    '{"chemistry", "molecules", "light", "greenhouse", "atmosphere", "ម៉ូលេគុល", "ពន្លឺ", "ផ្ទះកញ្ចក់", "បរិយាកាស"}',
    true,
    true
),

-- 18. Reactants, Products and Leftovers
(
    'reactants-products-and-leftovers',
    'Reactants, Products and Leftovers',
    'សារធាតុប្រតិកម្ម ផលិតផល និងសំណល់',
    'Create your own sandwich and then see how many sandwiches you can make with different amounts of ingredients. Do the same with chemical reactions.',
    'បង្កើតសាំងវិចផ្ទាល់ខ្លួនរបស់អ្នក បន្ទាប់មកមើលថាអ្នកអាចធ្វើសាំងវិចប៉ុន្មានជាមួយបរិមាណគ្រឿងផ្សំផ្សេងៗ។ ធ្វើដូចគ្នាជាមួយប្រតិកម្មគីមី។',
    'Chemistry',
    'Beginner',
    '{8,9,10,11}',
    25,
    '{"Understand stoichiometry basics", "Learn limiting reactants", "Balance chemical equations", "Apply conservation of mass"}',
    '{"យល់ដឹងពីមូលដ្ឋានស្តូអ៊ីចូម៉ែត្រី", "រៀនសារធាតុប្រតិកម្មកំណត់", "តុល្យភាពសមីការគីមី", "អនុវត្តការអភិរក្សម៉ាស់"}',
    'https://phet.colorado.edu/sims/html/reactants-products-and-leftovers/latest/reactants-products-and-leftovers_km.html',
    'https://phet.colorado.edu/sims/html/reactants-products-and-leftovers/latest/reactants-products-and-leftovers-600.png',
    '{"chemistry", "reactions", "stoichiometry", "limiting reactant", "products", "ប្រតិកម្ម", "ស្តូអ៊ីចូម៉ែត្រី", "សារធាតុកំណត់", "ផលិតផល"}',
    true,
    true
),

-- 19. Acid-Base Solutions
(
    'acid-base-solutions',
    'Acid-Base Solutions',
    'សូលុយស្យុងអាស៊ីត-បាស',
    'How do strong and weak acids differ? Use lab tools on your computer to find out! Dip the paper or the probe into solution to measure the pH.',
    'តើអាស៊ីតខ្លាំង និងខ្សោយខុសគ្នាយ៉ាងណា? ប្រើឧបករណ៍មន្ទីរពិសោធន៍នៅលើកុំព្យូទ័ររបស់អ្នកដើម្បីរកឃើញ! ជ្រលក់ក្រដាស ឬឧបករណ៍ស្ទង់ទៅក្នុងសូលុយស្យុងដើម្បីវាស់ pH។',
    'Chemistry',
    'Intermediate',
    '{10,11,12}',
    35,
    '{"Understand acid-base chemistry", "Measure and interpret pH", "Compare strong and weak acids/bases", "Apply equilibrium concepts"}',
    '{"យល់ដឹងពីគីមីអាស៊ីត-បាស", "វាស់ និងបកស្រាយ pH", "ប្រៀបធៀបអាស៊ីត/បាសខ្លាំង និងខ្សោយ", "អនុវត្តគំនិតលំនឹង"}',
    'https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_km.html',
    'https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions-600.png',
    '{"chemistry", "acid", "base", "pH", "equilibrium", "អាស៊ីត", "បាស", "pH", "លំនឹង"}',
    false,
    true
),

-- 20. Molarity
(
    'molarity',
    'Molarity',
    'ម៉ូលារីតេ',
    'What determines the concentration of a solution? Learn about the relationships between moles, liters, and molarity by adjusting the amount of solute and solution volume.',
    'អ្វីកំណត់កំហាប់នៃសូលុយស្យុង? រៀនអំពីទំនាក់ទំនងរវាងម៉ូល លីត្រ និងម៉ូលារីតេដោយកែតម្រូវបរិមាណសារធាតុរលាយ និងមាឌសូលុយស្យុង។',
    'Chemistry',
    'Intermediate',
    '{9,10,11,12}',
    30,
    '{"Calculate molarity", "Understand solution concentration", "Apply dilution principles", "Master mole concepts"}',
    '{"គណនាម៉ូលារីតេ", "យល់ដឹងពីកំហាប់សូលុយស្យុង", "អនុវត្តគោលការណ៍រលាយ", "ស្ទាត់ជំនាញគំនិតម៉ូល"}',
    'https://phet.colorado.edu/sims/html/molarity/latest/molarity_km.html',
    'https://phet.colorado.edu/sims/html/molarity/latest/molarity-600.png',
    '{"chemistry", "molarity", "concentration", "solution", "moles", "ម៉ូលារីតេ", "កំហាប់", "សូលុយស្យុង", "ម៉ូល"}',
    true,
    true
),

-- 21. Build a Nucleus
(
    'build-a-nucleus',
    'Build a Nucleus',
    'សាងសង់នុយក្លេអ៊ែរ',
    'Build an atom out of protons, neutrons, and electrons, and see how the nucleus and the electron cloud change. Then play a game to test your ideas!',
    'សាងសង់អាតូមពីប្រូតុង នឺត្រុង និងអេឡិចត្រុង ហើយមើលពីរបៀបដែលនុយក្លេអ៊ែរ និងពពកអេឡិចត្រុងផ្លាស់ប្តូរ។ បន្ទាប់មកលេងហ្គេមដើម្បីសាកល្បងគំនិតរបស់អ្នក!',
    'Chemistry',
    'Beginner',
    '{7,8,9,10}',
    25,
    '{"Build atomic nuclei", "Understand nuclear stability", "Learn isotope concepts", "Explore radioactivity basics"}',
    '{"សាងសង់នុយក្លេអ៊ែរអាតូម", "យល់ដឹងពីស្ថិរភាពនុយក្លេអ៊ែរ", "រៀនគំនិតអ៊ីសូតូប", "ស្វែងយល់មូលដ្ឋានវិទ្យុសកម្ម"}',
    'https://phet.colorado.edu/sims/html/build-a-nucleus/latest/build-a-nucleus_km.html',
    'https://phet.colorado.edu/sims/html/build-a-nucleus/latest/build-a-nucleus-600.png',
    '{"chemistry", "nucleus", "proton", "neutron", "isotope", "នុយក្លេអ៊ែរ", "ប្រូតុង", "នឺត្រុង", "អ៊ីសូតូប"}',
    false,
    true
),

-- 22. Build a Molecule
(
    'build-a-molecule',
    'Build a Molecule',
    'សាងសង់ម៉ូលេគុល',
    'Starting from atoms, see how many molecules you can build. Collect your molecules and see them in 3D!',
    'ចាប់ផ្តើមពីអាតូម មើលថាអ្នកអាចសាងសង់ម៉ូលេគុលប៉ុន្មាន។ ប្រមូលម៉ូលេគុលរបស់អ្នក ហើយមើលពួកវាក្នុង 3D!',
    'Chemistry',
    'Beginner',
    '{7,8,9,10}',
    30,
    '{"Build molecular structures", "Understand chemical bonding", "Learn molecular formulas", "Visualize 3D molecules"}',
    '{"សាងសង់រចនាសម្ព័ន្ធម៉ូលេគុល", "យល់ដឹងពីចំណងគីមី", "រៀនរូបមន្តម៉ូលេគុល", "មើលឃើញម៉ូលេគុល 3D"}',
    'https://phet.colorado.edu/sims/html/build-a-molecule/latest/build-a-molecule_km.html',
    'https://phet.colorado.edu/sims/html/build-a-molecule/latest/build-a-molecule-600.png',
    '{"chemistry", "molecule", "bonding", "3D", "structure", "ម៉ូលេគុល", "ចំណង", "3D", "រចនាសម្ព័ន្ធ"}',
    true,
    true
),

-- 23. Diffusion
(
    'diffusion',
    'Diffusion',
    'ការសាយភាយ',
    'Mix two gases to explore diffusion! Experiment with concentration, temperature, mass, and radius and determine how these factors affect the rate of diffusion.',
    'លាយឧស្ម័នពីរដើម្បីស្វែងយល់ការសាយភាយ! ពិសោធន៍ជាមួយកំហាប់ សីតុណ្ហភាព ម៉ាស់ និងកាំ ហើយកំណត់ថាកត្តាទាំងនេះប៉ះពាល់ដល់អត្រាការសាយភាយយ៉ាងណា។',
    'Chemistry',
    'Intermediate',
    '{9,10,11,12}',
    30,
    '{"Understand diffusion process", "Explore factors affecting diffusion", "Apply kinetic theory", "Analyze molecular motion"}',
    '{"យល់ដឹងពីដំណើរការសាយភាយ", "ស្វែងយល់កត្តាប៉ះពាល់ការសាយភាយ", "អនុវត្តទ្រឹស្តីស៊ីនេទិច", "វិភាគចលនាម៉ូលេគុល"}',
    'https://phet.colorado.edu/sims/html/diffusion/latest/diffusion_km.html',
    'https://phet.colorado.edu/sims/html/diffusion/latest/diffusion-600.png',
    '{"chemistry", "diffusion", "gas", "kinetic theory", "molecular motion", "ការសាយភាយ", "ឧស្ម័ន", "ទ្រឹស្តីស៊ីនេទិច", "ចលនាម៉ូលេគុល"}',
    false,
    true
),

-- 24. Gases Intro
(
    'gases-intro',
    'Gases Intro',
    'ការណែនាំឧស្ម័ន',
    'Pump gas molecules to a box and see what happens as you change the volume, add or remove heat, change gravity, and more.',
    'បូមម៉ូលេគុលឧស្ម័នទៅក្នុងប្រអប់ ហើយមើលអ្វីដែលកើតឡើងនៅពេលអ្នកផ្លាស់ប្តូរមាឌ បន្ថែម ឬដកកំដៅ ផ្លាស់ប្តូរទំនាញ និងច្រើនទៀត។',
    'Chemistry',
    'Beginner',
    '{8,9,10}',
    25,
    '{"Learn gas behavior basics", "Understand pressure-volume relationships", "Explore temperature effects", "Apply ideal gas concepts"}',
    '{"រៀនមូលដ្ឋានឥរិយាបថឧស្ម័ន", "យល់ដឹងទំនាក់ទំនងសម្ពាធ-មាឌ", "ស្វែងយល់ឥទ្ធិពលសីតុណ្ហភាព", "អនុវត្តគំនិតឧស្ម័នឧត្តមគតិ"}',
    'https://phet.colorado.edu/sims/html/gases-intro/latest/gases-intro_km.html',
    'https://phet.colorado.edu/sims/html/gases-intro/latest/gases-intro-600.png',
    '{"chemistry", "gas", "pressure", "volume", "temperature", "ឧស្ម័ន", "សម្ពាធ", "មាឌ", "សីតុណ្ហភាព"}',
    true,
    true
),

-- 25. Isotopes and Atomic Mass
(
    'isotopes-and-atomic-mass',
    'Isotopes and Atomic Mass',
    'អ៊ីសូតូប និងម៉ាស់អាតូម',
    'Are all atoms of an element the same? How can you tell one isotope from another? Use the sim to learn about isotopes and how abundance relates to the average atomic mass of an element.',
    'តើអាតូមទាំងអស់នៃធាតុមួយដូចគ្នាទេ? តើអ្នកអាចប្រាប់អ៊ីសូតូបមួយពីមួយទៀតដោយរបៀបណា? ប្រើការក្លែងធ្វើដើម្បីរៀនអំពីអ៊ីសូតូប និងរបៀបដែលភាពស៊ុីស៊ីវទាក់ទងនឹងម៉ាស់អាតូមមធ្យមនៃធាតុ។',
    'Chemistry',
    'Intermediate',
    '{9,10,11,12}',
    30,
    '{"Understand isotope concepts", "Calculate average atomic mass", "Explore mass spectrometry", "Apply abundance calculations"}',
    '{"យល់ដឹងពីគំនិតអ៊ីសូតូប", "គណនាម៉ាស់អាតូមមធ្យម", "ស្វែងយល់ស្ប៉ិចត្រូម៉ែត្រម៉ាស់", "អនុវត្តការគណនាភាពស៊ុីស៊ីវ"}',
    'https://phet.colorado.edu/sims/html/isotopes-and-atomic-mass/latest/isotopes-and-atomic-mass_km.html',
    'https://phet.colorado.edu/sims/html/isotopes-and-atomic-mass/latest/isotopes-and-atomic-mass-600.png',
    '{"chemistry", "isotope", "atomic mass", "abundance", "element", "អ៊ីសូតូប", "ម៉ាស់អាតូម", "ភាពស៊ុីស៊ីវ", "ធាតុ"}',
    false,
    true
),

-- MATHEMATICS SIMULATIONS (26-30)

-- 26. Quantum Coin Toss
(
    'quantum-coin-toss',
    'Quantum Coin Toss',
    'ការបោះកាក់កង់ទិច',
    'Explore the behavior of quantum particles in this interactive coin toss simulation. See how quantum superposition differs from classical probability.',
    'ស្វែងយល់ឥរិយាបថនៃភាគល្អិតកង់ទិចក្នុងការក្លែងធ្វើការបោះកាក់អន្តរកម្មនេះ។ មើលពីរបៀបដែលការត្រួតគ្នាកង់ទិចខុសពីប្រូបាប៊ីលីតេបុរាណ។',
    'Mathematics',
    'Advanced',
    '{11,12}',
    30,
    '{"Understand quantum probability", "Explore superposition", "Compare classical vs quantum", "Learn quantum basics"}',
    '{"យល់ដឹងពីប្រូបាប៊ីលីតេកង់ទិច", "ស្វែងយល់ការត្រួតគ្នា", "ប្រៀបធៀបបុរាណ និងកង់ទិច", "រៀនមូលដ្ឋានកង់ទិច"}',
    'https://phet.colorado.edu/sims/html/quantum-coin-toss/latest/quantum-coin-toss_km.html',
    'https://phet.colorado.edu/sims/html/quantum-coin-toss/latest/quantum-coin-toss-600.png',
    '{"mathematics", "quantum", "probability", "superposition", "coin", "កង់ទិច", "ប្រូបាប៊ីលីតេ", "ការត្រួតគ្នា", "កាក់"}',
    false,
    true
),

-- 27. Number Pairs
(
    'number-pairs',
    'Number Pairs',
    'គូលេខ',
    'Build number sense by exploring the relationships between numbers. Practice addition and subtraction with engaging visual representations.',
    'បង្កើតការយល់ដឹងពីលេខដោយស្វែងយល់ទំនាក់ទំនងរវាងលេខ។ អនុវត្តការបូក និងដកជាមួយតំណាងរូបភាពគួរឲ្យចាប់អារម្មណ៍។',
    'Mathematics',
    'Beginner',
    '{1,2,3,4}',
    20,
    '{"Build number sense", "Practice addition and subtraction", "Understand number relationships", "Develop mental math"}',
    '{"បង្កើតការយល់ដឹងពីលេខ", "អនុវត្តការបូក និងដក", "យល់ដឹងទំនាក់ទំនងលេខ", "អភិវឌ្ឍគណិតផ្លូវចិត្ត"}',
    'https://phet.colorado.edu/sims/html/number-pairs/latest/number-pairs_km.html',
    'https://phet.colorado.edu/sims/html/number-pairs/latest/number-pairs-600.png',
    '{"mathematics", "numbers", "addition", "subtraction", "pairs", "លេខ", "ការបូក", "ការដក", "គូ"}',
    true,
    true
),

-- 28. Quantum Measurement
(
    'quantum-measurement',
    'Quantum Measurement',
    'ការវាស់វែងកង់ទិច',
    'Explore the probabilistic nature of quantum measurements and how observation affects quantum states.',
    'ស្វែងយល់ធម្មជាតិប្រូបាប៊ីលីតេនៃការវាស់វែងកង់ទិច និងរបៀបដែលការសង្កេតប៉ះពាល់ដល់ស្ថានភាពកង់ទិច។',
    'Mathematics',
    'Advanced',
    '{11,12}',
    35,
    '{"Understand quantum measurement", "Explore wave function collapse", "Learn measurement postulates", "Apply quantum concepts"}',
    '{"យល់ដឹងពីការវាស់វែងកង់ទិច", "ស្វែងយល់ការដួលរលំមុខងាររលក", "រៀនការសន្មតវាស់វែង", "អនុវត្តគំនិតកង់ទិច"}',
    'https://phet.colorado.edu/sims/html/quantum-measurement/latest/quantum-measurement_km.html',
    'https://phet.colorado.edu/sims/html/quantum-measurement/latest/quantum-measurement-600.png',
    '{"mathematics", "quantum", "measurement", "probability", "wavefunction", "កង់ទិច", "ការវាស់វែង", "ប្រូបាប៊ីលីតេ", "មុខងាររលក"}',
    false,
    true
),

-- 29. Mean: Share and Balance
(
    'mean-share-and-balance',
    'Mean: Share and Balance',
    'មធ្យម៖ ចែករំលែក និងតុល្យភាព',
    'Explore the mean (average) through fair sharing and balancing. Move blocks to see how the mean changes.',
    'ស្វែងយល់មធ្យម (មធ្យមភាគ) តាមរយៈការចែករំលែកយុត្តិធម៌ និងតុល្យភាព។ ផ្លាស់ទីប្លុកដើម្បីមើលពីរបៀបដែលមធ្យមផ្លាស់ប្តូរ។',
    'Mathematics',
    'Intermediate',
    '{5,6,7,8}',
    25,
    '{"Understand mean concept", "Practice calculating averages", "Visualize data distribution", "Apply fairness concepts"}',
    '{"យល់ដឹងពីគំនិតមធ្យម", "អនុវត្តការគណនាមធ្យមភាគ", "មើលឃើញការបែងចែកទិន្នន័យ", "អនុវត្តគំនិតយុត្តិធម៌"}',
    'https://phet.colorado.edu/sims/html/mean-share-and-balance/latest/mean-share-and-balance_km.html',
    'https://phet.colorado.edu/sims/html/mean-share-and-balance/latest/mean-share-and-balance-600.png',
    '{"mathematics", "mean", "average", "statistics", "balance", "មធ្យម", "មធ្យមភាគ", "ស្ថិតិ", "តុល្យភាព"}',
    true,
    true
),

-- 30. Projectile Sampling Distributions
(
    'projectile-sampling-distributions',
    'Projectile Sampling Distributions',
    'ការបែងចែកគំរូគ្រាប់កាំភ្លើង',
    'Explore how sample size affects the distribution of sample means in projectile motion experiments.',
    'ស្វែងយល់ពីរបៀបដែលទំហំគំរូប៉ះពាល់ដល់ការបែងចែកមធ្យមគំរូក្នុងការពិសោធន៍ចលនាគ្រាប់កាំភ្លើង។',
    'Mathematics',
    'Advanced',
    '{11,12}',
    40,
    '{"Understand sampling distributions", "Explore central limit theorem", "Analyze sample statistics", "Apply statistical inference"}',
    '{"យល់ដឹងពីការបែងចែកគំរូ", "ស្វែងយល់ទ្រឹស្តីបទដែនកណ្តាល", "វិភាគស្ថិតិគំរូ", "អនុវត្តការសន្និដ្ឋានស្ថិតិ"}',
    'https://phet.colorado.edu/sims/html/projectile-sampling-distributions/latest/projectile-sampling-distributions_km.html',
    'https://phet.colorado.edu/sims/html/projectile-sampling-distributions/latest/projectile-sampling-distributions-600.png',
    '{"mathematics", "statistics", "sampling", "distribution", "projectile", "ស្ថិតិ", "គំរូ", "ការបែងចែក", "គ្រាប់កាំភ្លើង"}',
    false,
    true
);