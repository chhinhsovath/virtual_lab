-- Stage 2: Second 30% of PhET Khmer simulations (30 simulations)
-- This adds the second batch to production database

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

-- MATHEMATICS SIMULATIONS CONTINUED (31-35)

-- 31. Projectile Data Lab
(
    'projectile-data-lab',
    'Projectile Data Lab',
    'មន្ទីរពិសោធន៍ទិន្នន័យគ្រាប់កាំភ្លើង',
    'Analyze projectile motion data to understand the relationship between launch parameters and trajectory.',
    'វិភាគទិន្នន័យចលនាគ្រាប់កាំភ្លើងដើម្បីយល់ដឹងពីទំនាក់ទំនងរវាងប៉ារ៉ាម៉ែត្របាញ់ និងគន្លង។',
    'Mathematics',
    'Advanced',
    '{10,11,12}',
    45,
    '{"Analyze motion data", "Create data visualizations", "Apply statistical methods", "Draw scientific conclusions"}',
    '{"វិភាគទិន្នន័យចលនា", "បង្កើតការមើលឃើញទិន្នន័យ", "អនុវត្តវិធីសាស្ត្រស្ថិតិ", "ទាញសេចក្តីសន្និដ្ឋានវិទ្យាសាស្ត្រ"}',
    'https://phet.colorado.edu/sims/html/projectile-data-lab/latest/projectile-data-lab_km.html',
    'https://phet.colorado.edu/sims/html/projectile-data-lab/latest/projectile-data-lab-600.png',
    '{"mathematics", "data", "statistics", "projectile", "analysis", "ទិន្នន័យ", "ស្ថិតិ", "គ្រាប់កាំភ្លើង", "វិភាគ"}',
    false,
    true
),

-- 32. Center and Variability
(
    'center-and-variability',
    'Center and Variability',
    'ចំណុចកណ្តាល និងភាពប្រែប្រួល',
    'Explore how center and variability relate to data sets. Create your own data or use real data to understand mean, median, and measures of spread.',
    'ស្វែងយល់ពីរបៀបដែលចំណុចកណ្តាល និងភាពប្រែប្រួលទាក់ទងនឹងសំណុំទិន្នន័យ។ បង្កើតទិន្នន័យផ្ទាល់ខ្លួន ឬប្រើទិន្នន័យពិតដើម្បីយល់ដឹងពីមធ្យម មេដ្យាន និងរង្វាស់នៃការរីករាល។',
    'Mathematics',
    'Intermediate',
    '{7,8,9,10}',
    35,
    '{"Calculate measures of center", "Understand variability", "Compare data distributions", "Apply statistical concepts"}',
    '{"គណនារង្វាស់ចំណុចកណ្តាល", "យល់ដឹងពីភាពប្រែប្រួល", "ប្រៀបធៀបការបែងចែកទិន្នន័យ", "អនុវត្តគំនិតស្ថិតិ"}',
    'https://phet.colorado.edu/sims/html/center-and-variability/latest/center-and-variability_km.html',
    'https://phet.colorado.edu/sims/html/center-and-variability/latest/center-and-variability-600.png',
    '{"mathematics", "statistics", "mean", "median", "variability", "ស្ថិតិ", "មធ្យម", "មេដ្យាន", "ភាពប្រែប្រួល"}',
    true,
    true
),

-- 33. Quadrilateral
(
    'quadrilateral',
    'Quadrilateral',
    'ចតុកោណ',
    'Explore the properties of quadrilaterals by changing side lengths and angles. Discover special types of quadrilaterals and their properties.',
    'ស្វែងយល់លក្ខណៈសម្បត្តិនៃចតុកោណដោយផ្លាស់ប្តូរប្រវែងជ្រុង និងមុំ។ រកឃើញប្រភេទពិសេសនៃចតុកោណ និងលក្ខណៈសម្បត្តិរបស់ពួកវា។',
    'Mathematics',
    'Intermediate',
    '{6,7,8,9}',
    30,
    '{"Identify quadrilateral types", "Understand angle relationships", "Explore side properties", "Apply geometric reasoning"}',
    '{"កំណត់ប្រភេទចតុកោណ", "យល់ដឹងទំនាក់ទំនងមុំ", "ស្វែងយល់លក្ខណៈសម្បត្តិជ្រុង", "អនុវត្តការវែកញែកធរណីមាត្រ"}',
    'https://phet.colorado.edu/sims/html/quadrilateral/latest/quadrilateral_km.html',
    'https://phet.colorado.edu/sims/html/quadrilateral/latest/quadrilateral-600.png',
    '{"mathematics", "geometry", "quadrilateral", "shapes", "angles", "ធរណីមាត្រ", "ចតុកោណ", "រូបរាង", "មុំ"}',
    false,
    true
),

-- 34. Calculus Grapher
(
    'calculus-grapher',
    'Calculus Grapher',
    'ក្រាហ្វកាលគុលុស',
    'Graph functions and their derivatives. Explore the connections between a function and its derivative through interactive graphing.',
    'គូសក្រាហ្វអនុគមន៍ និងដេរីវេរបស់វា។ ស្វែងយល់ការតភ្ជាប់រវាងអនុគមន៍ និងដេរីវេរបស់វាតាមរយៈការគូសក្រាហ្វអន្តរកម្ម។',
    'Mathematics',
    'Advanced',
    '{11,12}',
    40,
    '{"Graph functions", "Understand derivatives", "Explore calculus concepts", "Analyze rate of change"}',
    '{"គូសក្រាហ្វអនុគមន៍", "យល់ដឹងពីដេរីវេ", "ស្វែងយល់គំនិតកាលគុលុស", "វិភាគអត្រាផ្លាស់ប្តូរ"}',
    'https://phet.colorado.edu/sims/html/calculus-grapher/latest/calculus-grapher_km.html',
    'https://phet.colorado.edu/sims/html/calculus-grapher/latest/calculus-grapher-600.png',
    '{"mathematics", "calculus", "derivative", "function", "graph", "កាលគុលុស", "ដេរីវេ", "អនុគមន៍", "ក្រាហ្វ"}',
    false,
    true
),

