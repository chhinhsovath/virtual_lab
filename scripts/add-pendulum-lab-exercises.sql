-- Add sample exercises for Pendulum Lab simulation
-- First, get the simulation ID for pendulum-lab
DO $$
DECLARE
  sim_id UUID;
  teacher_id UUID;
BEGIN
  -- Get the pendulum-lab simulation ID
  SELECT id INTO sim_id FROM stem_simulations_catalog WHERE simulation_name = 'pendulum-lab' LIMIT 1;
  
  -- Get a sample teacher ID (you may need to adjust this)
  SELECT id INTO teacher_id FROM users WHERE role = 'teacher' LIMIT 1;
  
  -- Only proceed if simulation exists
  IF sim_id IS NOT NULL THEN
    -- Delete existing exercises if any
    DELETE FROM simulation_exercises WHERE simulation_id = sim_id;
    
    -- Exercise 1: Multiple Choice - Pendulum Period
    INSERT INTO simulation_exercises (
      simulation_id, teacher_id, question_number, question_type,
      question_en, question_km,
      instructions_en, instructions_km,
      options, correct_answer, points, difficulty_level,
      hints_en, hints_km,
      explanation_en, explanation_km,
      is_required, is_active
    ) VALUES (
      sim_id, teacher_id, 1, 'multiple_choice',
      'What happens to the period of a pendulum when you increase its length?',
      'តើអ្វីកើតឡើងចំពោះរយៈពេលនៃប៉ោលនៅពេលអ្នកបង្កើនប្រវែងរបស់វា?',
      'Choose the best answer based on your observations.',
      'ជ្រើសរើសចម្លើយល្អបំផុតដោយផ្អែកលើការសង្កេតរបស់អ្នក។',
      '{"options_en": ["The period increases", "The period decreases", "The period stays the same", "The period becomes irregular"], "options_km": ["រយៈពេលកើនឡើង", "រយៈពេលថយចុះ", "រយៈពេលនៅដដែល", "រយៈពេលក្លាយជាមិនទៀងទាត់"]}',
      'The period increases',
      10,
      'easy',
      'Think about how a longer pendulum swings.',
      'គិតអំពីរបៀបដែលប៉ោលវែងជាងនេះយោល។',
      'When the length of a pendulum increases, the period (time for one complete swing) increases. This follows the formula T = 2π√(L/g).',
      'នៅពេលប្រវែងប៉ោលកើនឡើង រយៈពេល (ពេលវេលាសម្រាប់ការយោលពេញលេញមួយ) កើនឡើង។ នេះអនុវត្តតាមរូបមន្ត T = 2π√(L/g)។',
      true, true
    );

    -- Exercise 2: True/False - Mass Effect
    INSERT INTO simulation_exercises (
      simulation_id, teacher_id, question_number, question_type,
      question_en, question_km,
      instructions_en, instructions_km,
      correct_answer, points, difficulty_level,
      hints_en, hints_km,
      explanation_en, explanation_km,
      is_required, is_active
    ) VALUES (
      sim_id, teacher_id, 2, 'true_false',
      'The mass of the pendulum bob affects the period of oscillation.',
      'ម៉ាស់នៃគ្រាប់ប៉ោលប៉ះពាល់ដល់រយៈពេលនៃការយោល។',
      'Answer true or false based on your experiments.',
      'ឆ្លើយពិត ឬ មិនពិត ដោយផ្អែកលើការពិសោធន៍របស់អ្នក។',
      'false',
      10,
      'medium',
      'Try changing only the mass and observe the period.',
      'សាកល្បងផ្លាស់ប្តូរតែម៉ាស់ ហើយសង្កេតរយៈពេល។',
      'The mass of the pendulum bob does NOT affect the period. This is one of the key discoveries Galileo made about pendulums.',
      'ម៉ាស់នៃគ្រាប់ប៉ោលមិនប៉ះពាល់ដល់រយៈពេលទេ។ នេះគឺជាការរកឃើញសំខាន់មួយដែល Galileo បានធ្វើអំពីប៉ោល។',
      true, true
    );

    -- Exercise 3: Calculation - Period Measurement
    INSERT INTO simulation_exercises (
      simulation_id, teacher_id, question_number, question_type,
      question_en, question_km,
      instructions_en, instructions_km,
      correct_answer, acceptable_answers, points, difficulty_level,
      hints_en, hints_km,
      explanation_en, explanation_km,
      is_required, is_active
    ) VALUES (
      sim_id, teacher_id, 3, 'calculation',
      'If a pendulum completes 10 oscillations in 20 seconds, what is its period in seconds?',
      'ប្រសិនបើប៉ោលមួយបញ្ចប់ការយោល 10 ដងក្នុងរយៈពេល 20 វិនាទី តើរយៈពេលរបស់វាគិតជាវិនាទីគឺប៉ុន្មាន?',
      'Calculate the period (time for one complete oscillation).',
      'គណនារយៈពេល (ពេលវេលាសម្រាប់ការយោលពេញលេញមួយ)។',
      '2',
      '["2", "2.0", "2 seconds", "2 s"]',
      15,
      'easy',
      'Period = Total time / Number of oscillations',
      'រយៈពេល = ពេលវេលាសរុប / ចំនួនការយោល',
      'Period = Total time / Number of oscillations = 20 seconds / 10 oscillations = 2 seconds per oscillation.',
      'រយៈពេល = ពេលវេលាសរុប / ចំនួនការយោល = 20 វិនាទី / 10 ការយោល = 2 វិនាទីក្នុងមួយការយោល។',
      true, true
    );

    -- Exercise 4: Multiple Choice - Gravity Effect
    INSERT INTO simulation_exercises (
      simulation_id, teacher_id, question_number, question_type,
      question_en, question_km,
      instructions_en, instructions_km,
      options, correct_answer, points, difficulty_level,
      hints_en, hints_km,
      explanation_en, explanation_km,
      is_required, is_active
    ) VALUES (
      sim_id, teacher_id, 4, 'multiple_choice',
      'How does increasing gravity affect the pendulum period?',
      'តើការបង្កើនទំនាញប៉ះពាល់ដល់រយៈពេលប៉ោលយ៉ាងដូចម្តេច?',
      'Use the gravity slider to test different values.',
      'ប្រើប្រាស់របារទំនាញដើម្បីសាកល្បងតម្លៃផ្សេងៗ។',
      '{"options_en": ["Period increases", "Period decreases", "Period stays constant", "Pendulum stops moving"], "options_km": ["រយៈពេលកើនឡើង", "រយៈពេលថយចុះ", "រយៈពេលថេរ", "ប៉ោលឈប់ធ្វើចលនា"]}',
      'Period decreases',
      15,
      'medium',
      'Think about how stronger gravity affects the speed of the pendulum.',
      'គិតអំពីរបៀបដែលទំនាញខ្លាំងជាងប៉ះពាល់ដល់ល្បឿននៃប៉ោល។',
      'Higher gravity makes the pendulum swing faster, reducing the period. This follows from T = 2π√(L/g) - as g increases, T decreases.',
      'ទំនាញខ្ពស់ធ្វើឱ្យប៉ោលយោលលឿនជាង ដោយកាត់បន្ថយរយៈពេល។ នេះអនុវត្តតាម T = 2π√(L/g) - នៅពេល g កើនឡើង T ថយចុះ។',
      true, true
    );

    -- Exercise 5: Short Answer - Real World Application
    INSERT INTO simulation_exercises (
      simulation_id, teacher_id, question_number, question_type,
      question_en, question_km,
      instructions_en, instructions_km,
      points, difficulty_level,
      hints_en, hints_km,
      explanation_en, explanation_km,
      is_required, is_active
    ) VALUES (
      sim_id, teacher_id, 5, 'short_answer',
      'Describe one real-world application of pendulums and explain why the pendulum properties you observed are important for that application.',
      'ពិពណ៌នាអំពីកម្មវិធីពិភពលោកមួយនៃប៉ោល ហើយពន្យល់ពីមូលហេតុដែលលក្ខណៈសម្បត្តិប៉ោលដែលអ្នកបានសង្កេតមានសារៈសំខាន់សម្រាប់កម្មវិធីនោះ។',
      'Write a short paragraph (3-5 sentences).',
      'សរសេរកថាខណ្ឌខ្លី (3-5 ប្រយោគ)។',
      20,
      'hard',
      'Think about clocks, metronomes, or seismometers.',
      'គិតអំពីនាឡិកា ម៉េត្រូណូម ឬ ឧបករណ៍វាស់រញ្ជួយ។',
      'Common applications include: Pendulum clocks (consistent period for timekeeping), seismometers (detect earth movement), metronomes (steady beat for music), and Foucault pendulum (demonstrates Earth rotation).',
      'កម្មវិធីទូទៅរួមមាន៖ នាឡិកាប៉ោល (រយៈពេលថេរសម្រាប់រក្សាពេលវេលា) ឧបករណ៍វាស់រញ្ជួយ (រកឃើញចលនាផែនដី) ម៉េត្រូណូម (ចង្វាក់ថេរសម្រាប់តន្ត្រី) និងប៉ោល Foucault (បង្ហាញការបង្វិលផែនដី)។',
      true, true
    );

    -- Exercise 6: Multiple Choice - Amplitude Effect
    INSERT INTO simulation_exercises (
      simulation_id, teacher_id, question_number, question_type,
      question_en, question_km,
      instructions_en, instructions_km,
      options, correct_answer, points, difficulty_level,
      hints_en, hints_km,
      explanation_en, explanation_km,
      is_required, is_active
    ) VALUES (
      sim_id, teacher_id, 6, 'multiple_choice',
      'For small angles, how does the amplitude (starting angle) affect the period?',
      'សម្រាប់មុំតូចៗ តើទំហំ (មុំចាប់ផ្តើម) ប៉ះពាល់ដល់រយៈពេលយ៉ាងដូចម្តេច?',
      'Test with different starting angles, keeping them relatively small (less than 20 degrees).',
      'សាកល្បងជាមួយមុំចាប់ផ្តើមផ្សេងៗ ដោយរក្សាវាឱ្យតូច (តិចជាង 20 ដឺក្រេ)។',
      '{"options_en": ["No significant effect", "Period doubles", "Period halves", "Period increases exponentially"], "options_km": ["គ្មានផលប៉ះពាល់គួរឱ្យកត់សម្គាល់", "រយៈពេលកើនទ្វេដង", "រយៈពេលថយពាក់កណ្តាល", "រយៈពេលកើនឡើងជាអិចស្ប៉ូណង់ស្យែល"]}',
      'No significant effect',
      10,
      'medium',
      'Compare periods for different small starting angles.',
      'ប្រៀបធៀបរយៈពេលសម្រាប់មុំចាប់ផ្តើមតូចៗផ្សេងគ្នា។',
      'For small angles (less than about 15-20 degrees), the period is essentially independent of amplitude. This is called the isochronous property of pendulums.',
      'សម្រាប់មុំតូចៗ (តិចជាងប្រហែល 15-20 ដឺក្រេ) រយៈពេលមិនអាស្រ័យនឹងទំហំ។ នេះត្រូវបានគេហៅថាលក្ខណៈសម្បត្តិ isochronous នៃប៉ោល។',
      true, true
    );

    RAISE NOTICE 'Successfully added 6 exercises for Pendulum Lab simulation';
  ELSE
    RAISE NOTICE 'Pendulum Lab simulation not found. Please run add-pendulum-simulation.sql first.';
  END IF;
END $$;