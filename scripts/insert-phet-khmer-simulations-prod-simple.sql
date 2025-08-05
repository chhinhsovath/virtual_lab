-- PhET Khmer Simulations Insert Script for Production (Simplified)
-- This script inserts PhET simulations that are available in Khmer language

-- Physics Simulations
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
-- 1. Forces and Motion: Basics
(
    'forces-and-motion-basics',
    'Forces and Motion: Basics',
    'កម្លាំង និងចលនា៖ មូលដ្ឋាន',
    'Explore the forces at work when pulling against a cart, and pushing a refrigerator, crate, or person. Create an applied force and see how it makes objects move. Change friction and see how it affects the motion of objects.',
    'ស្វែងយល់ពីកម្លាំងដែលកើតឡើងនៅពេលទាញរទេះ និងរុញទូទឹកកក ប្រអប់ ឬមនុស្ស។ បង្កើតកម្លាំងប្រើប្រាស់ហើយមើលពីរបៀបដែលវាធ្វើឲ្យវត្ថុផ្លាស់ទី។ ផ្លាស់ប្តូរកកិត ហើយមើលពីរបៀបដែលវាប៉ះពាល់ដល់ចលនារបស់វត្ថុ។',
    'Physics',
    'Beginner',
    '{6,7,8,9}',
    30,
    '{"Understand the concept of force and motion", "Learn about friction and its effects", "Explore balanced and unbalanced forces", "Apply Newton''s laws of motion"}',
    '{"យល់ដឹងពីគំនិតនៃកម្លាំង និងចលនា", "រៀនអំពីកកិត និងឥទ្ធិពលរបស់វា", "ស្វែងយល់ពីកម្លាំងស្មើគ្នា និងមិនស្មើគ្នា", "អនុវត្តច្បាប់ចលនារបស់ញូតុន"}',
    'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_km.html',
    'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics-600.png',
    '{"physics", "force", "motion", "friction", "Newton", "កម្លាំង", "ចលនា", "កកិត"}',
    true,
    true
),

-- 2. Energy Skate Park: Basics
(
    'energy-skate-park-basics',
    'Energy Skate Park: Basics',
    'ឧទ្យានជិះស្គីថាមពល៖ មូលដ្ឋាន',
    'Learn about conservation of energy with a skater gal! Explore different tracks and view the kinetic energy, potential energy and friction as she moves. Build your own tracks, ramps, and jumps for the skater.',
    'រៀនអំពីការអភិរក្សថាមពលជាមួយក្មេងស្រីជិះស្គី! ស្វែងយល់ផ្លូវផ្សេងៗ និងមើលថាមពលស៊ីនេទិច ថាមពលប៉ូតង់ស្យែល និងកកិតនៅពេលនាងផ្លាស់ទី។ សាងសង់ផ្លូវ ជម្រាល និងកន្លែងលោតផ្ទាល់ខ្លួនរបស់អ្នកសម្រាប់អ្នកជិះស្គី។',
    'Physics',
    'Intermediate',
    '{7,8,9,10}',
    45,
    '{"Understand conservation of energy", "Differentiate between kinetic and potential energy", "Explore energy transformations", "Analyze the effect of friction on energy"}',
    '{"យល់ដឹងពីការអភិរក្សថាមពល", "បែងចែករវាងថាមពលស៊ីនេទិច និងថាមពលប៉ូតង់ស្យែល", "ស្វែងយល់ពីការបំប្លែងថាមពល", "វិភាគឥទ្ធិពលនៃកកិតលើថាមពល"}',
    'https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_km.html',
    'https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics-600.png',
    '{"physics", "energy", "conservation", "kinetic", "potential", "ថាមពល", "អភិរក្ស", "ស៊ីនេទិច", "ប៉ូតង់ស្យែល"}',
    true,
    true
),

