-- Add sample exercises for HTML-based lab simulations
DO $$
DECLARE
  sim_record RECORD;
  teacher_id INTEGER;
BEGIN
  -- Get a teacher ID from tbl_teacher_information
  SELECT teiautoid INTO teacher_id FROM tbl_teacher_information LIMIT 1;
  
  IF teacher_id IS NULL THEN
    RAISE NOTICE 'No teacher found in the system';
    RETURN;
  END IF;

  -- Loop through simulations that use HTML files
  FOR sim_record IN 
    SELECT id, simulation_name, display_name_en, display_name_km 
    FROM stem_simulations_catalog 
    WHERE simulation_url LIKE '/labs/%' 
    AND simulation_name != 'pendulum-lab' -- Skip pendulum as it already has exercises
  LOOP
    -- Check if exercises already exist for this simulation
    IF NOT EXISTS (SELECT 1 FROM simulation_exercises WHERE simulation_id = sim_record.id) THEN
      
      CASE sim_record.simulation_name
        -- Balancing Act exercises
        WHEN 'balancing-act' THEN
          INSERT INTO simulation_exercises (
            simulation_id, teacher_id, question_number, question_type,
            question_en, question_km, correct_answer, points, difficulty_level,
            options, is_required, is_active
          ) VALUES
          (sim_record.id, teacher_id, 1, 'multiple_choice',
           'What happens to the balance when you double the mass on one side?',
           'តើមានអ្វីកើតឡើងចំពោះតុល្យភាពនៅពេលអ្នកបង្កើនម៉ាស់ទ្វេដងនៅម្ខាង?',
           'It tips to that side',
           15, 'easy',
           '{"options_en": ["It stays balanced", "It tips to that side", "It tips to opposite side", "Nothing happens"], "options_km": ["វានៅតុល្យភាព", "វាលំអៀងទៅខាងនោះ", "វាលំអៀងទៅខាងផ្ទុយ", "គ្មានអ្វីកើតឡើង"]}',
           true, true),
          (sim_record.id, teacher_id, 2, 'calculation',
           'If a 6kg mass is 3m from the pivot, what distance should a 9kg mass be placed to balance?',
           'ប្រសិនបើម៉ាស់ 6kg ស្ថិតនៅចម្ងាយ 3m ពីចំណុចរំកិល តើម៉ាស់ 9kg គួរដាក់នៅចម្ងាយប៉ុន្មាន?',
           '2', 20, 'medium', null, true, true);
           
        -- Build a Nucleus exercises
        WHEN 'build-a-nucleus' THEN
          INSERT INTO simulation_exercises (
            simulation_id, teacher_id, question_number, question_type,
            question_en, question_km, correct_answer, points, difficulty_level,
            options, is_required, is_active
          ) VALUES
          (sim_record.id, teacher_id, 1, 'multiple_choice',
           'What makes a nucleus stable?',
           'អ្វីធ្វើឱ្យស្នូលមានស្ថេរភាព?',
           'Right balance of protons and neutrons',
           15, 'medium',
           '{"options_en": ["More protons than neutrons", "More neutrons than protons", "Right balance of protons and neutrons", "Only protons"], "options_km": ["ប្រូតុងច្រើនជាងនឺត្រុង", "នឺត្រុងច្រើនជាងប្រូតុង", "តុល្យភាពត្រឹមត្រូវនៃប្រូតុង និងនឺត្រុង", "មានតែប្រូតុង"]}',
           true, true),
          (sim_record.id, teacher_id, 2, 'true_false',
           'All isotopes of an element have the same number of protons.',
           'អ៊ីសូតូបទាំងអស់នៃធាតុមួយមានចំនួនប្រូតុងដូចគ្នា។',
           'true', 10, 'easy', null, true, true);
           
        -- Geometric Optics exercises
        WHEN 'geometric-optics-basics' THEN
          INSERT INTO simulation_exercises (
            simulation_id, teacher_id, question_number, question_type,
            question_en, question_km, correct_answer, points, difficulty_level,
            options, is_required, is_active
          ) VALUES
          (sim_record.id, teacher_id, 1, 'multiple_choice',
           'What type of image does a concave mirror produce when object is beyond focal point?',
           'តើកញ្ចក់ផ្គោងបង្កើតរូបភាពប្រភេទណានៅពេលវត្ថុនៅឆ្ងាយពីចំណុចប្រមូលផ្តុំ?',
           'Real and inverted',
           15, 'medium',
           '{"options_en": ["Virtual and upright", "Real and inverted", "Virtual and inverted", "Real and upright"], "options_km": ["និម្មិត និងត្រង់", "ពិត និងបញ្ច្រាស", "និម្មិត និងបញ្ច្រាស", "ពិត និងត្រង់"]}',
           true, true),
          (sim_record.id, teacher_id, 2, 'short_answer',
           'Describe what happens to light when it passes from air into water.',
           'ពិពណ៌នាអ្វីកើតឡើងចំពោះពន្លឺនៅពេលវាឆ្លងពីខ្យល់ចូលទៅក្នុងទឹក។',
           null, 20, 'medium', null, true, true);
           
        -- Gravity Force Lab exercises
        WHEN 'gravity-force-lab-basics' THEN
          INSERT INTO simulation_exercises (
            simulation_id, teacher_id, question_number, question_type,
            question_en, question_km, correct_answer, points, difficulty_level,
            options, is_required, is_active
          ) VALUES
          (sim_record.id, teacher_id, 1, 'multiple_choice',
           'How does gravitational force change when distance doubles?',
           'តើកម្លាំងទំនាញផ្លាស់ប្តូរយ៉ាងណានៅពេលចម្ងាយកើនទ្វេដង?',
           'Becomes 1/4 as strong',
           20, 'medium',
           '{"options_en": ["Doubles", "Halves", "Becomes 1/4 as strong", "Stays the same"], "options_km": ["កើនទ្វេដង", "ថយពាក់កណ្តាល", "ក្លាយជា 1/4 នៃកម្លាំងដើម", "នៅដដែល"]}',
           true, true),
          (sim_record.id, teacher_id, 2, 'calculation',
           'If Earth mass is 6×10²⁴ kg, what is the gravitational force on a 100kg object at surface? (Use g=9.8 m/s²)',
           'ប្រសិនបើម៉ាស់ផែនដីគឺ 6×10²⁴ kg តើកម្លាំងទំនាញលើវត្ថុ 100kg នៅផ្ទៃគឺប៉ុន្មាន? (ប្រើ g=9.8 m/s²)',
           '980', 15, 'easy', null, true, true);
           
        -- Projectile Data Lab exercises
        WHEN 'projectile-data-lab' THEN
          INSERT INTO simulation_exercises (
            simulation_id, teacher_id, question_number, question_type,
            question_en, question_km, correct_answer, points, difficulty_level,
            options, is_required, is_active
          ) VALUES
          (sim_record.id, teacher_id, 1, 'multiple_choice',
           'At what angle does a projectile achieve maximum range?',
           'តើគ្រាប់សម្រេចចម្ងាយអតិបរមានៅមុំប៉ុន្មាន?',
           '45 degrees',
           15, 'medium',
           '{"options_en": ["30 degrees", "45 degrees", "60 degrees", "90 degrees"], "options_km": ["30 ដឺក្រេ", "45 ដឺក្រេ", "60 ដឺក្រេ", "90 ដឺក្រេ"]}',
           true, true),
          (sim_record.id, teacher_id, 2, 'short_answer',
           'Explain how air resistance affects projectile motion.',
           'ពន្យល់ពីរបៀបដែលធន់ខ្យល់ប៉ះពាល់ដល់ចលនាគ្រាប់។',
           null, 20, 'hard', null, true, true);
           
        -- Quantum Coin Toss exercises
        WHEN 'quantum-coin-toss' THEN
          INSERT INTO simulation_exercises (
            simulation_id, teacher_id, question_number, question_type,
            question_en, question_km, correct_answer, points, difficulty_level,
            options, is_required, is_active
          ) VALUES
          (sim_record.id, teacher_id, 1, 'true_false',
           'A quantum coin can be in a superposition of heads and tails before measurement.',
           'កាក់កង់ទិចអាចស្ថិតក្នុងការត្រួតស៊ីនៃក្បាល និងកន្ទុយមុនការវាស់។',
           'true', 15, 'hard', null, true, true),
          (sim_record.id, teacher_id, 2, 'short_answer',
           'Describe the difference between classical and quantum probability.',
           'ពិពណ៌នាភាពខុសគ្នារវាងប្រូបាប៊ីលីតេបុរាណ និងកង់ទិច។',
           null, 25, 'hard', null, true, true);
           
        -- Quantum Measurement exercises
        WHEN 'quantum-measurement' THEN
          INSERT INTO simulation_exercises (
            simulation_id, teacher_id, question_number, question_type,
            question_en, question_km, correct_answer, points, difficulty_level,
            options, is_required, is_active
          ) VALUES
          (sim_record.id, teacher_id, 1, 'multiple_choice',
           'What happens to a quantum superposition when measured?',
           'តើមានអ្វីកើតឡើងចំពោះការត្រួតស៊ីកង់ទិចនៅពេលវាស់?',
           'It collapses to a definite state',
           20, 'hard',
           '{"options_en": ["It stays the same", "It collapses to a definite state", "It doubles", "It disappears"], "options_km": ["វានៅដដែល", "វាដួលរលំទៅស្ថានភាពច្បាស់លាស់", "វាកើនទ្វេដង", "វាបាត់"]}',
           true, true),
          (sim_record.id, teacher_id, 2, 'short_answer',
           'Explain the uncertainty principle in your own words.',
           'ពន្យល់គោលការណ៍មិនច្បាស់លាស់តាមពាក្យផ្ទាល់ខ្លួនរបស់អ្នក។',
           null, 25, 'hard', null, true, true);
           
      END CASE;
      
      RAISE NOTICE 'Added exercises for simulation: %', sim_record.display_name_en;
    END IF;
  END LOOP;
END $$;