-- Stage 3: Final 40% of PhET Khmer simulations (40 simulations)
-- This adds the final batch to production database

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

-- PHYSICS SIMULATIONS CONTINUED (61-75)

-- 61. Balloons and Static Electricity
(
    'balloons-and-static-electricity',
    'Balloons and Static Electricity',
    'ប៉ោង និងអគ្គិសនីស្តាទិច',
    'Why does a balloon stick to your sweater? Rub a balloon on a sweater, then let go of the balloon and it flies over and sticks to the sweater.',
    'ហេតុអ្វីបានជាប៉ោងជាប់នឹងអាវយឺតរបស់អ្នក? ត្រដុសប៉ោងលើអាវយឺត បន្ទាប់មកលែងប៉ោង ហើយវាហោះទៅជាប់នឹងអាវយឺត។',
    'Physics',
    'Beginner',
    '{6,7,8,9}',
    20,
    '{"Understand static electricity", "Explore charge transfer", "Learn about attraction", "Apply electrostatic concepts"}',
    '{"យល់ដឹងពីអគ្គិសនីស្តាទិច", "ស្វែងយល់ការផ្ទេរបន្ទុក", "រៀនអំពីការទាក់ទាញ", "អនុវត្តគំនិតអេឡិចត្រូស្តាទិច"}',
    'https://phet.colorado.edu/sims/html/balloons-and-static-electricity/latest/balloons-and-static-electricity_km.html',
    'https://phet.colorado.edu/sims/html/balloons-and-static-electricity/latest/balloons-and-static-electricity-600.png',
    '{"physics", "static electricity", "balloons", "charge", "attraction", "អគ្គិសនីស្តាទិច", "ប៉ោង", "បន្ទុក", "ការទាក់ទាញ"}',
    true,
    true
),

-- 62. Ohm's Law
(
    'ohms-law',
    'Ohm''s Law',
    'ច្បាប់អូម',
    'See how the equation form of Ohm''s law relates to a simple circuit. Adjust the voltage and resistance, and see the current change according to Ohm''s law.',
    'មើលពីរបៀបដែលទម្រង់សមីការនៃច្បាប់អូមទាក់ទងនឹងសៀគ្វីសាមញ្ញ។ កែតម្រូវវ៉ុល និងរេស៊ីស្តង់ ហើយមើលការផ្លាស់ប្តូរចរន្តតាមច្បាប់អូម។',
    'Physics',
    'Intermediate',
    '{9,10,11}',
    25,
    '{"Master Ohm''s law", "Calculate current, voltage, resistance", "Build circuit understanding", "Apply V=IR"}',
    '{"ស្ទាត់ជំនាញច្បាប់អូម", "គណនាចរន្ត វ៉ុល រេស៊ីស្តង់", "បង្កើតការយល់ដឹងសៀគ្វី", "អនុវត្ត V=IR"}',
    'https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_km.html',
    'https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law-600.png',
    '{"physics", "Ohm law", "electricity", "circuit", "resistance", "ច្បាប់អូម", "អគ្គិសនី", "សៀគ្វី", "រេស៊ីស្តង់"}',
    true,
    true
),

-- 63. Resistance in a Wire
(
    'resistance-in-a-wire',
    'Resistance in a Wire',
    'រេស៊ីស្តង់ក្នុងខ្សែ',
    'Learn about the physics of resistance in a wire. Change its resistivity, length, and area to see how they affect the wire''s resistance.',
    'រៀនអំពីរូបវិទ្យានៃរេស៊ីស្តង់ក្នុងខ្សែ។ ផ្លាស់ប្តូររេស៊ីស្ទីវីតេ ប្រវែង និងផ្ទៃកាត់ដើម្បីមើលពីរបៀបដែលវាប៉ះពាល់ដល់រេស៊ីស្តង់របស់ខ្សែ។',
    'Physics',
    'Intermediate',
    '{10,11,12}',
    30,
    '{"Understand resistance factors", "Apply resistance formula", "Explore material properties", "Calculate wire resistance"}',
    '{"យល់ដឹងពីកត្តារេស៊ីស្តង់", "អនុវត្តរូបមន្តរេស៊ីស្តង់", "ស្វែងយល់លក្ខណៈសម្បត្តិសម្ភារៈ", "គណនារេស៊ីស្តង់ខ្សែ"}',
    'https://phet.colorado.edu/sims/html/resistance-in-a-wire/latest/resistance-in-a-wire_km.html',
    'https://phet.colorado.edu/sims/html/resistance-in-a-wire/latest/resistance-in-a-wire-600.png',
    '{"physics", "resistance", "wire", "electricity", "resistivity", "រេស៊ីស្តង់", "ខ្សែ", "អគ្គិសនី", "រេស៊ីស្ទីវីតេ"}',
    false,
    true
),

-- 64. Buoyancy: Basics
(
    'buoyancy-basics',
    'Buoyancy: Basics',
    'កម្លាំងរំកិល៖ មូលដ្ឋាន',
    'Explore why some things float and others sink! Learn how buoyancy works with blocks of different materials in water.',
    'ស្វែងយល់ហេតុអ្វីវត្ថុខ្លះអណ្តែត និងខ្លះទៀតលិច! រៀនពីរបៀបដែលកម្លាំងរំកិលដំណើរការជាមួយប្លុកសម្ភារៈផ្សេងៗក្នុងទឹក។',
    'Physics',
    'Beginner',
    '{6,7,8}',
    25,
    '{"Learn buoyancy basics", "Predict floating and sinking", "Understand density", "Apply Archimedes principle"}',
    '{"រៀនមូលដ្ឋានកម្លាំងរំកិល", "ទស្សន៍ទាយការអណ្តែត និងលិច", "យល់ដឹងពីដង់ស៊ីតេ", "អនុវត្តគោលការណ៍អាកីមេដ"}',
    'https://phet.colorado.edu/sims/html/buoyancy-basics/latest/buoyancy-basics_km.html',
    'https://phet.colorado.edu/sims/html/buoyancy-basics/latest/buoyancy-basics-600.png',
    '{"physics", "buoyancy", "float", "sink", "density", "កម្លាំងរំកិល", "អណ្តែត", "លិច", "ដង់ស៊ីតេ"}',
    false,
    true
),

-- 65. Kepler's Laws
(
    'keplers-laws',
    'Kepler''s Laws',
    'ច្បាប់កេប្លែរ',
    'Explore how planets move around the sun according to Kepler''s laws. Learn about elliptical orbits and planetary motion.',
    'ស្វែងយល់ពីរបៀបដែលភពផ្លាស់ទីជុំវិញព្រះអាទិត្យតាមច្បាប់កេប្លែរ។ រៀនអំពីគន្លងរាងអេលីប និងចលនាភព។',
    'Physics',
    'Advanced',
    '{11,12}',
    40,
    '{"Understand Kepler''s three laws", "Explore elliptical orbits", "Analyze planetary motion", "Apply orbital mechanics"}',
    '{"យល់ដឹងពីច្បាប់បីរបស់កេប្លែរ", "ស្វែងយល់គន្លងរាងអេលីប", "វិភាគចលនាភព", "អនុវត្តមេកានិចគន្លង"}',
    'https://phet.colorado.edu/sims/html/keplers-laws/latest/keplers-laws_km.html',
    'https://phet.colorado.edu/sims/html/keplers-laws/latest/keplers-laws-600.png',
    '{"physics", "Kepler", "orbits", "planets", "astronomy", "កេប្លែរ", "គន្លង", "ភព", "តារាសាស្ត្រ"}',
    false,
    true
),