-- 3. Gravity and Orbits
(
    'gravity-and-orbits',
    'Gravity and Orbits',
    'ទំនាញ និងគន្លង',
    'Move the sun, earth, moon and space station to see how it affects their gravitational forces and orbital paths. Visualize the sizes and distances between different heavenly bodies, and turn off gravity to see what would happen without it!',
    'ផ្លាស់ទីព្រះអាទិត្យ ផែនដី ព្រះច័ន្ទ និងស្ថានីយ៍អវកាសដើម្បីមើលពីរបៀបដែលវាប៉ះពាល់ដល់កម្លាំងទំនាញ និងគន្លងគោចររបស់វា។ មើលឃើញទំហំ និងចម្ងាយរវាងតារាវត្ថុផ្សេងៗ ហើយបិទទំនាញដើម្បីមើលថាតើនឹងមានអ្វីកើតឡើងបើគ្មានវា!',
    'Physics',
    'Intermediate',
    '{8,9,10,11}',
    40,
    '{"Understand gravitational force", "Explore orbital mechanics", "Learn about celestial bodies", "Analyze factors affecting orbits"}',
    '{"យល់ដឹងពីកម្លាំងទំនាញ", "ស្វែងយល់ពីមេកានិចគន្លង", "រៀនអំពីតារាវត្ថុ", "វិភាគកត្តាដែលប៉ះពាល់ដល់គន្លង"}',
    'https://phet.colorado.edu/sims/html/gravity-and-orbits/latest/gravity-and-orbits_km.html',
    'https://phet.colorado.edu/sims/html/gravity-and-orbits/latest/gravity-and-orbits-600.png',
    '{"physics", "gravity", "orbit", "solar system", "space", "ទំនាញ", "គន្លង", "ប្រព័ន្ធព្រះអាទិត្យ", "អវកាស"}',
    true,
    true
),

-- 4. Pendulum Lab
(
    'pendulum-lab',
    'Pendulum Lab',
    'មន្ទីរពិសោធន៍ប៉ង់ដុល',
    'Play with one or two pendulums and discover how the period of a simple pendulum depends on the length of the string, the mass of the pendulum bob, the strength of gravity, and the amplitude of the swing.',
    'លេងជាមួយប៉ង់ដុលមួយ ឬពីរ ហើយរកឃើញពីរបៀបដែលរយៈពេលនៃប៉ង់ដុលសាមញ្ញអាស្រ័យលើប្រវែងខ្សែ ម៉ាស់គ្រាប់ប៉ង់ដុល កម្លាំងទំនាញ និងអំព្លីទុតនៃការយោល។',
    'Physics',
    'Advanced',
    '{9,10,11,12}',
    50,
    '{"Investigate pendulum motion", "Understand factors affecting period", "Apply principles of simple harmonic motion", "Analyze energy in pendulum systems"}',
    '{"ស៊ើបអង្កេតចលនាប៉ង់ដុល", "យល់ដឹងពីកត្តាដែលប៉ះពាល់ដល់រយៈពេល", "អនុវត្តគោលការណ៍នៃចលនាអាម៉ូនិចសាមញ្ញ", "វិភាគថាមពលក្នុងប្រព័ន្ធប៉ង់ដុល"}',
    'https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_km.html',
    'https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab-600.png',
    '{"physics", "pendulum", "period", "harmonic motion", "oscillation", "ប៉ង់ដុល", "រយៈពេល", "ចលនាអាម៉ូនិច", "លំយោល"}',
    false,
    true
),