-- 35. Number Compare
(
    'number-compare',
    'Number Compare',
    'ប្រៀបធៀបលេខ',
    'Compare numbers using different representations. Build number sense through visual comparisons.',
    'ប្រៀបធៀបលេខដោយប្រើតំណាងផ្សេងៗ។ បង្កើតការយល់ដឹងពីលេខតាមរយៈការប្រៀបធៀបដែលមើលឃើញ។',
    'Mathematics',
    'Beginner',
    '{1,2,3,4}',
    20,
    '{"Compare numbers", "Understand greater/less than", "Use visual models", "Build number sense"}',
    '{"ប្រៀបធៀបលេខ", "យល់ដឹងពីធំជាង/តូចជាង", "ប្រើគំរូមើលឃើញ", "បង្កើតការយល់ដឹងពីលេខ"}',
    'https://phet.colorado.edu/sims/html/number-compare/latest/number-compare_km.html',
    'https://phet.colorado.edu/sims/html/number-compare/latest/number-compare-600.png',
    '{"mathematics", "numbers", "comparison", "elementary", "basic", "លេខ", "ការប្រៀបធៀប", "បឋម", "មូលដ្ឋាន"}',
    true,
    true
),

-- PHYSICS SIMULATIONS CONTINUED (36-50)

-- 36. Wave Interference
(
    'wave-interference',
    'Wave Interference',
    'ការជ្រៀតជ្រែករលក',
    'Make waves with a dripping faucet, audio speaker, or laser! Add a second source to create an interference pattern.',
    'បង្កើតរលកជាមួយរ៉ូប៊ីនេស្រក់ទឹក ឧបាល័រសំឡេង ឬឡាសែរ! បន្ថែមប្រភពទីពីរដើម្បីបង្កើតលំនាំជ្រៀតជ្រែក។',
    'Physics',
    'Advanced',
    '{10,11,12}',
    40,
    '{"Understand wave interference", "Explore diffraction patterns", "Analyze constructive and destructive interference", "Apply wave superposition"}',
    '{"យល់ដឹងពីការជ្រៀតជ្រែករលក", "ស្វែងយល់លំនាំបែកពន្លឺ", "វិភាគការជ្រៀតជ្រែកស្ថាបនា និងបំផ្លាញ", "អនុវត្តការត្រួតគ្នារលក"}',
    'https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_km.html',
    'https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference-600.png',
    '{"physics", "waves", "interference", "diffraction", "superposition", "រលក", "ការជ្រៀតជ្រែក", "ការបែកពន្លឺ", "ការត្រួតគ្នា"}',
    true,
    true
),

-- 37. Coulomb's Law
(
    'coulombs-law',
    'Coulomb''s Law',
    'ច្បាប់កូឡុំ',
    'Visualize the electrostatic force that two charges exert on each other. Observe how changing the sign and magnitude of the charges affects the electrostatic force.',
    'មើលឃើញកម្លាំងអេឡិចត្រូស្តាទិចដែលបន្ទុកពីរបញ្ចេញលើគ្នាទៅវិញទៅមក។ សង្កេតពីរបៀបដែលការផ្លាស់ប្តូរសញ្ញា និងទំហំនៃបន្ទុកប៉ះពាល់ដល់កម្លាំងអេឡិចត្រូស្តាទិច។',
    'Physics',
    'Intermediate',
    '{9,10,11,12}',
    30,
    '{"Understand Coulombs law", "Explore electric force", "Compare with gravitational force", "Apply inverse square law"}',
    '{"យល់ដឹងពីច្បាប់កូឡុំ", "ស្វែងយល់កម្លាំងអគ្គិសនី", "ប្រៀបធៀបជាមួយកម្លាំងទំនាញ", "អនុវត្តច្បាប់ការេច្រាស"}',
    'https://phet.colorado.edu/sims/html/coulombs-law/latest/coulombs-law_km.html',
    'https://phet.colorado.edu/sims/html/coulombs-law/latest/coulombs-law-600.png',
    '{"physics", "electricity", "Coulomb", "force", "charge", "អគ្គិសនី", "កូឡុំ", "កម្លាំង", "បន្ទុក"}',
    false,
    true
),