-- 66. Density
(
    'density',
    'Density',
    'ដង់ស៊ីតេ',
    'Why do objects like wood float in water? Does it depend on size? Create a custom object to explore the effects of mass and volume on density.',
    'ហេតុអ្វីវត្ថុដូចជាឈើអណ្តែតក្នុងទឹក? តើវាអាស្រ័យលើទំហំទេ? បង្កើតវត្ថុផ្ទាល់ខ្លួនដើម្បីស្វែងយល់ឥទ្ធិពលនៃម៉ាស់ និងមាឌលើដង់ស៊ីតេ។',
    'Physics',
    'Intermediate',
    '{7,8,9,10}',
    30,
    '{"Calculate density", "Understand mass/volume relationship", "Predict floating behavior", "Compare material densities"}',
    '{"គណនាដង់ស៊ីតេ", "យល់ដឹងទំនាក់ទំនងម៉ាស់/មាឌ", "ទស្សន៍ទាយឥរិយាបថអណ្តែត", "ប្រៀបធៀបដង់ស៊ីតេសម្ភារៈ"}',
    'https://phet.colorado.edu/sims/html/density/latest/density_km.html',
    'https://phet.colorado.edu/sims/html/density/latest/density-600.png',
    '{"physics", "density", "mass", "volume", "buoyancy", "ដង់ស៊ីតេ", "ម៉ាស់", "មាឌ", "កម្លាំងរំកិល"}',
    true,
    true
),

-- 67. Normal Modes
(
    'normal-modes',
    'Normal Modes',
    'ម៉ូដធម្មតា',
    'Play with a 1D or 2D system of coupled mass-spring oscillators. Vary the number of masses, set the initial conditions, and watch the system evolve.',
    'លេងជាមួយប្រព័ន្ធ 1D ឬ 2D នៃអង្គោលិកម៉ាស់-ស្ព្រីងភ្ជាប់គ្នា។ ប្រែប្រួលចំនួនម៉ាស់ កំណត់លក្ខខណ្ឌដំបូង ហើយមើលប្រព័ន្ធវិវត្ត។',
    'Physics',
    'Advanced',
    '{11,12}',
    45,
    '{"Understand normal modes", "Explore coupled oscillations", "Analyze wave patterns", "Study resonance"}',
    '{"យល់ដឹងពីម៉ូដធម្មតា", "ស្វែងយល់អង្គោលភ្ជាប់គ្នា", "វិភាគលំនាំរលក", "សិក្សារេសូណង់"}',
    'https://phet.colorado.edu/sims/html/normal-modes/latest/normal-modes_km.html',
    'https://phet.colorado.edu/sims/html/normal-modes/latest/normal-modes-600.png',
    '{"physics", "oscillation", "normal modes", "waves", "resonance", "អង្គោល", "ម៉ូដធម្មតា", "រលក", "រេសូណង់"}',
    false,
    true
),

-- 68. Fourier: Making Waves
(
    'fourier-making-waves',
    'Fourier: Making Waves',
    'ហ្វូរីយេ៖ ការបង្កើតរលក',
    'Learn how to make waves of all different shapes by adding up sines or cosines. Make waves in space and time and measure their wavelengths and periods.',
    'រៀនពីរបៀបបង្កើតរលកនៃរាងផ្សេងៗដោយបូកស៊ីនុស ឬកូស៊ីនុស។ បង្កើតរលកក្នុងលំហ និងពេលវេលា ហើយវាស់ប្រវែងរលក និងរយៈពេលរបស់វា។',
    'Physics',
    'Advanced',
    '{11,12}',
    45,
    '{"Understand Fourier series", "Build complex waves", "Analyze wave components", "Apply superposition"}',
    '{"យល់ដឹងពីស៊េរីហ្វូរីយេ", "សាងសង់រលកស្មុគស្មាញ", "វិភាគសមាសធាតុរលក", "អនុវត្តការត្រួតគ្នា"}',
    'https://phet.colorado.edu/sims/html/fourier-making-waves/latest/fourier-making-waves_km.html',
    'https://phet.colorado.edu/sims/html/fourier-making-waves/latest/fourier-making-waves-600.png',
    '{"physics", "Fourier", "waves", "frequency", "harmonics", "ហ្វូរីយេ", "រលក", "ប្រេកង់", "ហាម៉ូនិច"}',
    false,
    true
),

-- 69. Collision Lab
(
    'collision-lab',
    'Collision Lab',
    'មន្ទីរពិសោធន៍ការប៉ះទង្គិច',
    'Use an air hockey table to investigate simple collisions in 1D and more complex collisions in 2D. Experiment with the number of discs, masses, and initial conditions.',
    'ប្រើតុហុកគីខ្យល់ដើម្បីស៊ើបអង្កេតការប៉ះទង្គិចសាមញ្ញក្នុង 1D និងការប៉ះទង្គិចស្មុគស្មាញជាងក្នុង 2D។ ពិសោធន៍ជាមួយចំនួនថាស ម៉ាស់ និងលក្ខខណ្ឌដំបូង។',
    'Physics',
    'Advanced',
    '{10,11,12}',
    40,
    '{"Analyze collision types", "Apply conservation laws", "Study momentum transfer", "Explore elastic collisions"}',
    '{"វិភាគប្រភេទការប៉ះទង្គិច", "អនុវត្តច្បាប់អភិរក្ស", "សិក្សាការផ្ទេរសន្ទុះ", "ស្វែងយល់ការប៉ះទង្គិចយឺត"}',
    'https://phet.colorado.edu/sims/html/collision-lab/latest/collision-lab_km.html',
    'https://phet.colorado.edu/sims/html/collision-lab/latest/collision-lab-600.png',
    '{"physics", "collision", "momentum", "conservation", "mechanics", "ការប៉ះទង្គិច", "សន្ទុះ", "អភិរក្ស", "មេកានិច"}',
    true,
    true
),

-- 70. Energy Skate Park
(
    'energy-skate-park',
    'Energy Skate Park',
    'ឧទ្យានជិះស្គីថាមពល',
    'Learn about conservation of energy with a skater gal! Explore different tracks and view the kinetic energy, potential energy and friction as she moves.',
    'រៀនអំពីការអភិរក្សថាមពលជាមួយក្មេងស្រីជិះស្គី! ស្វែងយល់ផ្លូវផ្សេងៗ និងមើលថាមពលស៊ីនេទិច ថាមពលប៉ូតង់ស្យែល និងកកិតនៅពេលនាងផ្លាស់ទី។',
    'Physics',
    'Intermediate',
    '{9,10,11,12}',
    35,
    '{"Master energy conservation", "Analyze energy transformations", "Design skate tracks", "Explore friction effects"}',
    '{"ស្ទាត់ជំនាញការអភិរក្សថាមពល", "វិភាគការប្លែងថាមពល", "រចនាផ្លូវជិះស្គី", "ស្វែងយល់ឥទ្ធិពលកកិត"}',
    'https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park_km.html',
    'https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park-600.png',
    '{"physics", "energy", "conservation", "kinetic", "potential", "ថាមពល", "អភិរក្ស", "ស៊ីនេទិច", "ប៉ូតង់ស្យែល"}',
    true,
    true
),