-- 5. Projectile Motion
(
    'projectile-motion',
    'Projectile Motion',
    'ចលនាគ្រាប់កាំភ្លើង',
    'Blast a car out of a cannon, and challenge yourself to hit a target! Learn about projectile motion by firing various objects. Set parameters such as angle, initial speed, and mass.',
    'បាញ់រថយន្តចេញពីកាំភ្លើងធំ ហើយប្រកួតប្រជែងខ្លួនឯងដើម្បីបាញ់ត្រូវគោលដៅ! រៀនអំពីចលនាគ្រាប់កាំភ្លើងដោយបាញ់វត្ថុផ្សេងៗ។ កំណត់ប៉ារ៉ាម៉ែត្រដូចជាមុំ ល្បឿនដំបូង និងម៉ាស់។',
    'Physics',
    'Intermediate',
    '{8,9,10,11}',
    35,
    '{"Understand projectile motion principles", "Analyze trajectory paths", "Calculate range and maximum height", "Explore effects of air resistance"}',
    '{"យល់ដឹងពីគោលការណ៍ចលនាគ្រាប់កាំភ្លើង", "វិភាគគន្លងគោចរ", "គណនាជួរ និងកម្ពស់អតិបរមា", "ស្វែងយល់ពីឥទ្ធិពលនៃភាពធន់នឹងខ្យល់"}',
    'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_km.html',
    'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion-600.png',
    '{"physics", "projectile", "trajectory", "motion", "kinematics", "គ្រាប់កាំភ្លើង", "គន្លងគោចរ", "ចលនា", "គីនេម៉ាទិច"}',
    true,
    true
),

-- Chemistry Simulations
-- 6. Build an Atom
(
    'build-an-atom',
    'Build an Atom',
    'សាងសង់អាតូម',
    'Build atoms from protons, neutrons, and electrons, and see how the element, charge, and mass change. Then play a game to test your ideas!',
    'សាងសង់អាតូមពីប្រូតុង នឺត្រុង និងអេឡិចត្រុង ហើយមើលពីរបៀបដែលធាតុ បន្ទុក និងម៉ាស់ផ្លាស់ប្តូរ។ បន្ទាប់មកលេងហ្គេមដើម្បីសាកល្បងគំនិតរបស់អ្នក!',
    'Chemistry',
    'Beginner',
    '{7,8,9,10}',
    30,
    '{"Understand atomic structure", "Learn about protons, neutrons, and electrons", "Explore isotopes and ions", "Identify elements from atomic composition"}',
    '{"យល់ដឹងពីរចនាសម្ព័ន្ធអាតូម", "រៀនអំពីប្រូតុង នឺត្រុង និងអេឡិចត្រុង", "ស្វែងយល់អំពីអ៊ីសូតូប និងអ៊ីយ៉ុង", "កំណត់អត្តសញ្ញាណធាតុពីសមាសភាពអាតូម"}',
    'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_km.html',
    'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom-600.png',
    '{"chemistry", "atom", "proton", "neutron", "electron", "គីមីវិទ្យា", "អាតូម", "ប្រូតុង", "នឺត្រុង", "អេឡិចត្រុង"}',
    true,
    true
),

-- 7. Balancing Chemical Equations
(
    'balancing-chemical-equations',
    'Balancing Chemical Equations',
    'តុល្យភាពសមីការគីមី',
    'How do you know if a chemical equation is balanced? What can you change to balance an equation? Play a game to test your ideas!',
    'តើអ្នកដឹងថាសមីការគីមីមានតុល្យភាពដោយរបៀបណា? តើអ្នកអាចផ្លាស់ប្តូរអ្វីដើម្បីធ្វើឲ្យសមីការមានតុល្យភាព? លេងហ្គេមដើម្បីសាកល្បងគំនិតរបស់អ្នក!',
    'Chemistry',
    'Intermediate',
    '{8,9,10,11}',
    40,
    '{"Balance chemical equations", "Understand conservation of mass", "Learn about coefficients in equations", "Apply law of conservation of atoms"}',
    '{"ធ្វើតុល្យភាពសមីការគីមី", "យល់ដឹងពីការអភិរក្សម៉ាស់", "រៀនអំពីមេគុណក្នុងសមីការ", "អនុវត្តច្បាប់អភិរក្សអាតូម"}',
    'https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_km.html',
    'https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations-600.png',
    '{"chemistry", "equation", "balance", "reaction", "coefficient", "គីមីវិទ្យា", "សមីការ", "តុល្យភាព", "ប្រតិកម្ម", "មេគុណ"}',
    true,
    true
),