-- 38. Capacitor Lab: Basics
(
    'capacitor-lab-basics',
    'Capacitor Lab: Basics',
    'មន្ទីរពិសោធន៍កុងដង់សាទ័រ៖ មូលដ្ឋាន',
    'Explore how a capacitor works! Change the size of the plates and add a dielectric to see how it affects capacitance.',
    'ស្វែងយល់ពីរបៀបដែលកុងដង់សាទ័រដំណើរការ! ផ្លាស់ប្តូរទំហំនៃបន្ទះ និងបន្ថែមឌីអេឡិចត្រិចដើម្បីមើលពីរបៀបដែលវាប៉ះពាល់ដល់កាប៉ាស៊ីតង់។',
    'Physics',
    'Intermediate',
    '{10,11,12}',
    30,
    '{"Understand capacitor function", "Calculate capacitance", "Explore dielectric effects", "Analyze charge storage"}',
    '{"យល់ដឹងពីមុខងារកុងដង់សាទ័រ", "គណនាកាប៉ាស៊ីតង់", "ស្វែងយល់ឥទ្ធិពលឌីអេឡិចត្រិច", "វិភាគការផ្ទុកបន្ទុក"}',
    'https://phet.colorado.edu/sims/html/capacitor-lab-basics/latest/capacitor-lab-basics_km.html',
    'https://phet.colorado.edu/sims/html/capacitor-lab-basics/latest/capacitor-lab-basics-600.png',
    '{"physics", "capacitor", "electricity", "charge", "voltage", "កុងដង់សាទ័រ", "អគ្គិសនី", "បន្ទុក", "វ៉ុល"}',
    false,
    true
),

-- 39. Circuit Construction Kit: DC - Virtual Lab
(
    'circuit-construction-kit-dc-virtual-lab',
    'Circuit Construction Kit: DC - Virtual Lab',
    'ឧបករណ៍សាងសង់សៀគ្វី៖ DC - មន្ទីរពិសោធន៍និម្មិត',
    'Build circuits with batteries, resistors, light bulbs, fuses, and switches. Determine if everyday objects are conductors or insulators.',
    'សាងសង់សៀគ្វីជាមួយថ្ម រេស៊ីស្ទ័រ អំពូលភ្លើង ហ្វ៊ុយស៊ីប និងកុងតាក់។ កំណត់ថាតើវត្ថុប្រចាំថ្ងៃជាចំហាយ ឬអ៊ីសូឡង់។',
    'Physics',
    'Beginner',
    '{8,9,10,11}',
    35,
    '{"Build DC circuits", "Use circuit instruments", "Test conductivity", "Troubleshoot circuit problems"}',
    '{"សាងសង់សៀគ្វី DC", "ប្រើឧបករណ៍សៀគ្វី", "សាកល្បងចំហាយ", "ដោះស្រាយបញ្ហាសៀគ្វី"}',
    'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc-virtual-lab/latest/circuit-construction-kit-dc-virtual-lab_km.html',
    'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc-virtual-lab/latest/circuit-construction-kit-dc-virtual-lab-600.png',
    '{"physics", "circuit", "DC", "electricity", "virtual lab", "សៀគ្វី", "អគ្គិសនី", "មន្ទីរពិសោធន៍និម្មិត"}',
    true,
    true
),

-- 40. Circuit Construction Kit: DC
(
    'circuit-construction-kit-dc',
    'Circuit Construction Kit: DC',
    'ឧបករណ៍សាងសង់សៀគ្វី៖ DC',
    'Build circuits with batteries, resistors, light bulbs, fuses, and switches. Take measurements with realistic ammeter and voltmeter.',
    'សាងសង់សៀគ្វីជាមួយថ្ម រេស៊ីស្ទ័រ អំពូលភ្លើង ហ្វ៊ុយស៊ីប និងកុងតាក់។ ធ្វើការវាស់វែងជាមួយអំពែរម៉ែត្រ និងវ៉ុលម៉ែត្រជាក់ស្តែង។',
    'Physics',
    'Beginner',
    '{8,9,10,11}',
    30,
    '{"Design DC circuits", "Apply Ohms law", "Measure current and voltage", "Understand circuit basics"}',
    '{"រចនាសៀគ្វី DC", "អនុវត្តច្បាប់អូម", "វាស់ចរន្ត និងវ៉ុល", "យល់ដឹងមូលដ្ឋានសៀគ្វី"}',
    'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_km.html',
    'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc-600.png',
    '{"physics", "circuit", "DC", "electricity", "Ohm", "សៀគ្វី", "អគ្គិសនី", "អូម"}',
    true,
    true
),

-- 41. Charges and Fields
(
    'charges-and-fields',
    'Charges and Fields',
    'បន្ទុក និងវាល',
    'Arrange positive and negative charges in space and view the resulting electric field and electrostatic potential.',
    'រៀបចំបន្ទុកវិជ្ជមាន និងអវិជ្ជមានក្នុងលំហ ហើយមើលវាលអគ្គិសនី និងសក្តានុពលអេឡិចត្រូស្តាទិចលទ្ធផល។',
    'Physics',
    'Advanced',
    '{10,11,12}',
    40,
    '{"Visualize electric fields", "Understand field lines", "Explore electric potential", "Map equipotential surfaces"}',
    '{"មើលឃើញវាលអគ្គិសនី", "យល់ដឹងពីបន្ទាត់វាល", "ស្វែងយល់សក្តានុពលអគ្គិសនី", "គូសផែនទីផ្ទៃសក្តានុពលស្មើ"}',
    'https://phet.colorado.edu/sims/html/charges-and-fields/latest/charges-and-fields_km.html',
    'https://phet.colorado.edu/sims/html/charges-and-fields/latest/charges-and-fields-600.png',
    '{"physics", "electricity", "charges", "fields", "potential", "អគ្គិសនី", "បន្ទុក", "វាល", "សក្តានុពល"}',
    false,
    true
),