-- 71. Blackbody Spectrum
(
    'blackbody-spectrum',
    'Blackbody Spectrum',
    'ស្ប៉ិចត្រនៃវត្ថុខ្មៅ',
    'How does the blackbody spectrum of the sun compare to visible light? Learn about the blackbody spectrum of Sirius A, the sun, a light bulb, and the earth.',
    'តើស្ប៉ិចត្រវត្ថុខ្មៅនៃព្រះអាទិត្យប្រៀបធៀបនឹងពន្លឺមើលឃើញយ៉ាងណា? រៀនអំពីស្ប៉ិចត្រវត្ថុខ្មៅនៃស៊ីរីយូស A ព្រះអាទិត្យ អំពូលភ្លើង និងផែនដី។',
    'Physics',
    'Advanced',
    '{11,12}',
    35,
    '{"Understand blackbody radiation", "Explore Wien''s law", "Apply Stefan-Boltzmann law", "Compare stellar spectra"}',
    '{"យល់ដឹងពីវិទ្យុសកម្មវត្ថុខ្មៅ", "ស្វែងយល់ច្បាប់វីន", "អនុវត្តច្បាប់ស្តេហ្វាន-បូល្សម៉ាន", "ប្រៀបធៀបស្ប៉ិចត្រផ្កាយ"}',
    'https://phet.colorado.edu/sims/html/blackbody-spectrum/latest/blackbody-spectrum_km.html',
    'https://phet.colorado.edu/sims/html/blackbody-spectrum/latest/blackbody-spectrum-600.png',
    '{"physics", "blackbody", "spectrum", "radiation", "temperature", "វត្ថុខ្មៅ", "ស្ប៉ិចត្រ", "វិទ្យុសកម្ម", "សីតុណ្ហភាព"}',
    false,
    true
),

-- 72. Masses and Springs: Basics
(
    'masses-and-springs-basics',
    'Masses and Springs: Basics',
    'ម៉ាស់ និងស្ព្រីង៖ មូលដ្ឋាន',
    'Hang masses from springs and discover the relationships between mass, spring constant, and gravity. Transport your lab to different planets!',
    'ព្យួរម៉ាស់ពីស្ព្រីង ហើយរកឃើញទំនាក់ទំនងរវាងម៉ាស់ ថេរស្ព្រីង និងទំនាញ។ ដឹកជញ្ជូនមន្ទីរពិសោធន៍របស់អ្នកទៅភពផ្សេងៗ!',
    'Physics',
    'Beginner',
    '{7,8,9}',
    25,
    '{"Learn spring basics", "Explore Hooke''s law", "Compare gravity on planets", "Measure oscillations"}',
    '{"រៀនមូលដ្ឋានស្ព្រីង", "ស្វែងយល់ច្បាប់ហុក", "ប្រៀបធៀបទំនាញលើភព", "វាស់អង្គោល"}',
    'https://phet.colorado.edu/sims/html/masses-and-springs-basics/latest/masses-and-springs-basics_km.html',
    'https://phet.colorado.edu/sims/html/masses-and-springs-basics/latest/masses-and-springs-basics-600.png',
    '{"physics", "springs", "mass", "oscillation", "gravity", "ស្ព្រីង", "ម៉ាស់", "អង្គោល", "ទំនាញ"}',
    false,
    true
),

-- 73. Energy Forms and Changes
(
    'energy-forms-and-changes',
    'Energy Forms and Changes',
    'ទម្រង់ និងការផ្លាស់ប្តូរថាមពល',
    'Explore how heating and cooling iron, brick, water, and olive oil adds or removes energy. See how energy is transferred between objects.',
    'ស្វែងយល់ពីរបៀបដែលការកំដៅ និងត្រជាក់ដែក ឥដ្ឋ ទឹក និងប្រេងអូលីវបន្ថែម ឬដកថាមពល។ មើលពីរបៀបដែលថាមពលត្រូវបានផ្ទេររវាងវត្ថុ។',
    'Physics',
    'Intermediate',
    '{8,9,10}',
    30,
    '{"Understand energy forms", "Track energy flow", "Explore heat transfer", "Apply energy conservation"}',
    '{"យល់ដឹងពីទម្រង់ថាមពល", "តាមដានលំហូរថាមពល", "ស្វែងយល់ការផ្ទេរកំដៅ", "អនុវត្តការអភិរក្សថាមពល"}',
    'https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes_km.html',
    'https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes-600.png',
    '{"physics", "energy", "heat", "transfer", "conservation", "ថាមពល", "កំដៅ", "ការផ្ទេរ", "អភិរក្ស"}',
    true,
    true
),

-- 74. Masses and Springs
(
    'masses-and-springs',
    'Masses and Springs',
    'ម៉ាស់ និងស្ព្រីង',
    'Hang masses from springs and adjust the spring constant and damping. Transport the lab to different planets, slow down time, and observe the velocity and acceleration throughout the oscillation.',
    'ព្យួរម៉ាស់ពីស្ព្រីង ហើយកែតម្រូវថេរស្ព្រីង និងការស្រូប។ ដឹកជញ្ជូនមន្ទីរពិសោធន៍ទៅភពផ្សេងៗ បន្ថយល្បឿនពេលវេលា និងសង្កេតល្បឿន និងសំទុះពេញមួយអង្គោល។',
    'Physics',
    'Intermediate',
    '{9,10,11,12}',
    35,
    '{"Master spring systems", "Analyze damped oscillations", "Study resonance", "Compare planetary gravity"}',
    '{"ស្ទាត់ជំនាញប្រព័ន្ធស្ព្រីង", "វិភាគអង្គោលស្រូប", "សិក្សារេសូណង់", "ប្រៀបធៀបទំនាញភព"}',
    'https://phet.colorado.edu/sims/html/masses-and-springs/latest/masses-and-springs_km.html',
    'https://phet.colorado.edu/sims/html/masses-and-springs/latest/masses-and-springs-600.png',
    '{"physics", "springs", "oscillation", "damping", "resonance", "ស្ព្រីង", "អង្គោល", "ការស្រូប", "រេសូណង់"}',
    false,
    true
),

-- 75. Under Pressure
(
    'under-pressure',
    'Under Pressure',
    'ក្រោមសម្ពាធ',
    'Explore pressure under and above water. See how pressure changes as you change fluids, gravity, container shapes, and volume.',
    'ស្វែងយល់សម្ពាធក្រោម និងលើទឹក។ មើលពីរបៀបដែលសម្ពាធផ្លាស់ប្តូរនៅពេលអ្នកផ្លាស់ប្តូរអង្គធាតុរាវ ទំនាញ រាងធុង និងមាឌ។',
    'Physics',
    'Intermediate',
    '{8,9,10,11}',
    30,
    '{"Understand fluid pressure", "Explore pressure depth relationship", "Apply Pascal''s principle", "Analyze pressure in containers"}',
    '{"យល់ដឹងពីសម្ពាធអង្គធាតុរាវ", "ស្វែងយល់ទំនាក់ទំនងសម្ពាធ-ជម្រៅ", "អនុវត្តគោលការណ៍ប៉ាស្កាល់", "វិភាគសម្ពាធក្នុងធុង"}',
    'https://phet.colorado.edu/sims/html/under-pressure/latest/under-pressure_km.html',
    'https://phet.colorado.edu/sims/html/under-pressure/latest/under-pressure-600.png',
    '{"physics", "pressure", "fluid", "Pascal", "depth", "សម្ពាធ", "អង្គធាតុរាវ", "ប៉ាស្កាល់", "ជម្រៅ"}',
    false,
    true
),