-- 8. pH Scale: Basics
(
    'ph-scale-basics',
    'pH Scale: Basics',
    'មាត្រដ្ឋាន pH៖ មូលដ្ឋាន',
    'Test the pH of things like coffee, spit, and soap to determine whether each is acidic, basic, or neutral. Visualize the relative number of hydroxide ions and hydronium ions in solution.',
    'សាកល្បង pH នៃវត្ថុដូចជាកាហ្វេ ទឹកមាត់ និងសាប៊ូដើម្បីកំណត់ថាតើវាមានលក្ខណៈអាស៊ីត បាស ឬអព្យាក្រឹត។ មើលឃើញចំនួនទាក់ទងនៃអ៊ីយ៉ុងអ៊ីដ្រុកស៊ីត និងអ៊ីយ៉ុងអ៊ីដ្រូនីញ៉ូមក្នុងសូលុយស្យុង។',
    'Chemistry',
    'Beginner',
    '{7,8,9,10}',
    25,
    '{"Understand pH scale", "Differentiate acids and bases", "Learn about H+ and OH- ions", "Test common substances"}',
    '{"យល់ដឹងពីមាត្រដ្ឋាន pH", "បែងចែកអាស៊ីត និងបាស", "រៀនអំពីអ៊ីយ៉ុង H+ និង OH-", "សាកល្បងសារធាតុទូទៅ"}',
    'https://phet.colorado.edu/sims/html/ph-scale-basics/latest/ph-scale-basics_km.html',
    'https://phet.colorado.edu/sims/html/ph-scale-basics/latest/ph-scale-basics-600.png',
    '{"chemistry", "pH", "acid", "base", "neutral", "គីមីវិទ្យា", "អាស៊ីត", "បាស", "អព្យាក្រឹត"}',
    false,
    true
),

-- 9. States of Matter: Basics
(
    'states-of-matter-basics',
    'States of Matter: Basics',
    'សភាពរូបធាតុ៖ មូលដ្ឋាន',
    'Heat, cool and compress atoms and molecules and watch as they change between solid, liquid and gas phases.',
    'កំដៅ ត្រជាក់ និងបង្ហាប់អាតូម និងម៉ូលេគុល ហើយមើលនៅពេលពួកវាផ្លាស់ប្តូររវាងសភាពរឹង រាវ និងឧស្ម័ន។',
    'Chemistry',
    'Beginner',
    '{6,7,8,9}',
    30,
    '{"Understand states of matter", "Observe phase transitions", "Learn about molecular motion", "Explore temperature effects"}',
    '{"យល់ដឹងពីសភាពរូបធាតុ", "សង្កេតការផ្លាស់ប្តូរដំណាក់កាល", "រៀនអំពីចលនាម៉ូលេគុល", "ស្វែងយល់ពីឥទ្ធិពលសីតុណ្ហភាព"}',
    'https://phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics_km.html',
    'https://phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics-600.png',
    '{"chemistry", "states of matter", "solid", "liquid", "gas", "សភាពរូបធាតុ", "រឹង", "រាវ", "ឧស្ម័ន"}',
    true,
    true
),

-- 10. Concentration
(
    'concentration',
    'Concentration',
    'កំហាប់',
    'Watch your solution change color as you mix chemicals with water. Then check molarity with the concentration meter. What are the units of concentration?',
    'មើលសូលុយស្យុងរបស់អ្នកផ្លាស់ប្តូរពណ៌នៅពេលអ្នកលាយសារធាតុគីមីជាមួយទឹក។ បន្ទាប់មកពិនិត្យម៉ូឡារីតេជាមួយឧបករណ៍វាស់កំហាប់។ តើឯកតានៃកំហាប់គឺជាអ្វី?',
    'Chemistry',
    'Intermediate',
    '{8,9,10,11}',
    35,
    '{"Understand concentration concepts", "Calculate molarity", "Explore dilution", "Learn about saturation"}',
    '{"យល់ដឹងពីគំនិតកំហាប់", "គណនាម៉ូឡារីតេ", "ស្វែងយល់ពីការពន្លាយ", "រៀនអំពីការឆ្អែត"}',
    'https://phet.colorado.edu/sims/html/concentration/latest/concentration_km.html',
    'https://phet.colorado.edu/sims/html/concentration/latest/concentration-600.png',
    '{"chemistry", "concentration", "molarity", "solution", "dilution", "កំហាប់", "ម៉ូឡារីតេ", "សូលុយស្យុង", "ការពន្លាយ"}',
    false,
    true
),