-- 42. Rutherford Scattering
(
    'rutherford-scattering',
    'Rutherford Scattering',
    'ការខ្ចាត់ខ្ចាយរូតឺហ្វត',
    'How did Rutherford figure out the structure of the atom without being able to see it? Simulate the famous experiment.',
    'តើរូតឺហ្វតបានរកឃើញរចនាសម្ព័ន្ធអាតូមដោយរបៀបណាដោយមិនអាចមើលឃើញវា? ក្លែងធ្វើការពិសោធន៍ដ៏ល្បីល្បាញ។',
    'Physics',
    'Advanced',
    '{11,12}',
    35,
    '{"Understand atomic structure discovery", "Learn about alpha particle scattering", "Explore nuclear model", "Analyze experimental methods"}',
    '{"យល់ដឹងពីការរកឃើញរចនាសម្ព័ន្ធអាតូម", "រៀនអំពីការខ្ចាត់ខ្ចាយភាគល្អិតអាល់ហ្វា", "ស្វែងយល់គំរូនុយក្លេអ៊ែរ", "វិភាគវិធីសាស្ត្រពិសោធន៍"}',
    'https://phet.colorado.edu/sims/html/rutherford-scattering/latest/rutherford-scattering_km.html',
    'https://phet.colorado.edu/sims/html/rutherford-scattering/latest/rutherford-scattering-600.png',
    '{"physics", "atomic", "Rutherford", "scattering", "nucleus", "អាតូម", "រូតឺហ្វត", "ការខ្ចាត់ខ្ចាយ", "នុយក្លេអ៊ែរ"}',
    false,
    true
),

-- 43. Bending Light
(
    'bending-light',
    'Bending Light',
    'ពន្លឺកោង',
    'Explore bending of light between two media with different indices of refraction. See how changing from air to water to glass changes the bending angle.',
    'ស្វែងយល់ការកោងពន្លឺរវាងមជ្ឈដ្ឋានពីរដែលមានសន្ទស្សន៍ចំណាំងផ្សេងគ្នា។ មើលពីរបៀបដែលការផ្លាស់ប្តូរពីខ្យល់ទៅទឹកទៅកញ្ចក់ផ្លាស់ប្តូរមុំកោង។',
    'Physics',
    'Intermediate',
    '{9,10,11,12}',
    30,
    '{"Understand refraction", "Apply Snells law", "Explore total internal reflection", "Measure refractive indices"}',
    '{"យល់ដឹងពីការចំណាំង", "អនុវត្តច្បាប់ស្នែល", "ស្វែងយល់ការឆ្លុះផ្ទៃក្នុងសរុប", "វាស់សន្ទស្សន៍ចំណាំង"}',
    'https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_km.html',
    'https://phet.colorado.edu/sims/html/bending-light/latest/bending-light-600.png',
    '{"physics", "optics", "refraction", "light", "Snell", "អុបទិច", "ការចំណាំង", "ពន្លឺ", "ស្នែល"}',
    true,
    true
),

-- 44. Hooke's Law
(
    'hookes-law',
    'Hooke''s Law',
    'ច្បាប់ហុក',
    'Stretch and compress springs to explore the relationships between force, spring constant, displacement, and potential energy!',
    'ទាញ និងបង្ហាប់ស្ព្រីងដើម្បីស្វែងយល់ទំនាក់ទំនងរវាងកម្លាំង ថេរស្ព្រីង ការផ្លាស់ទី និងថាមពលប៉ូតង់ស្យែល!',
    'Physics',
    'Intermediate',
    '{9,10,11,12}',
    30,
    '{"Understand Hookes law", "Calculate spring constants", "Explore elastic potential energy", "Analyze spring systems"}',
    '{"យល់ដឹងពីច្បាប់ហុក", "គណនាថេរស្ព្រីង", "ស្វែងយល់ថាមពលប៉ូតង់ស្យែលយឺត", "វិភាគប្រព័ន្ធស្ព្រីង"}',
    'https://phet.colorado.edu/sims/html/hookes-law/latest/hookes-law_km.html',
    'https://phet.colorado.edu/sims/html/hookes-law/latest/hookes-law-600.png',
    '{"physics", "spring", "force", "Hooke", "elasticity", "ស្ព្រីង", "កម្លាំង", "ហុក", "យឺត"}',
    false,
    true
),

-- 45. Faraday's Law
(
    'faradays-law',
    'Faraday''s Law',
    'ច្បាប់ហ្វារ៉ាដេ',
    'Investigate Faraday''s law and how a changing magnetic flux can produce a flow of electricity!',
    'ស៊ើបអង្កេតច្បាប់ហ្វារ៉ាដេ និងរបៀបដែលហ្វ្លុចម៉ាញេទិចផ្លាស់ប្តូរអាចបង្កើតលំហូរអគ្គិសនី!',
    'Physics',
    'Advanced',
    '{10,11,12}',
    35,
    '{"Master electromagnetic induction", "Calculate induced EMF", "Understand magnetic flux", "Apply Lenzs law"}',
    '{"ស្ទាត់ជំនាញអាំងឌុចស្យុងអេឡិចត្រូម៉ាញេទិច", "គណនា EMF បង្កើត", "យល់ដឹងពីហ្វ្លុចម៉ាញេទិច", "អនុវត្តច្បាប់ឡង់"}',
    'https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_km.html',
    'https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law-600.png',
    '{"physics", "Faraday", "induction", "magnetism", "electricity", "ហ្វារ៉ាដេ", "អាំងឌុចស្យុង", "ម៉ាញេទិច", "អគ្គិសនី"}',
    false,
    true
),