-- MATHEMATICS SIMULATIONS CONTINUED (76-95)

-- 76. Number Line: Integers
(
    'number-line-integers',
    'Number Line: Integers',
    'បន្ទាត់លេខ៖ ចំនួនគត់',
    'Explore positive and negative integers on the number line. Compare integers and put them in order.',
    'ស្វែងយល់ចំនួនគត់វិជ្ជមាន និងអវិជ្ជមាននៅលើបន្ទាត់លេខ។ ប្រៀបធៀបចំនួនគត់ និងដាក់ពួកវាតាមលំដាប់។',
    'Mathematics',
    'Beginner',
    '{4,5,6,7}',
    20,
    '{"Understand integers", "Order positive and negative numbers", "Use number line", "Compare integer values"}',
    '{"យល់ដឹងពីចំនួនគត់", "តម្រៀបលេខវិជ្ជមាន និងអវិជ្ជមាន", "ប្រើបន្ទាត់លេខ", "ប្រៀបធៀបតម្លៃចំនួនគត់"}',
    'https://phet.colorado.edu/sims/html/number-line-integers/latest/number-line-integers_km.html',
    'https://phet.colorado.edu/sims/html/number-line-integers/latest/number-line-integers-600.png',
    '{"mathematics", "integers", "number line", "negative", "positive", "ចំនួនគត់", "បន្ទាត់លេខ", "អវិជ្ជមាន", "វិជ្ជមាន"}',
    false,
    true
),

-- 77. Vector Addition: Equations
(
    'vector-addition-equations',
    'Vector Addition: Equations',
    'ការបូកវ៉ិចទ័រ៖ សមីការ',
    'Explore vectors in 1D or 2D, and discover how vectors add together. Specify vectors in Cartesian or polar coordinates, and see the magnitude, angle, and components of each vector.',
    'ស្វែងយល់វ៉ិចទ័រក្នុង 1D ឬ 2D ហើយរកឃើញរបៀបដែលវ៉ិចទ័របូកគ្នា។ បញ្ជាក់វ៉ិចទ័រក្នុងកូអរដោនេកាតេស្យាំ ឬប៉ូល ហើយមើលទំហំ មុំ និងសមាសធាតុនៃវ៉ិចទ័រនីមួយៗ។',
    'Mathematics',
    'Advanced',
    '{10,11,12}',
    35,
    '{"Add vectors algebraically", "Use component method", "Convert coordinate systems", "Solve vector equations"}',
    '{"បូកវ៉ិចទ័រពិជគណិត", "ប្រើវិធីសមាសធាតុ", "បម្លែងប្រព័ន្ធកូអរដោនេ", "ដោះស្រាយសមីការវ៉ិចទ័រ"}',
    'https://phet.colorado.edu/sims/html/vector-addition-equations/latest/vector-addition-equations_km.html',
    'https://phet.colorado.edu/sims/html/vector-addition-equations/latest/vector-addition-equations-600.png',
    '{"mathematics", "vectors", "addition", "equations", "components", "វ៉ិចទ័រ", "ការបូក", "សមីការ", "សមាសធាតុ"}',
    false,
    true
),

-- 78. Vector Addition
(
    'vector-addition',
    'Vector Addition',
    'ការបូកវ៉ិចទ័រ',
    'Learn how to add vectors. Drag vectors onto a graph, change their length and angle, and sum them together.',
    'រៀនពីរបៀបបូកវ៉ិចទ័រ។ ទាញវ៉ិចទ័រទៅលើក្រាហ្វ ផ្លាស់ប្តូរប្រវែង និងមុំរបស់វា ហើយបូកពួកវាជាមួយគ្នា។',
    'Mathematics',
    'Intermediate',
    '{9,10,11}',
    30,
    '{"Add vectors graphically", "Understand vector components", "Use parallelogram method", "Find resultant vectors"}',
    '{"បូកវ៉ិចទ័រក្រាហ្វិច", "យល់ដឹងពីសមាសធាតុវ៉ិចទ័រ", "ប្រើវិធីប្រលេឡូក្រាម", "រកវ៉ិចទ័រលទ្ធផល"}',
    'https://phet.colorado.edu/sims/html/vector-addition/latest/vector-addition_km.html',
    'https://phet.colorado.edu/sims/html/vector-addition/latest/vector-addition-600.png',
    '{"mathematics", "vectors", "addition", "graphical", "components", "វ៉ិចទ័រ", "ការបូក", "ក្រាហ្វិច", "សមាសធាតុ"}',
    true,
    true
),

-- 79. Curve Fitting
(
    'curve-fitting',
    'Curve Fitting',
    'ការសមខ្សែកោង',
    'With your mouse, drag data points and their error bars, and watch the best-fit polynomial curve update instantly. Choose your fit function, and see the chi-squared value.',
    'ជាមួយកណ្តុររបស់អ្នក ទាញចំណុចទិន្នន័យ និងរបារកំហុសរបស់វា ហើយមើលខ្សែកោងពហុធាសមល្អបំផុតធ្វើបច្ចុប្បន្នភាពភ្លាម។ ជ្រើសរើសអនុគមន៍សមរបស់អ្នក ហើយមើលតម្លៃខី-ការេ។',
    'Mathematics',
    'Advanced',
    '{11,12}',
    40,
    '{"Fit curves to data", "Understand regression", "Analyze goodness of fit", "Use statistical methods"}',
    '{"សមខ្សែកោងទៅទិន្នន័យ", "យល់ដឹងពីតំរែតំរង់", "វិភាគភាពល្អនៃការសម", "ប្រើវិធីសាស្ត្រស្ថិតិ"}',
    'https://phet.colorado.edu/sims/html/curve-fitting/latest/curve-fitting_km.html',
    'https://phet.colorado.edu/sims/html/curve-fitting/latest/curve-fitting-600.png',
    '{"mathematics", "statistics", "curve fitting", "regression", "data", "ស្ថិតិ", "ការសមខ្សែកោង", "តំរែតំរង់", "ទិន្នន័យ"}',
    false,
    true
),

-- 80. Fractions: Mixed Numbers
(
    'fractions-mixed-numbers',
    'Fractions: Mixed Numbers',
    'ប្រភាគ៖ លេខចម្រុះ',
    'Build fractions from shapes and numbers to earn stars in this fractions game or explore in the Fractions Lab. Challenge yourself on any level you like.',
    'សាងសង់ប្រភាគពីរាង និងលេខដើម្បីទទួលផ្កាយក្នុងហ្គេមប្រភាគនេះ ឬស្វែងយល់ក្នុងមន្ទីរពិសោធន៍ប្រភាគ។ ប្រកួតប្រជែងខ្លួនឯងនៅកម្រិតណាមួយដែលអ្នកចូលចិត្ត។',
    'Mathematics',
    'Intermediate',
    '{4,5,6,7}',
    30,
    '{"Convert mixed numbers", "Add and subtract fractions", "Work with improper fractions", "Build fraction understanding"}',
    '{"បម្លែងលេខចម្រុះ", "បូក និងដកប្រភាគ", "ធ្វើការជាមួយប្រភាគមិនត្រឹមត្រូវ", "បង្កើតការយល់ដឹងប្រភាគ"}',
    'https://phet.colorado.edu/sims/html/fractions-mixed-numbers/latest/fractions-mixed-numbers_km.html',
    'https://phet.colorado.edu/sims/html/fractions-mixed-numbers/latest/fractions-mixed-numbers-600.png',
    '{"mathematics", "fractions", "mixed numbers", "arithmetic", "conversion", "ប្រភាគ", "លេខចម្រុះ", "នព្វន្ធ", "ការបម្លែង"}',
    true,
    true
),