-- Biology Simulations
-- 11. Natural Selection
(
    'natural-selection',
    'Natural Selection',
    'ជម្រើសធម្មជាតិ',
    'Explore how organisms with different traits survive various selection agents within the environment.',
    'ស្វែងយល់ពីរបៀបដែលសារពាង្គកាយដែលមានលក្ខណៈផ្សេងៗរស់រានមានជីវិតពីភ្នាក់ងារជម្រើសផ្សេងៗក្នុងបរិស្ថាន។',
    'Biology',
    'Intermediate',
    '{9,10,11,12}',
    45,
    '{"Understand natural selection", "Explore genetic variations", "Analyze survival traits", "Learn about evolution"}',
    '{"យល់ដឹងពីជម្រើសធម្មជាតិ", "ស្វែងយល់ពីបំរែបំរួលហ្សែន", "វិភាគលក្ខណៈរស់រានមានជីវិត", "រៀនអំពីវិវត្តន៍"}',
    'https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_km.html',
    'https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection-600.png',
    '{"biology", "evolution", "natural selection", "genetics", "traits", "ជីវវិទ្យា", "វិវត្តន៍", "ជម្រើសធម្មជាតិ", "ហ្សែនេទិច"}',
    true,
    true
),

-- 12. Gene Expression Essentials
(
    'gene-expression-essentials',
    'Gene Expression Essentials',
    'មូលដ្ឋានបញ្ចេញហ្សែន',
    'Learn how a gene directs the production of a protein in a cell. Regulate gene expression and see the effects.',
    'រៀនពីរបៀបដែលហ្សែនដឹកនាំការផលិតប្រូតេអ៊ីនក្នុងកោសិកា។ គ្រប់គ្រងការបញ្ចេញហ្សែន ហើយមើលឥទ្ធិពល។',
    'Biology',
    'Advanced',
    '{10,11,12}',
    50,
    '{"Understand gene expression", "Learn about transcription and translation", "Explore protein synthesis", "Analyze gene regulation"}',
    '{"យល់ដឹងពីការបញ្ចេញហ្សែន", "រៀនអំពីការចម្លង និងការបកប្រែ", "ស្វែងយល់ពីការសំយោគប្រូតេអ៊ីន", "វិភាគការគ្រប់គ្រងហ្សែន"}',
    'https://phet.colorado.edu/sims/html/gene-expression-essentials/latest/gene-expression-essentials_km.html',
    'https://phet.colorado.edu/sims/html/gene-expression-essentials/latest/gene-expression-essentials-600.png',
    '{"biology", "genetics", "gene expression", "protein", "DNA", "ជីវវិទ្យា", "ហ្សែនេទិច", "ការបញ្ចេញហ្សែន", "ប្រូតេអ៊ីន"}',
    false,
    true
),