-- 46. Wave on a String
(
    'wave-on-a-string',
    'Wave on a String',
    'រលកលើខ្សែ',
    'Explore the world of waves! Even observe a string vibrate in slow motion. Wiggle the end of the string and make waves.',
    'ស្វែងយល់ពិភពរលក! សូម្បីតែសង្កេតខ្សែរំញ័រក្នុងចលនាយឺត។ រំកិលចុងខ្សែ និងបង្កើតរលក។',
    'Physics',
    'Beginner',
    '{7,8,9,10}',
    25,
    '{"Create wave patterns", "Understand wave properties", "Explore frequency and amplitude", "Learn wave behavior"}',
    '{"បង្កើតលំនាំរលក", "យល់ដឹងពីលក្ខណៈសម្បត្តិរលក", "ស្វែងយល់ប្រេកង់ និងអំព្លីទុត", "រៀនឥរិយាបថរលក"}',
    'https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_km.html',
    'https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string-600.png',
    '{"physics", "waves", "string", "frequency", "amplitude", "រលក", "ខ្សែ", "ប្រេកង់", "អំព្លីទុត"}',
    true,
    true
),

-- 47. Color Vision
(
    'color-vision',
    'Color Vision',
    'ការមើលឃើញពណ៌',
    'Make a whole rainbow by mixing red, green, and blue light. Change the wavelength of a monochromatic beam or filter white light.',
    'បង្កើតឥន្ទធនូទាំងមូលដោយលាយពន្លឺក្រហម បៃតង និងខៀវ។ ផ្លាស់ប្តូរប្រវែងរលកនៃកាំរស្មីពណ៌តែមួយ ឬត្រងពន្លឺស។',
    'Physics',
    'Intermediate',
    '{8,9,10,11}',
    30,
    '{"Understand color mixing", "Learn about RGB model", "Explore light wavelengths", "Apply color theory"}',
    '{"យល់ដឹងពីការលាយពណ៌", "រៀនអំពីគំរូ RGB", "ស្វែងយល់ប្រវែងរលកពន្លឺ", "អនុវត្តទ្រឹស្តីពណ៌"}',
    'https://phet.colorado.edu/sims/html/color-vision/latest/color-vision_km.html',
    'https://phet.colorado.edu/sims/html/color-vision/latest/color-vision-600.png',
    '{"physics", "light", "color", "vision", "wavelength", "ពន្លឺ", "ពណ៌", "ការមើលឃើញ", "ប្រវែងរលក"}',
    false,
    true
),

-- 48. Friction
(
    'friction',
    'Friction',
    'កកិត',
    'Explore the forces at work when pulling against a cart, and pushing a refrigerator, crate, or person. Create an applied force and see how it makes objects move.',
    'ស្វែងយល់កម្លាំងដែលដំណើរការនៅពេលទាញប្រឆាំងរទេះ និងរុញទូទឹកកក ធុង ឬមនុស្ស។ បង្កើតកម្លាំងប្រើប្រាស់ ហើយមើលពីរបៀបដែលវាធ្វើឲ្យវត្ថុផ្លាស់ទី។',
    'Physics',
    'Beginner',
    '{7,8,9,10}',
    30,
    '{"Understand friction forces", "Explore static and kinetic friction", "Apply Newton''s laws", "Analyze motion with friction"}',
    '{"យល់ដឹងពីកម្លាំងកកិត", "ស្វែងយល់កកិតស្តាទិច និងស៊ីនេទិច", "អនុវត្តច្បាប់ញូតុន", "វិភាគចលនាជាមួយកកិត"}',
    'https://phet.colorado.edu/sims/html/friction/latest/friction_km.html',
    'https://phet.colorado.edu/sims/html/friction/latest/friction-600.png',
    '{"physics", "friction", "force", "motion", "Newton", "កកិត", "កម្លាំង", "ចលនា", "ញូតុន"}',
    true,
    true
),

-- 49. John Travoltage
(
    'john-travoltage',
    'John Travoltage',
    'ចន ត្រាវ៉ុលតាច',
    'Make sparks fly with John Travoltage. Wiggle Johnnie''s foot and he picks up charges from the carpet. Bring his hand close to the door knob and get rid of the excess charge.',
    'ធ្វើឲ្យផ្កាភ្លើងហោះជាមួយចន ត្រាវ៉ុលតាច។ រំកិលជើងរបស់ចននី ហើយគាត់ចាប់យកបន្ទុកពីកម្រាលព្រំ។ នាំដៃរបស់គាត់ទៅជិតគ្រាប់ទ្វារ ហើយកម្ចាត់បន្ទុកលើស។',
    'Physics',
    'Beginner',
    '{6,7,8,9}',
    20,
    '{"Understand static electricity", "Learn about charge transfer", "Explore electrical discharge", "Apply electrostatic concepts"}',
    '{"យល់ដឹងពីអគ្គិសនីស្តាទិច", "រៀនអំពីការផ្ទេរបន្ទុក", "ស្វែងយល់ការបញ្ចេញអគ្គិសនី", "អនុវត្តគំនិតអេឡិចត្រូស្តាទិច"}',
    'https://phet.colorado.edu/sims/html/john-travoltage/latest/john-travoltage_km.html',
    'https://phet.colorado.edu/sims/html/john-travoltage/latest/john-travoltage-600.png',
    '{"physics", "electricity", "static", "charge", "discharge", "អគ្គិសនី", "ស្តាទិច", "បន្ទុក", "ការបញ្ចេញ"}',
    true,
    true
),