-- 81. Fractions: Intro
(
    'fractions-intro',
    'Fractions: Intro',
    'ប្រភាគ៖ ការណែនាំ',
    'Explore fractions using interactive objects. Build fractions from shapes and match fractions to visual models.',
    'ស្វែងយល់ប្រភាគដោយប្រើវត្ថុអន្តរកម្ម។ សាងសង់ប្រភាគពីរាង និងផ្គូផ្គងប្រភាគទៅនឹងគំរូមើលឃើញ។',
    'Mathematics',
    'Beginner',
    '{3,4,5,6}',
    25,
    '{"Understand fraction basics", "Build visual fractions", "Compare fractions", "Learn fraction notation"}',
    '{"យល់ដឹងពីមូលដ្ឋានប្រភាគ", "សាងសង់ប្រភាគមើលឃើញ", "ប្រៀបធៀបប្រភាគ", "រៀនសញ្ញាណប្រភាគ"}',
    'https://phet.colorado.edu/sims/html/fractions-intro/latest/fractions-intro_km.html',
    'https://phet.colorado.edu/sims/html/fractions-intro/latest/fractions-intro-600.png',
    '{"mathematics", "fractions", "introduction", "visual", "basics", "ប្រភាគ", "ការណែនាំ", "មើលឃើញ", "មូលដ្ឋាន"}',
    true,
    true
),

-- 82. Build a Fraction
(
    'build-a-fraction',
    'Build a Fraction',
    'សាងសង់ប្រភាគ',
    'Build fractions from shapes and numbers. Match shapes and numbers to earn stars in the game. Challenge yourself on any level you like.',
    'សាងសង់ប្រភាគពីរាង និងលេខ។ ផ្គូផ្គងរាង និងលេខដើម្បីទទួលផ្កាយក្នុងហ្គេម។ ប្រកួតប្រជែងខ្លួនឯងនៅកម្រិតណាមួយដែលអ្នកចូលចិត្ត។',
    'Mathematics',
    'Beginner',
    '{2,3,4,5}',
    25,
    '{"Build fractions", "Match representations", "Understand parts and wholes", "Practice fraction concepts"}',
    '{"សាងសង់ប្រភាគ", "ផ្គូផ្គងតំណាង", "យល់ដឹងពីផ្នែក និងទាំងមូល", "អនុវត្តគំនិតប្រភាគ"}',
    'https://phet.colorado.edu/sims/html/build-a-fraction/latest/build-a-fraction_km.html',
    'https://phet.colorado.edu/sims/html/build-a-fraction/latest/build-a-fraction-600.png',
    '{"mathematics", "fractions", "building", "shapes", "game", "ប្រភាគ", "ការសាងសង់", "រាង", "ហ្គេម"}',
    false,
    true
),

-- 83. Fractions: Equality
(
    'fractions-equality',
    'Fractions: Equality',
    'ប្រភាគ៖ សមភាព',
    'Explore equivalent fractions by using visual models and number lines. Build fractions that have the same value but different numerators and denominators.',
    'ស្វែងយល់ប្រភាគសមមូលដោយប្រើគំរូមើលឃើញ និងបន្ទាត់លេខ។ សាងសង់ប្រភាគដែលមានតម្លៃដូចគ្នាប៉ុន្តែភាគយក និងភាគបែងខុសគ្នា។',
    'Mathematics',
    'Intermediate',
    '{4,5,6,7}',
    30,
    '{"Find equivalent fractions", "Simplify fractions", "Use visual models", "Understand fraction equality"}',
    '{"រកប្រភាគសមមូល", "សម្រួលប្រភាគ", "ប្រើគំរូមើលឃើញ", "យល់ដឹងពីសមភាពប្រភាគ"}',
    'https://phet.colorado.edu/sims/html/fractions-equality/latest/fractions-equality_km.html',
    'https://phet.colorado.edu/sims/html/fractions-equality/latest/fractions-equality-600.png',
    '{"mathematics", "fractions", "equivalent", "equality", "simplify", "ប្រភាគ", "សមមូល", "សមភាព", "សម្រួល"}',
    false,
    true
),

-- 84. Graphing Quadratics
(
    'graphing-quadratics',
    'Graphing Quadratics',
    'គូសក្រាហ្វការ៉េ',
    'Discover how changing coefficients changes the shape of a curve. View the graphs of individual terms to see how they add to generate the polynomial curve.',
    'រកឃើញរបៀបដែលការផ្លាស់ប្តូរមេគុណផ្លាស់ប្តូររាងខ្សែកោង។ មើលក្រាហ្វនៃតទៅនីមួយៗដើម្បីមើលពីរបៀបដែលពួកវាបូកដើម្បីបង្កើតខ្សែកោងពហុធា។',
    'Mathematics',
    'Intermediate',
    '{9,10,11}',
    35,
    '{"Graph quadratic functions", "Explore parabola properties", "Find vertex and roots", "Understand transformations"}',
    '{"គូសក្រាហ្វអនុគមន៍ការ៉េ", "ស្វែងយល់លក្ខណៈសម្បត្តិប៉ារ៉ាបូល", "រកកំពូល និងឫស", "យល់ដឹងពីការប្លែង"}',
    'https://phet.colorado.edu/sims/html/graphing-quadratics/latest/graphing-quadratics_km.html',
    'https://phet.colorado.edu/sims/html/graphing-quadratics/latest/graphing-quadratics-600.png',
    '{"mathematics", "quadratic", "graphing", "parabola", "functions", "ការ៉េ", "ការគូសក្រាហ្វ", "ប៉ារ៉ាបូល", "អនុគមន៍"}',
    true,
    true
),

-- 85. Equality Explorer: Two Variables
(
    'equality-explorer-two-variables',
    'Equality Explorer: Two Variables',
    'អ្នករុករកសមភាព៖ អថេរពីរ',
    'Solve systems of equations using algebra. Explore what it means to solve a system of two linear equations in two variables.',
    'ដោះស្រាយប្រព័ន្ធសមីការដោយប្រើពិជគណិត។ ស្វែងយល់អ្វីដែលមានន័យថាដោះស្រាយប្រព័ន្ធសមីការលីនេអ៊ែរពីរក្នុងអថេរពីរ។',
    'Mathematics',
    'Advanced',
    '{9,10,11,12}',
    40,
    '{"Solve systems of equations", "Use substitution method", "Apply elimination method", "Graph solution sets"}',
    '{"ដោះស្រាយប្រព័ន្ធសមីការ", "ប្រើវិធីជំនួស", "អនុវត្តវិធីលុបបំបាត់", "គូសក្រាហ្វសំណុំដំណោះស្រាយ"}',
    'https://phet.colorado.edu/sims/html/equality-explorer-two-variables/latest/equality-explorer-two-variables_km.html',
    'https://phet.colorado.edu/sims/html/equality-explorer-two-variables/latest/equality-explorer-two-variables-600.png',
    '{"mathematics", "algebra", "systems", "equations", "variables", "ពិជគណិត", "ប្រព័ន្ធ", "សមីការ", "អថេរ"}',
    false,
    true
),