-- 13. Neuron
(
    'neuron',
    'Neuron',
    'ណឺរ៉ូន',
    'Stimulate a neuron and monitor what happens. Pause, rewind, and move forward in time in order to observe the ions as they move across the neuron membrane.',
    'ជំរុញណឺរ៉ូន ហើយតាមដានអ្វីដែលកើតឡើង។ ផ្អាក ខារថយក្រោយ និងរំកិលទៅមុខតាមពេលវេលាដើម្បីសង្កេតអ៊ីយ៉ុងនៅពេលពួកវាផ្លាស់ទីឆ្លងកាត់ភ្នាសណឺរ៉ូន។',
    'Biology',
    'Advanced',
    '{11,12}',
    40,
    '{"Understand neuron function", "Learn about action potentials", "Explore ion channels", "Analyze nerve impulse transmission"}',
    '{"យល់ដឹងពីមុខងារណឺរ៉ូន", "រៀនអំពីសក្តានុពលសកម្ម", "ស្វែងយល់ពីបណ្តាញអ៊ីយ៉ុង", "វិភាគការបញ្ជូនជំរុញសរសៃប្រសាទ"}',
    'https://phet.colorado.edu/sims/html/neuron/latest/neuron_km.html',
    'https://phet.colorado.edu/sims/html/neuron/latest/neuron-600.png',
    '{"biology", "neuroscience", "neuron", "action potential", "nervous system", "ជីវវិទ្យា", "វិទ្យាសាស្ត្រសរសៃប្រសាទ", "ណឺរ៉ូន", "សក្តានុពលសកម្ម"}',
    false,
    true
),

-- Mathematics Simulations
-- 14. Area Builder
(
    'area-builder',
    'Area Builder',
    'អ្នកសាងសង់ផ្ទៃ',
    'Create shapes using colorful blocks and explore concepts of area and perimeter. Compare the area and perimeter of two shapes side-by-side.',
    'បង្កើតរាងដោយប្រើប្លុកចម្រុះពណ៌ ហើយស្វែងយល់គំនិតនៃផ្ទៃ និងបរិមាត្រ។ ប្រៀបធៀបផ្ទៃ និងបរិមាត្រនៃរាងពីរក្បែរគ្នា។',
    'Mathematics',
    'Beginner',
    '{3,4,5,6}',
    25,
    '{"Understand area concepts", "Calculate perimeter", "Compare shapes", "Develop spatial reasoning"}',
    '{"យល់ដឹងពីគំនិតផ្ទៃ", "គណនាបរិមាត្រ", "ប្រៀបធៀបរាង", "អភិវឌ្ឍការវែកញែកលំហ"}',
    'https://phet.colorado.edu/sims/html/area-builder/latest/area-builder_km.html',
    'https://phet.colorado.edu/sims/html/area-builder/latest/area-builder-600.png',
    '{"mathematics", "geometry", "area", "perimeter", "shapes", "គណិតវិទ្យា", "ធរណីមាត្រ", "ផ្ទៃ", "បរិមាត្រ", "រាង"}',
    true,
    true
),

-- 15. Fraction Matcher
(
    'fraction-matcher',
    'Fraction Matcher',
    'អ្នកផ្គូផ្គងប្រភាគ',
    'Match shapes and numbers to earn stars in this fractions game. Challenge yourself on any level you like. Try to collect lots of stars!',
    'ផ្គូផ្គងរាង និងលេខដើម្បីទទួលបានផ្កាយក្នុងហ្គេមប្រភាគនេះ។ ប្រកួតប្រជែងខ្លួនឯងនៅកម្រិតណាមួយដែលអ្នកចូលចិត្ត។ ព្យាយាមប្រមូលផ្កាយឲ្យបានច្រើន!',
    'Mathematics',
    'Beginner',
    '{3,4,5,6}',
    20,
    '{"Understand fractions", "Match visual representations", "Compare fraction values", "Develop number sense"}',
    '{"យល់ដឹងពីប្រភាគ", "ផ្គូផ្គងតំណាងដោយមើលឃើញ", "ប្រៀបធៀបតម្លៃប្រភាគ", "អភិវឌ្ឍការយល់ដឹងលេខ"}',
    'https://phet.colorado.edu/sims/html/fraction-matcher/latest/fraction-matcher_km.html',
    'https://phet.colorado.edu/sims/html/fraction-matcher/latest/fraction-matcher-600.png',
    '{"mathematics", "fractions", "matching", "numbers", "game", "គណិតវិទ្យា", "ប្រភាគ", "ផ្គូផ្គង", "លេខ", "ហ្គេម"}',
    false,
    true
),