-- 50. Gravity Force Lab
(
    'gravity-force-lab',
    'Gravity Force Lab',
    'មន្ទីរពិសោធន៍កម្លាំងទំនាញ',
    'Visualize the gravitational force that two objects exert on each other. Discover the factors that affect gravitational attraction, and determine how adjusting these factors will change the gravitational force.',
    'មើលឃើញកម្លាំងទំនាញដែលវត្ថុពីរបញ្ចេញលើគ្នាទៅវិញទៅមក។ រកឃើញកត្តាដែលប៉ះពាល់ដល់ការទាក់ទាញទំនាញ ហើយកំណត់ថាការកែតម្រូវកត្តាទាំងនេះនឹងផ្លាស់ប្តូរកម្លាំងទំនាញយ៉ាងណា។',
    'Physics',
    'Intermediate',
    '{8,9,10,11}',
    30,
    '{"Master gravitational force", "Explore mass and distance effects", "Apply Newton''s universal gravitation", "Calculate gravitational forces"}',
    '{"ស្ទាត់ជំនាញកម្លាំងទំនាញ", "ស្វែងយល់ឥទ្ធិពលម៉ាស់ និងចម្ងាយ", "អនុវត្តទំនាញសកលរបស់ញូតុន", "គណនាកម្លាំងទំនាញ"}',
    'https://phet.colorado.edu/sims/html/gravity-force-lab/latest/gravity-force-lab_km.html',
    'https://phet.colorado.edu/sims/html/gravity-force-lab/latest/gravity-force-lab-600.png',
    '{"physics", "gravity", "force", "Newton", "universal gravitation", "ទំនាញ", "កម្លាំង", "ញូតុន", "ទំនាញសកល"}',
    false,
    true
),

-- CHEMISTRY SIMULATIONS CONTINUED (51-60)

-- 51. Molecule Shapes
(
    'molecule-shapes',
    'Molecule Shapes',
    'រាងម៉ូលេគុល',
    'Explore molecule shapes by building molecules in 3D! How does molecule shape change with different numbers of bonds and electron pairs?',
    'ស្វែងយល់រាងម៉ូលេគុលដោយសាងសង់ម៉ូលេគុលក្នុង 3D! តើរាងម៉ូលេគុលផ្លាស់ប្តូរយ៉ាងណាជាមួយចំនួនចំណង និងគូអេឡិចត្រុងផ្សេងៗ?',
    'Chemistry',
    'Intermediate',
    '{10,11,12}',
    35,
    '{"Predict molecular geometry", "Understand VSEPR theory", "Explore bond angles", "Build 3D molecules"}',
    '{"ទស្សន៍ទាយធរណីមាត្រម៉ូលេគុល", "យល់ដឹងពីទ្រឹស្តី VSEPR", "ស្វែងយល់មុំចំណង", "សាងសង់ម៉ូលេគុល 3D"}',
    'https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_km.html',
    'https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes-600.png',
    '{"chemistry", "molecules", "shapes", "3D", "VSEPR", "ម៉ូលេគុល", "រាង", "3D", "VSEPR"}',
    true,
    true
),

-- 52. Molecule Shapes: Basics
(
    'molecule-shapes-basics',
    'Molecule Shapes: Basics',
    'រាងម៉ូលេគុល៖ មូលដ្ឋាន',
    'Recognize that molecule shape is due to repulsions between atoms. Recognize that bonds are not fixed in place, but can rotate around in response to repulsions.',
    'ទទួលស្គាល់ថារាងម៉ូលេគុលបណ្តាលមកពីការច្រានចោលរវាងអាតូម។ ទទួលស្គាល់ថាចំណងមិនត្រូវបានជាប់នៅកន្លែង ប៉ុន្តែអាចបង្វិលជុំវិញដើម្បីឆ្លើយតបនឹងការច្រានចោល។',
    'Chemistry',
    'Beginner',
    '{9,10,11}',
    25,
    '{"Learn molecular shapes basics", "Understand electron repulsion", "Explore simple molecules", "Build shape intuition"}',
    '{"រៀនមូលដ្ឋានរាងម៉ូលេគុល", "យល់ដឹងពីការច្រានចោលអេឡិចត្រុង", "ស្វែងយល់ម៉ូលេគុលសាមញ្ញ", "បង្កើតវិញ្ញាណរាង"}',
    'https://phet.colorado.edu/sims/html/molecule-shapes-basics/latest/molecule-shapes-basics_km.html',
    'https://phet.colorado.edu/sims/html/molecule-shapes-basics/latest/molecule-shapes-basics-600.png',
    '{"chemistry", "molecules", "shapes", "basics", "geometry", "ម៉ូលេគុល", "រាង", "មូលដ្ឋាន", "ធរណីមាត្រ"}',
    false,
    true
),

-- 53. pH Scale
(
    'ph-scale',
    'pH Scale',
    'មាត្រដ្ឋាន pH',
    'Test the pH of things like coffee, spit, and soap to determine whether each is acidic, basic, or neutral. Visualize the relative number of hydroxide ions and hydronium ions in solution.',
    'សាកល្បង pH នៃវត្ថុដូចជាកាហ្វេ ទឹកមាត់ និងសាប៊ូដើម្បីកំណត់ថាតើនីមួយៗជាអាស៊ីត បាស ឬអព្យាក្រឹត។ មើលឃើញចំនួនទាក់ទងនៃអ៊ីយ៉ុងអ៊ីដ្រុកស៊ីត និងអ៊ីយ៉ុងអ៊ីដ្រូនីញ៉ូមក្នុងសូលុយស្យុង។',
    'Chemistry',
    'Intermediate',
    '{9,10,11,12}',
    30,
    '{"Measure pH values", "Understand acid-base scale", "Explore ion concentrations", "Test common substances"}',
    '{"វាស់តម្លៃ pH", "យល់ដឹងពីមាត្រដ្ឋានអាស៊ីត-បាស", "ស្វែងយល់កំហាប់អ៊ីយ៉ុង", "សាកល្បងសារធាតុទូទៅ"}',
    'https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_km.html',
    'https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale-600.png',
    '{"chemistry", "pH", "acid", "base", "scale", "pH", "អាស៊ីត", "បាស", "មាត្រដ្ឋាន"}',
    true,
    true
),