-- 86. Equality Explorer: Basics
(
    'equality-explorer-basics',
    'Equality Explorer: Basics',
    'អ្នករុករកសមភាព៖ មូលដ្ឋាន',
    'Learn the meaning of equality using balance beams. Solve visual puzzles to develop an understanding of equations.',
    'រៀនអត្ថន័យនៃសមភាពដោយប្រើធ្នឹមតុល្យភាព។ ដោះស្រាយល្បែងផ្គុំរូបភាពដើម្បីអភិវឌ្ឍការយល់ដឹងពីសមីការ។',
    'Mathematics',
    'Beginner',
    '{5,6,7,8}',
    25,
    '{"Understand equation balance", "Solve simple equations", "Use visual models", "Build algebraic thinking"}',
    '{"យល់ដឹងពីតុល្យភាពសមីការ", "ដោះស្រាយសមីការសាមញ្ញ", "ប្រើគំរូមើលឃើញ", "បង្កើតការគិតពិជគណិត"}',
    'https://phet.colorado.edu/sims/html/equality-explorer-basics/latest/equality-explorer-basics_km.html',
    'https://phet.colorado.edu/sims/html/equality-explorer-basics/latest/equality-explorer-basics-600.png',
    '{"mathematics", "algebra", "equations", "balance", "basics", "ពិជគណិត", "សមីការ", "តុល្យភាព", "មូលដ្ឋាន"}',
    false,
    true
),

-- 87. Equality Explorer
(
    'equality-explorer',
    'Equality Explorer',
    'អ្នករុករកសមភាព',
    'Solve equations using algebra tiles and balance scales. Explore solving equations with variables on both sides.',
    'ដោះស្រាយសមីការដោយប្រើក្រឡាពិជគណិត និងជញ្ជីងតុល្យភាព។ ស្វែងយល់ការដោះស្រាយសមីការជាមួយអថេរនៅលើជ្រុងទាំងពីរ។',
    'Mathematics',
    'Intermediate',
    '{7,8,9,10}',
    35,
    '{"Solve algebraic equations", "Use balance model", "Work with variables", "Apply equation properties"}',
    '{"ដោះស្រាយសមីការពិជគណិត", "ប្រើគំរូតុល្យភាព", "ធ្វើការជាមួយអថេរ", "អនុវត្តលក្ខណៈសម្បត្តិសមីការ"}',
    'https://phet.colorado.edu/sims/html/equality-explorer/latest/equality-explorer_km.html',
    'https://phet.colorado.edu/sims/html/equality-explorer/latest/equality-explorer-600.png',
    '{"mathematics", "algebra", "equations", "solving", "balance", "ពិជគណិត", "សមីការ", "ការដោះស្រាយ", "តុល្យភាព"}',
    true,
    true
),

-- 88. Area Model: Algebra
(
    'area-model-algebra',
    'Area Model: Algebra',
    'គំរូផ្ទៃ៖ ពិជគណិត',
    'Build algebraic expressions using tiles. Factor expressions and expand products of binomials using area models.',
    'សាងសង់កន្សោមពិជគណិតដោយប្រើក្រឡា។ កត្តាកន្សោម និងពង្រីកផលគុណនៃទ្វេធាដោយប្រើគំរូផ្ទៃ។',
    'Mathematics',
    'Intermediate',
    '{8,9,10}',
    35,
    '{"Factor expressions", "Expand binomials", "Use area models", "Understand polynomial multiplication"}',
    '{"កត្តាកន្សោម", "ពង្រីកទ្វេធា", "ប្រើគំរូផ្ទៃ", "យល់ដឹងពីការគុណពហុធា"}',
    'https://phet.colorado.edu/sims/html/area-model-algebra/latest/area-model-algebra_km.html',
    'https://phet.colorado.edu/sims/html/area-model-algebra/latest/area-model-algebra-600.png',
    '{"mathematics", "algebra", "area model", "factoring", "polynomials", "ពិជគណិត", "គំរូផ្ទៃ", "ការដាក់កត្តា", "ពហុធា"}',
    false,
    true
),

-- 89. Area Model: Decimals
(
    'area-model-decimals',
    'Area Model: Decimals',
    'គំរូផ្ទៃ៖ ទសភាគ',
    'Explore decimal multiplication using area models. Build a deeper understanding of decimal place value and multiplication.',
    'ស្វែងយល់ការគុណទសភាគដោយប្រើគំរូផ្ទៃ។ បង្កើតការយល់ដឹងកាន់តែស៊ីជម្រៅពីតម្លៃខ្ទង់ទសភាគ និងការគុណ។',
    'Mathematics',
    'Intermediate',
    '{5,6,7}',
    30,
    '{"Multiply decimals visually", "Understand place value", "Use area models", "Connect to standard algorithm"}',
    '{"គុណទសភាគដោយមើលឃើញ", "យល់ដឹងពីតម្លៃខ្ទង់", "ប្រើគំរូផ្ទៃ", "ភ្ជាប់ទៅក្បួនស្តង់ដារ"}',
    'https://phet.colorado.edu/sims/html/area-model-decimals/latest/area-model-decimals_km.html',
    'https://phet.colorado.edu/sims/html/area-model-decimals/latest/area-model-decimals-600.png',
    '{"mathematics", "decimals", "multiplication", "area model", "place value", "ទសភាគ", "ការគុណ", "គំរូផ្ទៃ", "តម្លៃខ្ទង់"}',
    false,
    true
),

-- 90. Area Model: Multiplication
(
    'area-model-multiplication',
    'Area Model: Multiplication',
    'គំរូផ្ទៃ៖ ការគុណ',
    'Visualize multiplication using area models. Build conceptual understanding of multi-digit multiplication.',
    'មើលឃើញការគុណដោយប្រើគំរូផ្ទៃ។ បង្កើតការយល់ដឹងគំនិតនៃការគុណលេខច្រើនខ្ទង់។',
    'Mathematics',
    'Beginner',
    '{3,4,5,6}',
    25,
    '{"Visualize multiplication", "Use area models", "Understand partial products", "Build multiplication sense"}',
    '{"មើលឃើញការគុណ", "ប្រើគំរូផ្ទៃ", "យល់ដឹងពីផលគុណផ្នែក", "បង្កើតការយល់ដឹងការគុណ"}',
    'https://phet.colorado.edu/sims/html/area-model-multiplication/latest/area-model-multiplication_km.html',
    'https://phet.colorado.edu/sims/html/area-model-multiplication/latest/area-model-multiplication-600.png',
    '{"mathematics", "multiplication", "area model", "visual", "arithmetic", "ការគុណ", "គំរូផ្ទៃ", "មើលឃើញ", "នព្វន្ធ"}',
    true,
    true
),