-- 16. Graphing Lines
(
    'graphing-lines',
    'Graphing Lines',
    'គូសក្រាហ្វបន្ទាត់',
    'Explore the world of lines. Investigate the relationships between linear equations, slope, and graphs of lines.',
    'ស្វែងរកពិភពនៃបន្ទាត់។ ស៊ើបអង្កេតទំនាក់ទំនងរវាងសមីការលីនេអ៊ែរ ជម្រាល និងក្រាហ្វនៃបន្ទាត់។',
    'Mathematics',
    'Intermediate',
    '{7,8,9,10}',
    35,
    '{"Understand linear equations", "Calculate slope", "Graph lines from equations", "Find equation from graph"}',
    '{"យល់ដឹងពីសមីការលីនេអ៊ែរ", "គណនាជម្រាល", "គូសក្រាហ្វបន្ទាត់ពីសមីការ", "រកសមីការពីក្រាហ្វ"}',
    'https://phet.colorado.edu/sims/html/graphing-lines/latest/graphing-lines_km.html',
    'https://phet.colorado.edu/sims/html/graphing-lines/latest/graphing-lines-600.png',
    '{"mathematics", "algebra", "graphing", "linear", "slope", "គណិតវិទ្យា", "ពិជគណិត", "គូសក្រាហ្វ", "លីនេអ៊ែរ", "ជម្រាល"}',
    true,
    true
),

-- 17. Arithmetic
(
    'arithmetic',
    'Arithmetic',
    'នព្វន្ធ',
    'Practice multiplication tables and arithmetic operations with fun interactive exercises.',
    'អនុវត្តតារាងគុណ និងប្រតិបត្តិការនព្វន្ធជាមួយលំហាត់អន្តរកម្មដ៏រីករាយ។',
    'Mathematics',
    'Beginner',
    '{2,3,4,5}',
    20,
    '{"Master multiplication tables", "Practice division", "Improve mental math", "Build number fluency"}',
    '{"ស្ទាត់ជំនាញតារាងគុណ", "អនុវត្តចែក", "កែលម្អគណិតផ្លូវចិត្ត", "កសាងភាពស្ទាត់ជំនាញលេខ"}',
    'https://phet.colorado.edu/sims/html/arithmetic/latest/arithmetic_km.html',
    'https://phet.colorado.edu/sims/html/arithmetic/latest/arithmetic-600.png',
    '{"mathematics", "arithmetic", "multiplication", "division", "គណិតវិទ្យា", "នព្វន្ធ", "គុណ", "ចែក"}',
    true,
    true
),

-- 18. Function Builder
(
    'function-builder',
    'Function Builder',
    'អ្នកសាងសង់អនុគមន៍',
    'Build functions using patterns and explore how inputs and outputs are related through function machines.',
    'សាងសង់អនុគមន៍ដោយប្រើលំនាំ ហើយស្វែងយល់ពីរបៀបដែលធាតុចូល និងធាតុចេញទាក់ទងគ្នាតាមរយៈម៉ាស៊ីនអនុគមន៍។',
    'Mathematics',
    'Intermediate',
    '{6,7,8,9}',
    30,
    '{"Understand function concepts", "Build function machines", "Explore input-output relationships", "Create complex functions"}',
    '{"យល់ដឹងពីគំនិតអនុគមន៍", "សាងសង់ម៉ាស៊ីនអនុគមន៍", "ស្វែងយល់ទំនាក់ទំនងធាតុចូល-ចេញ", "បង្កើតអនុគមន៍ស្មុគស្មាញ"}',
    'https://phet.colorado.edu/sims/html/function-builder/latest/function-builder_km.html',
    'https://phet.colorado.edu/sims/html/function-builder/latest/function-builder-600.png',
    '{"mathematics", "functions", "algebra", "patterns", "គណិតវិទ្យា", "អនុគមន៍", "ពិជគណិត", "លំនាំ"}',
    false,
    true
),