-- 54. Beer's Law Lab
(
    'beers-law-lab',
    'Beer''s Law Lab',
    'មន្ទីរពិសោធន៍ច្បាប់បៀរ',
    'The thicker the glass, the darker the brew, the less the light that passes through. Make colorful concentrated and dilute solutions and explore how much light they absorb and transmit using a virtual spectrophotometer!',
    'កែវកាន់តែក្រាស់ ភេសជ្ជៈកាន់តែងងឹត ពន្លឺដែលឆ្លងកាត់កាន់តែតិច។ បង្កើតសូលុយស្យុងកំហាប់ខ្ពស់ និងរលាយចម្រុះពណ៌ ហើយស្វែងយល់ពីបរិមាណពន្លឺដែលពួកវាស្រូប និងបញ្ជូនដោយប្រើស្ប៉ិចត្រូហ្វូតូម៉ែត្រនិម្មិត!',
    'Chemistry',
    'Advanced',
    '{11,12}',
    40,
    '{"Apply Beer''s law", "Use spectrophotometry", "Measure absorbance", "Calculate concentrations"}',
    '{"អនុវត្តច្បាប់បៀរ", "ប្រើស្ប៉ិចត្រូហ្វូតូម៉េទ្រី", "វាស់ការស្រូប", "គណនាកំហាប់"}',
    'https://phet.colorado.edu/sims/html/beers-law-lab/latest/beers-law-lab_km.html',
    'https://phet.colorado.edu/sims/html/beers-law-lab/latest/beers-law-lab-600.png',
    '{"chemistry", "Beer law", "spectrophotometry", "absorbance", "concentration", "ច្បាប់បៀរ", "ស្ប៉ិចត្រូហ្វូតូម៉េទ្រី", "ការស្រូប", "កំហាប់"}',
    false,
    true
),

-- 55. Atomic Interactions
(
    'atomic-interactions',
    'Atomic Interactions',
    'អន្តរកម្មអាតូម',
    'Explore the interactions between various combinations of two atoms. Turn on the force arrows to see either the total force acting on the atoms or the individual attractive and repulsive forces.',
    'ស្វែងយល់អន្តរកម្មរវាងការផ្សំផ្សេងៗនៃអាតូមពីរ។ បើកព្រួញកម្លាំងដើម្បីមើលកម្លាំងសរុបដែលដំណើរការលើអាតូម ឬកម្លាំងទាក់ទាញ និងច្រានចោលនីមួយៗ។',
    'Chemistry',
    'Advanced',
    '{11,12}',
    35,
    '{"Understand intermolecular forces", "Explore van der Waals interactions", "Analyze potential energy curves", "Compare atomic bonds"}',
    '{"យល់ដឹងពីកម្លាំងអន្តរម៉ូលេគុល", "ស្វែងយល់អន្តរកម្មវ៉ាន់ដឺវ៉ាល់", "វិភាគខ្សែកោងថាមពលប៉ូតង់ស្យែល", "ប្រៀបធៀបចំណងអាតូម"}',
    'https://phet.colorado.edu/sims/html/atomic-interactions/latest/atomic-interactions_km.html',
    'https://phet.colorado.edu/sims/html/atomic-interactions/latest/atomic-interactions-600.png',
    '{"chemistry", "atomic", "interactions", "forces", "bonding", "អាតូម", "អន្តរកម្ម", "កម្លាំង", "ចំណង"}',
    false,
    true
),

-- 56. States of Matter
(
    'states-of-matter',
    'States of Matter',
    'សភាពនៃសារធាតុ',
    'Watch different types of molecules form a solid, liquid, or gas. Add or remove heat and watch the phase change. Change the temperature or volume of a container and see a pressure-temperature diagram respond in real time.',
    'មើលប្រភេទម៉ូលេគុលផ្សេងៗបង្កើតជារឹង រាវ ឬឧស្ម័ន។ បន្ថែម ឬដកកំដៅ ហើយមើលការផ្លាស់ប្តូរដំណាក់កាល។ ផ្លាស់ប្តូរសីតុណ្ហភាព ឬមាឌនៃធុង ហើយមើលដ្យាក្រាមសម្ពាធ-សីតុណ្ហភាពឆ្លើយតបក្នុងពេលវេលាជាក់ស្តែង។',
    'Chemistry',
    'Intermediate',
    '{9,10,11,12}',
    35,
    '{"Explore phase changes", "Understand molecular behavior", "Apply kinetic theory", "Analyze phase diagrams"}',
    '{"ស្វែងយល់ការផ្លាស់ប្តូរដំណាក់កាល", "យល់ដឹងពីឥរិយាបថម៉ូលេគុល", "អនុវត្តទ្រឹស្តីស៊ីនេទិច", "វិភាគដ្យាក្រាមដំណាក់កាល"}',
    'https://phet.colorado.edu/sims/html/states-of-matter/latest/states-of-matter_km.html',
    'https://phet.colorado.edu/sims/html/states-of-matter/latest/states-of-matter-600.png',
    '{"chemistry", "states", "matter", "phase", "temperature", "សភាព", "សារធាតុ", "ដំណាក់កាល", "សីតុណ្ហភាព"}',
    true,
    true
),

