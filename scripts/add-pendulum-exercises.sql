-- Add exercises for the Pendulum Lab simulation
-- First, get the simulation ID for pendulum-lab

DO $$
DECLARE
    v_simulation_id UUID;
    v_teacher_id INTEGER;
BEGIN
    -- Get the pendulum lab simulation ID
    SELECT id INTO v_simulation_id 
    FROM stem_simulations_catalog 
    WHERE simulation_name = 'pendulum-lab' 
    LIMIT 1;
    
    -- Get a teacher ID (or use a default one)
    SELECT teiautoid INTO v_teacher_id 
    FROM tbl_teacher_information 
    LIMIT 1;
    
    -- If no teacher exists, use 1 as default
    IF v_teacher_id IS NULL THEN
        v_teacher_id := 1;
    END IF;
    
    -- Insert exercises for the pendulum lab
    INSERT INTO simulation_exercises (
        simulation_id,
        teacher_id,
        question_number,
        question_type,
        question_en,
        question_km,
        instructions_en,
        instructions_km,
        options,
        correct_answer,
        points,
        difficulty_level,
        hints_en,
        hints_km,
        explanation_en,
        explanation_km
    ) VALUES
    -- Question 1: Multiple Choice
    (
        v_simulation_id,
        v_teacher_id,
        1,
        'multiple_choice',
        'What happens to the period of a pendulum when you increase its length?',
        'តើអ្វីកើតឡើងចំពោះរយៈពេលនៃប៉ោលនៅពេលអ្នកបង្កើនប្រវែងរបស់វា?',
        'Based on your observations in the simulation, select the correct answer.',
        'ផ្អែកលើការសង្កេតរបស់អ្នកក្នុងការសាកល្បង សូមជ្រើសរើសចម្លើយត្រឹមត្រូវ។',
        '{"options_en": ["It increases", "It decreases", "It stays the same", "It becomes irregular"], "options_km": ["វាកើនឡើង", "វាថយចុះ", "វានៅដដែល", "វាក្លាយជាមិនទៀងទាត់"]}',
        'It increases',
        10,
        'easy',
        'Try changing the length in the simulation and observe what happens to the time for one complete swing.',
        'សាកល្បងផ្លាស់ប្តូរប្រវែងក្នុងការសាកល្បង ហើយសង្កេតមើលអ្វីដែលកើតឡើងចំពោះពេលវេលាសម្រាប់ការយោលពេញលេញមួយ។',
        'The period of a pendulum is proportional to the square root of its length. When length increases, the period increases.',
        'រយៈពេលនៃប៉ោលគឺសមាមាត្រទៅនឹងឫសការ៉េនៃប្រវែងរបស់វា។ នៅពេលប្រវែងកើនឡើង រយៈពេលក៏កើនឡើងដែរ។'
    ),
    -- Question 2: Calculation
    (
        v_simulation_id,
        v_teacher_id,
        2,
        'calculation',
        'If a pendulum completes 10 swings in 20 seconds, what is its period?',
        'ប្រសិនបើប៉ោលមួយបញ្ចប់ការយោល 10 ដងក្នុងរយៈពេល 20 វិនាទី តើរយៈពេលរបស់វាគឺប៉ុន្មាន?',
        'Calculate the period (time for one complete swing) and enter your answer in seconds.',
        'គណនារយៈពេល (ពេលវេលាសម្រាប់ការយោលពេញលេញមួយ) ហើយបញ្ចូលចម្លើយរបស់អ្នកជាវិនាទី។',
        NULL,
        '2',
        15,
        'medium',
        'Period = Total time / Number of swings',
        'រយៈពេល = ពេលវេលាសរុប / ចំនួនការយោល',
        'Period = 20 seconds / 10 swings = 2 seconds per swing',
        'រយៈពេល = 20 វិនាទី / 10 ការយោល = 2 វិនាទីក្នុងមួយការយោល'
    ),
    -- Question 3: True/False
    (
        v_simulation_id,
        v_teacher_id,
        3,
        'true_false',
        'The mass of the pendulum bob affects the period of oscillation.',
        'ម៉ាស់នៃដុំប៉ោលប៉ះពាល់ដល់រយៈពេលនៃការយោល។',
        'Test this in the simulation by changing only the mass.',
        'សាកល្បងនេះក្នុងការសាកល្បងដោយផ្លាស់ប្តូរតែម៉ាស់ប៉ុណ្ណោះ។',
        NULL,
        'false',
        10,
        'medium',
        'Change the mass in the simulation while keeping other factors constant.',
        'ផ្លាស់ប្តូរម៉ាស់ក្នុងការសាកល្បងខណៈពេលរក្សាកត្តាផ្សេងទៀតឱ្យថេរ។',
        'For small angles, the period of a pendulum is independent of the mass of the bob.',
        'សម្រាប់មុំតូចៗ រយៈពេលនៃប៉ោលគឺឯករាជ្យពីម៉ាស់នៃដុំ។'
    ),
    -- Question 4: Short Answer
    (
        v_simulation_id,
        v_teacher_id,
        4,
        'short_answer',
        'Describe what happens to the pendulum motion when you increase the gravity setting.',
        'ពិពណ៌នាអំពីអ្វីដែលកើតឡើងចំពោះចលនាប៉ោលនៅពេលអ្នកបង្កើនការកំណត់ទំនាញ។',
        'Write a short explanation based on your observations.',
        'សរសេរការពន្យល់ខ្លីមួយផ្អែកលើការសង្កេតរបស់អ្នក។',
        NULL,
        NULL,
        20,
        'hard',
        'Observe how the speed and period change with different gravity values.',
        'សង្កេតមើលរបៀបដែលល្បឿន និងរយៈពេលផ្លាស់ប្តូរជាមួយតម្លៃទំនាញផ្សេងៗ។',
        'When gravity increases, the pendulum swings faster and the period decreases. This is because stronger gravity provides more restoring force.',
        'នៅពេលទំនាញកើនឡើង ប៉ោលយោលលឿនជាងមុន ហើយរយៈពេលថយចុះ។ នេះគឺដោយសារតែទំនាញខ្លាំងជាងផ្តល់នូវកម្លាំងស្តារឡើងវិញកាន់តែច្រើន។'
    ),
    -- Question 5: Multiple Choice
    (
        v_simulation_id,
        v_teacher_id,
        5,
        'multiple_choice',
        'Which factor does NOT affect the period of a simple pendulum?',
        'តើកត្តាមួយណាដែលមិនប៉ះពាល់ដល់រយៈពេលនៃប៉ោលសាមញ្ញ?',
        'Test each factor in the simulation to find the answer.',
        'សាកល្បងកត្តានីមួយៗក្នុងការសាកល្បងដើម្បីរកចម្លើយ។',
        '{"options_en": ["Length of string", "Acceleration due to gravity", "Mass of the bob", "Initial angle (for small angles)"], "options_km": ["ប្រវែងខ្សែ", "សំទុះដោយសារទំនាញ", "ម៉ាស់នៃដុំ", "មុំដំបូង (សម្រាប់មុំតូច)"]}',
        'Mass of the bob',
        15,
        'medium',
        'Try changing each parameter one at a time and observe the period.',
        'សាកល្បងផ្លាស់ប្តូរប៉ារ៉ាម៉ែត្រនីមួយៗម្តងមួយ ហើយសង្កេតរយៈពេល។',
        'The period of a simple pendulum depends only on length and gravity, not on the mass of the bob.',
        'រយៈពេលនៃប៉ោលសាមញ្ញអាស្រ័យតែលើប្រវែង និងទំនាញប៉ុណ្ណោះ មិនមែនលើម៉ាស់នៃដុំទេ។'
    );
    
    RAISE NOTICE 'Successfully added 5 exercises for Pendulum Lab simulation';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding exercises: %', SQLERRM;
END $$;