-- Earth Science
-- 19. Plate Tectonics
(
    'plate-tectonics',
    'Plate Tectonics',
    'ធរណីសាស្ត្រផ្ទាំង',
    'Explore how plates move on the surface of the earth. Change temperature, composition, and thickness of plates. Discover how to create new mountains, volcanoes, and ocean basins.',
    'ស្វែងយល់ពីរបៀបដែលផ្ទាំងផ្លាស់ទីនៅលើផ្ទៃផែនដី។ ផ្លាស់ប្តូរសីតុណ្ហភាព សមាសភាព និងកម្រាស់ផ្ទាំង។ រកឃើញពីរបៀបបង្កើតភ្នំ ភ្នំភ្លើង និងអាងមហាសមុទ្រថ្មី។',
    'Physics',
    'Intermediate',
    '{8,9,10,11}',
    40,
    '{"Understand plate tectonics", "Explore continental drift", "Learn about earthquakes and volcanoes", "Analyze geological processes"}',
    '{"យល់ដឹងពីធរណីសាស្ត្រផ្ទាំង", "ស្វែងយល់ពីការរសាត់ទ្វីប", "រៀនអំពីរញ្ជួយដី និងភ្នំភ្លើង", "វិភាគដំណើរការភូគព្ភសាស្ត្រ"}',
    'https://phet.colorado.edu/sims/html/plate-tectonics/latest/plate-tectonics_km.html',
    'https://phet.colorado.edu/sims/html/plate-tectonics/latest/plate-tectonics-600.png',
    '{"earth science", "geology", "plate tectonics", "volcanoes", "earthquakes", "វិទ្យាសាស្ត្រផែនដី", "ភូគព្ភសាស្ត្រ", "ធរណីសាស្ត្រផ្ទាំង", "ភ្នំភ្លើង", "រញ្ជួយដី"}',
    true,
    true
),

-- 20. Greenhouse Effect
(
    'greenhouse-effect',
    'Greenhouse Effect',
    'ឥទ្ធិពលផ្ទះកញ្ចក់',
    'How do greenhouse gases affect the climate? Explore the atmosphere during the ice age and today. What happens when you add clouds? Change the greenhouse gas concentration and see how the temperature changes.',
    'តើឧស្ម័នផ្ទះកញ្ចក់ប៉ះពាល់ដល់អាកាសធាតុដោយរបៀបណា? ស្វែងយល់បរិយាកាសក្នុងយុគទឹកកក និងសព្វថ្ងៃ។ តើមានអ្វីកើតឡើងនៅពេលអ្នកបន្ថែមពពក? ផ្លាស់ប្តូរកំហាប់ឧស្ម័នផ្ទះកញ្ចក់ ហើយមើលពីរបៀបដែលសីតុណ្ហភាពផ្លាស់ប្តូរ។',
    'Physics',
    'Intermediate',
    '{7,8,9,10}',
    35,
    '{"Understand greenhouse effect", "Explore climate change", "Analyze atmospheric gases", "Learn about global warming"}',
    '{"យល់ដឹងពីឥទ្ធិពលផ្ទះកញ្ចក់", "ស្វែងយល់ពីការប្រែប្រួលអាកាសធាតុ", "វិភាគឧស្ម័នបរិយាកាស", "រៀនអំពីការឡើងកំដៅសកល"}',
    'https://phet.colorado.edu/sims/html/greenhouse-effect/latest/greenhouse-effect_km.html',
    'https://phet.colorado.edu/sims/html/greenhouse-effect/latest/greenhouse-effect-600.png',
    '{"earth science", "climate", "greenhouse effect", "atmosphere", "global warming", "វិទ្យាសាស្ត្រផែនដី", "អាកាសធាតុ", "ឥទ្ធិពលផ្ទះកញ្ចក់", "បរិយាកាស", "ការឡើងកំដៅសកល"}',
    true,
    true
);

-- Verify insertion
SELECT COUNT(*) as total_simulations FROM stem_simulations_catalog;