-- 91. Area Model: Introduction
(
    'area-model-introduction',
    'Area Model: Introduction',
    'គំរូផ្ទៃ៖ ការណែនាំ',
    'Build rectangles of various sizes and learn how the area relates to multiplication. Start with simple examples and build understanding.',
    'សាងសង់ចតុកោណកែងទំហំផ្សេងៗ ហើយរៀនពីរបៀបដែលផ្ទៃទាក់ទងនឹងការគុណ។ ចាប់ផ្តើមជាមួយឧទាហរណ៍សាមញ្ញ និងបង្កើតការយល់ដឹង។',
    'Mathematics',
    'Beginner',
    '{2,3,4,5}',
    20,
    '{"Understand area concept", "Connect area to multiplication", "Build visual models", "Learn rectangle properties"}',
    '{"យល់ដឹងពីគំនិតផ្ទៃ", "ភ្ជាប់ផ្ទៃទៅការគុណ", "សាងសង់គំរូមើលឃើញ", "រៀនលក្ខណៈសម្បត្តិចតុកោណកែង"}',
    'https://phet.colorado.edu/sims/html/area-model-introduction/latest/area-model-introduction_km.html',
    'https://phet.colorado.edu/sims/html/area-model-introduction/latest/area-model-introduction-600.png',
    '{"mathematics", "area", "multiplication", "introduction", "rectangles", "ផ្ទៃ", "ការគុណ", "ការណែនាំ", "ចតុកោណកែង"}',
    false,
    true
),

-- 92. Expression Exchange
(
    'expression-exchange',
    'Expression Exchange',
    'ការផ្លាស់ប្តូរកន្សោម',
    'Trade coins for variables to create algebraic expressions. Simplify expressions by combining like terms.',
    'ជួញដូរកាក់សម្រាប់អថេរដើម្បីបង្កើតកន្សោមពិជគណិត។ សម្រួលកន្សោមដោយផ្សំតួដូចគ្នា។',
    'Mathematics',
    'Intermediate',
    '{7,8,9}',
    30,
    '{"Build algebraic expressions", "Combine like terms", "Understand variables", "Simplify expressions"}',
    '{"សាងសង់កន្សោមពិជគណិត", "ផ្សំតួដូចគ្នា", "យល់ដឹងពីអថេរ", "សម្រួលកន្សោម"}',
    'https://phet.colorado.edu/sims/html/expression-exchange/latest/expression-exchange_km.html',
    'https://phet.colorado.edu/sims/html/expression-exchange/latest/expression-exchange-600.png',
    '{"mathematics", "algebra", "expressions", "variables", "simplify", "ពិជគណិត", "កន្សោម", "អថេរ", "សម្រួល"}',
    false,
    true
),

-- 93. Graphing Slope-Intercept
(
    'graphing-slope-intercept',
    'Graphing Slope-Intercept',
    'គូសក្រាហ្វជម្រាល-អន្តរកាត់',
    'Graph lines in slope-intercept form (y = mx + b). Explore how changing the slope and y-intercept affects the graph.',
    'គូសក្រាហ្វបន្ទាត់ក្នុងទម្រង់ជម្រាល-អន្តរកាត់ (y = mx + b)។ ស្វែងយល់ពីរបៀបដែលការផ្លាស់ប្តូរជម្រាល និងអន្តរកាត់ y ប៉ះពាល់ដល់ក្រាហ្វ។',
    'Mathematics',
    'Intermediate',
    '{8,9,10}',
    30,
    '{"Graph linear equations", "Understand slope", "Find y-intercept", "Write equations from graphs"}',
    '{"គូសក្រាហ្វសមីការលីនេអ៊ែរ", "យល់ដឹងពីជម្រាល", "រកអន្តរកាត់ y", "សរសេរសមីការពីក្រាហ្វ"}',
    'https://phet.colorado.edu/sims/html/graphing-slope-intercept/latest/graphing-slope-intercept_km.html',
    'https://phet.colorado.edu/sims/html/graphing-slope-intercept/latest/graphing-slope-intercept-600.png',
    '{"mathematics", "linear", "slope", "intercept", "graphing", "លីនេអ៊ែរ", "ជម្រាល", "អន្តរកាត់", "ការគូសក្រាហ្វ"}',
    true,
    true
),

-- 94. Function Builder: Basics
(
    'function-builder-basics',
    'Function Builder: Basics',
    'អ្នកសាងសង់អនុគមន៍៖ មូលដ្ឋាន',
    'Learn the basics of functions by building and testing simple function machines. See input-output relationships.',
    'រៀនមូលដ្ឋាននៃអនុគមន៍ដោយសាងសង់ និងសាកល្បងម៉ាស៊ីនអនុគមន៍សាមញ្ញ។ មើលទំនាក់ទំនងចូល-ចេញ។',
    'Mathematics',
    'Beginner',
    '{6,7,8}',
    25,
    '{"Understand function concept", "Build function machines", "Test input-output", "Learn function notation"}',
    '{"យល់ដឹងពីគំនិតអនុគមន៍", "សាងសង់ម៉ាស៊ីនអនុគមន៍", "សាកល្បងចូល-ចេញ", "រៀនសញ្ញាណអនុគមន៍"}',
    'https://phet.colorado.edu/sims/html/function-builder-basics/latest/function-builder-basics_km.html',
    'https://phet.colorado.edu/sims/html/function-builder-basics/latest/function-builder-basics-600.png',
    '{"mathematics", "functions", "basics", "input-output", "machines", "អនុគមន៍", "មូលដ្ឋាន", "ចូល-ចេញ", "ម៉ាស៊ីន"}',
    false,
    true
),

-- 95. Proportion Playground
(
    'proportion-playground',
    'Proportion Playground',
    'សួនកម្សាន្តសមាមាត្រ',
    'Play with ratios and proportions by designing a necklace, making lemonade, or painting a wall. Discover how ratios and proportions are used in everyday life.',
    'លេងជាមួយផលធៀប និងសមាមាត្រដោយរចនាខ្សែក បង្កើតទឹកក្រូចឆ្មា ឬលាបជញ្ជាំង។ រកឃើញរបៀបដែលផលធៀប និងសមាមាត្រត្រូវបានប្រើក្នុងជីវិតប្រចាំថ្ងៃ។',
    'Mathematics',
    'Intermediate',
    '{5,6,7,8}',
    30,
    '{"Apply ratios in context", "Solve proportion problems", "Use real-world examples", "Build proportional reasoning"}',
    '{"អនុវត្តផលធៀបក្នុងបរិបទ", "ដោះស្រាយបញ្ហាសមាមាត្រ", "ប្រើឧទាហរណ៍ពិភពពិត", "បង្កើតការវែកញែកសមាមាត្រ"}',
    'https://phet.colorado.edu/sims/html/proportion-playground/latest/proportion-playground_km.html',
    'https://phet.colorado.edu/sims/html/proportion-playground/latest/proportion-playground-600.png',
    '{"mathematics", "proportion", "ratio", "real-world", "playground", "សមាមាត្រ", "ផលធៀប", "ពិភពពិត", "សួនកម្សាន្ត"}',
    true,
    true
),

-- FINAL MATHEMATICS SIMULATIONS (96-100)