-- MATHEMATICS SIMULATIONS CONTINUED (57-60)

-- 57. Number Play
(
    'number-play',
    'Number Play',
    'លេងលេខ',
    'Build number sense through playful exploration. Count, compare, and create with numbers in multiple representations.',
    'បង្កើតការយល់ដឹងពីលេខតាមរយៈការរុករកដោយលេង។ រាប់ ប្រៀបធៀប និងបង្កើតជាមួយលេខក្នុងតំណាងច្រើន។',
    'Mathematics',
    'Beginner',
    '{1,2,3,4}',
    20,
    '{"Count objects", "Compare quantities", "Build number concepts", "Explore representations"}',
    '{"រាប់វត្ថុ", "ប្រៀបធៀបបរិមាណ", "បង្កើតគំនិតលេខ", "ស្វែងយល់តំណាង"}',
    'https://phet.colorado.edu/sims/html/number-play/latest/number-play_km.html',
    'https://phet.colorado.edu/sims/html/number-play/latest/number-play-600.png',
    '{"mathematics", "numbers", "counting", "elementary", "play", "លេខ", "ការរាប់", "បឋម", "លេង"}',
    true,
    true
),

-- 58. Number Line: Distance
(
    'number-line-distance',
    'Number Line: Distance',
    'បន្ទាត់លេខ៖ ចម្ងាយ',
    'Explore distance on the number line and see how it relates to absolute value. Compare integers and explore patterns.',
    'ស្វែងយល់ចម្ងាយនៅលើបន្ទាត់លេខ ហើយមើលពីរបៀបដែលវាទាក់ទងនឹងតម្លៃដាច់ខាត។ ប្រៀបធៀបចំនួនគត់ និងស្វែងយល់លំនាំ។',
    'Mathematics',
    'Intermediate',
    '{5,6,7,8}',
    25,
    '{"Understand absolute value", "Measure distances", "Compare integers", "Explore number patterns"}',
    '{"យល់ដឹងពីតម្លៃដាច់ខាត", "វាស់ចម្ងាយ", "ប្រៀបធៀបចំនួនគត់", "ស្វែងយល់លំនាំលេខ"}',
    'https://phet.colorado.edu/sims/html/number-line-distance/latest/number-line-distance_km.html',
    'https://phet.colorado.edu/sims/html/number-line-distance/latest/number-line-distance-600.png',
    '{"mathematics", "number line", "distance", "absolute value", "integers", "បន្ទាត់លេខ", "ចម្ងាយ", "តម្លៃដាច់ខាត", "ចំនួនគត់"}',
    false,
    true
),

-- 59. Ratio and Proportion
(
    'ratio-and-proportion',
    'Ratio and Proportion',
    'ផលធៀប និងសមាមាត្រ',
    'Discover the relationships between ratios and proportions. Use ratio reasoning to solve problems and explore scaling.',
    'រកឃើញទំនាក់ទំនងរវាងផលធៀប និងសមាមាត្រ។ ប្រើការវែកញែកផលធៀបដើម្បីដោះស្រាយបញ្ហា និងស្វែងយល់ការធ្វើមាត្រដ្ឋាន។',
    'Mathematics',
    'Intermediate',
    '{6,7,8,9}',
    30,
    '{"Understand ratios", "Apply proportional reasoning", "Solve ratio problems", "Explore scaling"}',
    '{"យល់ដឹងពីផលធៀប", "អនុវត្តការវែកញែកសមាមាត្រ", "ដោះស្រាយបញ្ហាផលធៀប", "ស្វែងយល់ការធ្វើមាត្រដ្ឋាន"}',
    'https://phet.colorado.edu/sims/html/ratio-and-proportion/latest/ratio-and-proportion_km.html',
    'https://phet.colorado.edu/sims/html/ratio-and-proportion/latest/ratio-and-proportion-600.png',
    '{"mathematics", "ratio", "proportion", "scaling", "reasoning", "ផលធៀប", "សមាមាត្រ", "មាត្រដ្ឋាន", "ការវែកញែក"}',
    true,
    true
),

-- 60. Number Line: Operations
(
    'number-line-operations',
    'Number Line: Operations',
    'បន្ទាត់លេខ៖ ប្រតិបត្តិការ',
    'Use number lines to visualize and solve addition and subtraction problems. Build understanding of operations with integers.',
    'ប្រើបន្ទាត់លេខដើម្បីមើលឃើញ និងដោះស្រាយបញ្ហាបូក និងដក។ បង្កើតការយល់ដឹងពីប្រតិបត្តិការជាមួយចំនួនគត់។',
    'Mathematics',
    'Beginner',
    '{3,4,5,6}',
    25,
    '{"Visualize operations", "Add and subtract on number line", "Understand negative numbers", "Build operation sense"}',
    '{"មើលឃើញប្រតិបត្តិការ", "បូក និងដកនៅលើបន្ទាត់លេខ", "យល់ដឹងពីលេខអវិជ្ជមាន", "បង្កើតការយល់ដឹងប្រតិបត្តិការ"}',
    'https://phet.colorado.edu/sims/html/number-line-operations/latest/number-line-operations_km.html',
    'https://phet.colorado.edu/sims/html/number-line-operations/latest/number-line-operations-600.png',
    '{"mathematics", "number line", "operations", "addition", "subtraction", "បន្ទាត់លេខ", "ប្រតិបត្តិការ", "ការបូក", "ការដក"}',
    false,
    true
);