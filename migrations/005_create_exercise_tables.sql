-- Create simulation exercises table (teacher-created exercises)
CREATE TABLE IF NOT EXISTS simulation_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id UUID NOT NULL REFERENCES stem_simulations_catalog(id),
  teacher_id INTEGER NOT NULL,
  question_number INTEGER NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'short_answer', 'calculation', 'true_false', 'fill_blank')),
  question_en TEXT NOT NULL,
  question_km TEXT NOT NULL,
  instructions_en TEXT,
  instructions_km TEXT,
  options JSONB, -- For multiple choice questions
  correct_answer TEXT,
  acceptable_answers JSONB, -- For alternative correct answers
  points INTEGER NOT NULL DEFAULT 10,
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  hints_en TEXT,
  hints_km TEXT,
  explanation_en TEXT,
  explanation_km TEXT,
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(simulation_id, question_number)
);

-- Create student exercise submissions table
CREATE TABLE IF NOT EXISTS student_exercise_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES simulation_exercises(id),
  student_id INTEGER NOT NULL,
  simulation_session_id UUID REFERENCES student_simulation_progress(id),
  assignment_id UUID REFERENCES teacher_simulation_assignments(id),
  student_answer TEXT,
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  time_spent INTEGER, -- seconds spent on this question
  attempt_number INTEGER DEFAULT 1,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  feedback_from_teacher TEXT,
  graded_by INTEGER,
  graded_at TIMESTAMP,
  UNIQUE(exercise_id, student_id, simulation_session_id, attempt_number)
);

-- Create exercise rubrics table for complex grading
CREATE TABLE IF NOT EXISTS exercise_rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES simulation_exercises(id),
  criteria_en TEXT NOT NULL,
  criteria_km TEXT NOT NULL,
  max_points INTEGER NOT NULL,
  grading_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_simulation_exercises_simulation_id ON simulation_exercises(simulation_id);
CREATE INDEX idx_simulation_exercises_teacher_id ON simulation_exercises(teacher_id);
CREATE INDEX idx_student_submissions_student_id ON student_exercise_submissions(student_id);
CREATE INDEX idx_student_submissions_exercise_id ON student_exercise_submissions(exercise_id);
CREATE INDEX idx_student_submissions_session_id ON student_exercise_submissions(simulation_session_id);