-- 96. Unit Rates
(
    'unit-rates',
    'Unit Rates',
    'អត្រាឯកតា',
    'Discover the unit rate while shopping for fruits, vegetables, and candy. Construct a double number line and look for patterns.',
    'រកឃើញអត្រាឯកតាខណៈពេលទិញផ្លែឈើ បន្លែ និងស្ករគ្រាប់។ សាងសង់បន្ទាត់លេខទ្វេ និងរកមើលលំនាំ។',
    'Mathematics',
    'Beginner',
    '{5,6,7}',
    25,
    '{"Calculate unit rates", "Compare prices", "Use double number lines", "Apply to shopping"}',
    '{"គណនាអត្រាឯកតា", "ប្រៀបធៀបតម្លៃ", "ប្រើបន្ទាត់លេខទ្វេ", "អនុវត្តចំពោះការទិញឥវ៉ាន់"}',
    'https://phet.colorado.edu/sims/html/unit-rates/latest/unit-rates_km.html',
    'https://phet.colorado.edu/sims/html/unit-rates/latest/unit-rates-600.png',
    '{"mathematics", "rates", "unit price", "shopping", "proportion", "អត្រា", "តម្លៃឯកតា", "ការទិញឥវ៉ាន់", "សមាមាត្រ"}',
    false,
    true
),

-- 97. Make a Ten
(
    'make-a-ten',
    'Make a Ten',
    'បង្កើតដប់',
    'Use number bonds to break apart numbers and make a ten. Use the counting tool to practice addition with regrouping.',
    'ប្រើចំណងលេខដើម្បីបំបែកលេខ និងបង្កើតដប់។ ប្រើឧបករណ៍រាប់ដើម្បីអនុវត្តការបូកជាមួយការដាក់ក្រុមឡើងវិញ។',
    'Mathematics',
    'Beginner',
    '{1,2,3}',
    20,
    '{"Make ten strategy", "Use number bonds", "Practice mental math", "Build addition fluency"}',
    '{"យុទ្ធសាស្ត្របង្កើតដប់", "ប្រើចំណងលេខ", "អនុវត្តគណិតផ្លូវចិត្ត", "បង្កើតភាពស្ទាត់ការបូក"}',
    'https://phet.colorado.edu/sims/html/make-a-ten/latest/make-a-ten_km.html',
    'https://phet.colorado.edu/sims/html/make-a-ten/latest/make-a-ten-600.png',
    '{"mathematics", "addition", "make ten", "mental math", "number bonds", "ការបូក", "បង្កើតដប់", "គណិតផ្លូវចិត្ត", "ចំណងលេខ"}',
    true,
    true
),

-- 98. Plinko Probability
(
    'plinko-probability',
    'Plinko Probability',
    'ប្រូបាប៊ីលីតេផ្លីងកូ',
    'Drop balls through a triangular grid of pegs and see them accumulate in containers. Switch to a histogram view and compare the distribution to an ideal binomial distribution.',
    'ទម្លាក់គ្រាប់បាល់តាមក្រឡាចត្រង្គត្រីកោណនៃបង្គោល ហើយមើលពួកវាប្រមូលផ្តុំក្នុងធុង។ ប្តូរទៅទិដ្ឋភាពអ៊ីស្តូក្រាម ហើយប្រៀបធៀបការបែងចែកទៅនឹងការបែងចែកទ្វេធាឧត្តមគតិ។',
    'Mathematics',
    'Advanced',
    '{10,11,12}',
    35,
    '{"Explore probability distributions", "Understand binomial distribution", "Analyze random events", "Use statistical simulations"}',
    '{"ស្វែងយល់ការបែងចែកប្រូបាប៊ីលីតេ", "យល់ដឹងពីការបែងចែកទ្វេធា", "វិភាគព្រឹត្តិការណ៍ចៃដន្យ", "ប្រើការក្លែងធ្វើស្ថិតិ"}',
    'https://phet.colorado.edu/sims/html/plinko-probability/latest/plinko-probability_km.html',
    'https://phet.colorado.edu/sims/html/plinko-probability/latest/plinko-probability-600.png',
    '{"mathematics", "probability", "statistics", "binomial", "distribution", "ប្រូបាប៊ីលីតេ", "ស្ថិតិ", "ទ្វេធា", "ការបែងចែក"}',
    false,
    true
),

-- 99. Trig Tour
(
    'trig-tour',
    'Trig Tour',
    'ដំណើរទស្សនកិច្ចត្រីកោណមាត្រ',
    'Take a tour of trigonometry using degrees or radians! Look for patterns in the values and on the graph when you change the value of theta.',
    'ធ្វើដំណើរទស្សនកិច្ចត្រីកោណមាត្រដោយប្រើដឺក្រេ ឬរ៉ាដ្យង់! រកមើលលំនាំក្នុងតម្លៃ និងនៅលើក្រាហ្វនៅពេលអ្នកផ្លាស់ប្តូរតម្លៃនៃថេតា។',
    'Mathematics',
    'Advanced',
    '{10,11,12}',
    40,
    '{"Master trigonometric functions", "Convert degrees to radians", "Explore unit circle", "Graph trig functions"}',
    '{"ស្ទាត់ជំនាញអនុគមន៍ត្រីកោណមាត្រ", "បម្លែងដឺក្រេទៅរ៉ាដ្យង់", "ស្វែងយល់រង្វង់ឯកតា", "គូសក្រាហ្វអនុគមន៍ត្រីកោណមាត្រ"}',
    'https://phet.colorado.edu/sims/html/trig-tour/latest/trig-tour_km.html',
    'https://phet.colorado.edu/sims/html/trig-tour/latest/trig-tour-600.png',
    '{"mathematics", "trigonometry", "sine", "cosine", "unit circle", "ត្រីកោណមាត្រ", "ស៊ីនុស", "កូស៊ីនុស", "រង្វង់ឯកតា"}',
    true,
    true
),

-- 100. Least-Squares Regression
(
    'least-squares-regression',
    'Least-Squares Regression',
    'តំរែតំរង់ការេតូចបំផុត',
    'Create your own scatter plot or use real-world data and try to fit a line to it! Explore how individual data points affect the correlation coefficient and best-fit line.',
    'បង្កើតគ្រាប់ខ្ចាយផ្ទាល់ខ្លួនរបស់អ្នក ឬប្រើទិន្នន័យពិភពពិត ហើយព្យាយាមសមបន្ទាត់ទៅវា! ស្វែងយល់ពីរបៀបដែលចំណុចទិន្នន័យនីមួយៗប៉ះពាល់ដល់មេគុណសហសម្ព័ន្ធ និងបន្ទាត់សមល្អបំផុត។',
    'Mathematics',
    'Advanced',
    '{11,12}',
    45,
    '{"Perform linear regression", "Calculate correlation", "Analyze residuals", "Interpret best-fit lines"}',
    '{"ធ្វើតំរែតំរង់លីនេអ៊ែរ", "គណនាសហសម្ព័ន្ធ", "វិភាគសំណល់", "បកស្រាយបន្ទាត់សមល្អបំផុត"}',
    'https://phet.colorado.edu/sims/html/least-squares-regression/latest/least-squares-regression_km.html',
    'https://phet.colorado.edu/sims/html/least-squares-regression/latest/least-squares-regression-600.png',
    '{"mathematics", "statistics", "regression", "correlation", "data analysis", "ស្ថិតិ", "តំរែតំរង់", "សហសម្ព័ន្ធ", "វិភាគទិន្នន័យ"}',
    false,
    true
);