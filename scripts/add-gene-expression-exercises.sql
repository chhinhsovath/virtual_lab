-- Add exercises for Gene Expression Essentials simulation
DO $$
DECLARE
  sim_id UUID;
  teacher_id UUID;
BEGIN
  -- Get the gene-expression-essentials simulation ID
  SELECT id INTO sim_id FROM stem_simulations_catalog WHERE simulation_name = 'gene-expression-essentials' LIMIT 1;
  
  -- Get a teacher ID
  SELECT id INTO teacher_id FROM users WHERE role = 'teacher' LIMIT 1;
  
  -- Only proceed if simulation exists
  IF sim_id IS NOT NULL THEN
    -- Check if exercises already exist for this simulation
    IF EXISTS (SELECT 1 FROM simulation_exercises WHERE simulation_id = sim_id) THEN
      RAISE NOTICE 'Exercises already exist for Gene Expression Essentials. Skipping.';
    ELSE
      -- Exercise 1: Multiple Choice - Central Dogma
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
        'What is the correct order of the central dogma of molecular biology?',
        'តើអ្វីជាលំដាប់ត្រឹមត្រូវនៃគោលលក្ខណៈកណ្តាលនៃជីវវិទ្យាម៉ូលេគុល?',
        'Choose the correct sequence of genetic information flow.',
        'ជ្រើសរើសលំដាប់ត្រឹមត្រូវនៃលំហូរព័ត៌មានហ្សែន។',
        '{"options_en": ["DNA → RNA → Protein", "RNA → DNA → Protein", "Protein → RNA → DNA", "DNA → Protein → RNA"], "options_km": ["DNA → RNA → ប្រូតេអ៊ីន", "RNA → DNA → ប្រូតេអ៊ីន", "ប្រូតេអ៊ីន → RNA → DNA", "DNA → ប្រូតេអ៊ីន → RNA"]}',
        'DNA → RNA → Protein',
        10,
        'easy',
        'Think about the flow from genetic code to final product.',
        'គិតអំពីលំហូរពីលេខកូដហ្សែនទៅផលិតផលចុងក្រោយ។',
        'The central dogma describes the flow of genetic information: DNA is transcribed to RNA, which is then translated to protein.',
        'គោលលក្ខណៈកណ្តាលពិពណ៌នាអំពីលំហូរព័ត៌មានហ្សែន៖ DNA ត្រូវបានចម្លងទៅ RNA បន្ទាប់មកត្រូវបានបកប្រែទៅប្រូតេអ៊ីន។',
        true, true
      );

      -- Exercise 2: Multiple Choice - Transcription Process
      INSERT INTO simulation_exercises (
        simulation_id, teacher_id, question_number, question_type,
        question_en, question_km,
        instructions_en, instructions_km,
        options, correct_answer, points, difficulty_level,
        hints_en, hints_km,
        explanation_en, explanation_km,
        is_required, is_active
      ) VALUES (
        sim_id, teacher_id, 2, 'multiple_choice',
        'During transcription, which enzyme is responsible for creating RNA from DNA?',
        'ក្នុងអំឡុងពេលចម្លង តើអង់ស៊ីមមួយណាទទួលបន្ទុកបង្កើត RNA ពី DNA?',
        'Identify the key enzyme in the transcription process.',
        'កំណត់អង់ស៊ីមសំខាន់នៅក្នុងដំណើរការចម្លង។',
        '{"options_en": ["RNA polymerase", "DNA polymerase", "Helicase", "Ligase"], "options_km": ["RNA polymerase", "DNA polymerase", "Helicase", "Ligase"]}',
        'RNA polymerase',
        15,
        'medium',
        'Think about which enzyme synthesizes RNA.',
        'គិតអំពីអង់ស៊ីមមួយណាសំយោគ RNA។',
        'RNA polymerase is the enzyme that synthesizes RNA from a DNA template during transcription.',
        'RNA polymerase គឺជាអង់ស៊ីមដែលសំយោគ RNA ពីគំរូ DNA អំឡុងពេលចម្លង។',
        true, true
      );

      -- Exercise 3: True/False - Gene Expression Regulation
      INSERT INTO simulation_exercises (
        simulation_id, teacher_id, question_number, question_type,
        question_en, question_km,
        instructions_en, instructions_km,
        correct_answer, points, difficulty_level,
        hints_en, hints_km,
        explanation_en, explanation_km,
        is_required, is_active
      ) VALUES (
        sim_id, teacher_id, 3, 'true_false',
        'Gene expression can be regulated at multiple levels including transcription, translation, and post-translation.',
        'ការបញ្ចេញហ្សែនអាចត្រូវបានគ្រប់គ្រងនៅកម្រិតជាច្រើនរួមទាំងចម្លង បកប្រែ និងក្រោយបកប្រែ។',
        'Consider the different points where gene expression can be controlled.',
        'ពិចារណាអំពីចំណុចផ្សេងៗដែលការបញ្ចេញហ្សែនអាចត្រូវបានគ្រប់គ្រង។',
        'true',
        10,
        'medium',
        'Think about the multiple steps from gene to protein.',
        'គិតអំពីជំហានជាច្រើនពីហ្សែនទៅប្រូតេអ៊ីន។',
        'Gene expression is regulated at multiple levels: transcriptional (DNA to RNA), post-transcriptional (RNA processing), translational (RNA to protein), and post-translational (protein modification).',
        'ការបញ្ចេញហ្សែនត្រូវបានគ្រប់គ្រងនៅកម្រិតជាច្រើន៖ ការចម្លង (DNA ទៅ RNA) ក្រោយចម្លង (ការដំណើរការ RNA) ការបកប្រែ (RNA ទៅប្រូតេអ៊ីន) និងក្រោយបកប្រែ (ការកែប្រែប្រូតេអ៊ីន)។',
        true, true
      );

      -- Exercise 4: Multiple Choice - Translation Process
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
        'Where does translation occur in a eukaryotic cell?',
        'តើការបកប្រែកើតឡើងនៅកន្លែងណាក្នុងកោសិកា eukaryotic?',
        'Identify the cellular location where proteins are synthesized.',
        'កំណត់ទីតាំងកោសិកាដែលប្រូតេអ៊ីនត្រូវបានសំយោគ។',
        '{"options_en": ["Ribosome", "Nucleus", "Mitochondria", "Golgi apparatus"], "options_km": ["Ribosome", "ស្នូល", "Mitochondria", "Golgi apparatus"]}',
        'Ribosome',
        15,
        'easy',
        'Think about the protein synthesis machinery.',
        'គិតអំពីម៉ាស៊ីនសំយោគប្រូតេអ៊ីន។',
        'Translation occurs at ribosomes, which are the protein synthesis machinery of the cell.',
        'ការបកប្រែកើតឡើងនៅ ribosomes ដែលជាម៉ាស៊ីនសំយោគប្រូតេអ៊ីនរបស់កោសិកា។',
        true, true
      );

      -- Exercise 5: Calculation - Codon Analysis
      INSERT INTO simulation_exercises (
        simulation_id, teacher_id, question_number, question_type,
        question_en, question_km,
        instructions_en, instructions_km,
        correct_answer, acceptable_answers, points, difficulty_level,
        hints_en, hints_km,
        explanation_en, explanation_km,
        is_required, is_active
      ) VALUES (
        sim_id, teacher_id, 5, 'calculation',
        'If an mRNA molecule has 300 nucleotides, how many codons does it contain?',
        'ប្រសិនបើម៉ូលេគុល mRNA មាននុយក្លេអូទីត 300 តើវាមានកូដុងប៉ុន្មាន?',
        'Calculate the number of codons in the mRNA sequence.',
        'គណនាចំនួនកូដុងនៅក្នុងលំដាប់ mRNA។',
        '100',
        '["100", "100 codons", "១០០"]',
        15,
        'easy',
        'Remember that each codon consists of 3 nucleotides.',
        'ចូរចាំថាកូដុងនីមួយៗមាននុយក្លេអូទីត 3។',
        'Each codon consists of 3 nucleotides, so 300 nucleotides ÷ 3 = 100 codons.',
        'កូដុងនីមួយៗមាននុយក្លេអូទីត 3 ដូច្នេះ 300 នុយក្លេអូទីត ÷ 3 = 100 កូដុង។',
        true, true
      );

      -- Exercise 6: Short Answer - Gene Regulation
      INSERT INTO simulation_exercises (
        simulation_id, teacher_id, question_number, question_type,
        question_en, question_km,
        instructions_en, instructions_km,
        points, difficulty_level,
        hints_en, hints_km,
        explanation_en, explanation_km,
        is_required, is_active
      ) VALUES (
        sim_id, teacher_id, 6, 'short_answer',
        'Explain why gene expression regulation is important for multicellular organisms.',
        'ពន្យល់ពីមូលហេតុដែលការគ្រប់គ្រងការបញ្ចេញហ្សែនមានសារៈសំខាន់សម្រាប់សារពាង្គកោសិកាច្រើន។',
        'Write a short paragraph explaining the importance of gene regulation.',
        'សរសេរកថាខណ្ឌខ្លីពន្យល់អំពីសារៈសំខាន់នៃការគ្រប់គ្រងហ្សែន។',
        25,
        'hard',
        'Think about cell differentiation and tissue specialization.',
        'គិតអំពីការវិសាលកម្មកោសិកានិងឯកទេសជាលិកា។',
        'Gene regulation allows different cell types to express different sets of genes, enabling cell specialization and tissue formation. Without regulation, all cells would be identical.',
        'ការគ្រប់គ្រងហ្សែនអនុញ្ញាតឱ្យប្រភេទកោសិកាផ្សេងៗបញ្ចេញសំណុំហ្សែនផ្សេងៗ ដោយបើកឱ្យមានឯកទេសកោសិកានិងការបង្កើតជាលិកា។ បើគ្មានការគ្រប់គ្រង កោសិកាទាំងអស់នឹងដូចគ្នា។',
        true, true
      );

      RAISE NOTICE 'Successfully added 6 exercises for Gene Expression Essentials simulation';
    END IF;
  ELSE
    RAISE NOTICE 'Gene Expression Essentials simulation not found.';
  END IF;
END $$;