-- Insert sample exercises for the pendulum simulation
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
(
  'bbbda6f5-560e-4fd2-9855-cd5853c5f28e',
  1,
  1,
  'multiple_choice',
  'What happens to the period of a pendulum when you double its length?',
  'តើអ្វីកើតឡើងចំពោះរយៈពេលនៃប៉ង់ឌុលនៅពេលអ្នកបង្កើនប្រវែងរបស់វាទ្វេដង?',
  'Choose the best answer based on your observations.',
  'ជ្រើសរើសចម្លើយដែលល្អបំផុតដោយផ្អែកលើការសង្កេតរបស់អ្នក។',
  '{"options_en": ["The period doubles", "The period increases by √2", "The period decreases", "The period stays the same"], "options_km": ["រយៈពេលកើនឡើងទ្វេដង", "រយៈពេលកើនឡើងដោយ √2", "រយៈពេលថយចុះ", "រយៈពេលនៅដដែល"]}',
  'The period increases by √2',
  10,
  'medium',
  'Remember that period is proportional to the square root of length.',
  'ចូរចាំថារយៈពេលគឺសមាមាត្រទៅនឹងឫសការ៉េនៃប្រវែង។',
  'The period T of a pendulum is given by T = 2π√(L/g). When length doubles, T increases by √2.',
  'រយៈពេល T នៃប៉ង់ឌុលត្រូវបានផ្តល់ដោយ T = 2π√(L/g)។ នៅពេលប្រវែងកើនឡើងទ្វេដង T កើនឡើងដោយ √2។'
),
(
  'bbbda6f5-560e-4fd2-9855-cd5853c5f28e',
  1,
  2,
  'calculation',
  'Calculate the period of a pendulum with length 2.0 meters on Earth (g = 9.8 m/s²). Give your answer in seconds to 2 decimal places.',
  'គណនារយៈពេលនៃប៉ង់ឌុលដែលមានប្រវែង 2.0 ម៉ែត្រនៅលើផែនដី (g = 9.8 m/s²)។ ផ្តល់ចម្លើយរបស់អ្នកគិតជាវិនាទីដល់ទសភាគ 2 ខ្ទង់។',
  'Use the formula T = 2π√(L/g) where T is period, L is length, and g is gravitational acceleration.',
  'ប្រើរូបមន្ត T = 2π√(L/g) ដែល T ជារយៈពេល L ជាប្រវែង និង g ជាសំទុះទំនាញ។',
  NULL,
  '2.84',
  15,
  'hard',
  'First calculate L/g, then take the square root, and finally multiply by 2π.',
  'ដំបូងគណនា L/g បន្ទាប់យកឫសការ៉េ ហើយចុងក្រោយគុណនឹង 2π។',
  'T = 2π√(2.0/9.8) = 2π√(0.204) = 2π(0.452) = 2.84 seconds',
  'T = 2π√(2.0/9.8) = 2π√(0.204) = 2π(0.452) = 2.84 វិនាទី'
),
(
  'bbbda6f5-560e-4fd2-9855-cd5853c5f28e',
  1,
  3,
  'short_answer',
  'Explain how gravity affects the motion of a pendulum. What would happen to the period if you took the pendulum to the Moon?',
  'ពន្យល់ពីរបៀបដែលទំនាញប៉ះពាល់ដល់ចលនានៃប៉ង់ឌុល។ តើអ្វីនឹងកើតឡើងចំពោះរយៈពេលប្រសិនបើអ្នកយកប៉ង់ឌុលទៅព្រះច័ន្ទ?',
  'Write 2-3 sentences explaining the relationship between gravity and pendulum motion.',
  'សរសេរ 2-3 ប្រយោគពន្យល់ពីទំនាក់ទំនងរវាងទំនាញនិងចលនាប៉ង់ឌុល។',
  NULL,
  NULL,
  20,
  'medium',
  'Think about how g appears in the pendulum formula and how Moon''s gravity compares to Earth''s.',
  'គិតអំពីរបៀបដែល g លេចឡើងក្នុងរូបមន្តប៉ង់ឌុលនិងរបៀបដែលទំនាញព្រះច័ន្ទប្រៀបធៀបទៅនឹងផែនដី។',
  'Gravity provides the restoring force for pendulum motion. Since Moon''s gravity is about 1/6 of Earth''s, the period would be longer (about 2.45 times).',
  'ទំនាញផ្តល់កម្លាំងស្តារឡើងវិញសម្រាប់ចលនាប៉ង់ឌុល។ ដោយសារទំនាញព្រះច័ន្ទប្រហែល 1/6 នៃផែនដី រយៈពេលនឹងវែងជាង (ប្រហែល 2.45 ដង)។'
),
(
  'bbbda6f5-560e-4fd2-9855-cd5853c5f28e',
  1,
  4,
  'true_false',
  'The mass of the pendulum bob affects its period of oscillation.',
  'ម៉ាស់នៃដុំប៉ង់ឌុលប៉ះពាល់ដល់រយៈពេលនៃការប៉ប់របស់វា។',
  'Answer true or false based on your simulation observations.',
  'ឆ្លើយពិតឬមិនពិតដោយផ្អែកលើការសង្កេតការធ្វើពិសោធន៍របស់អ្នក។',
  NULL,
  'false',
  5,
  'easy',
  'Try changing only the mass in the simulation and observe the period.',
  'សាកល្បងផ្លាស់ប្តូរតែម៉ាស់ក្នុងការធ្វើពិសោធន៍ហើយសង្កេតរយៈពេល។',
  'The period of a simple pendulum depends only on length and gravity, not on mass.',
  'រយៈពេលនៃប៉ង់ឌុលសាមញ្ញអាស្រ័យតែលើប្រវែងនិងទំនាញប៉ុណ្ណោះ មិនមែនលើម៉ាស់ទេ។'
);