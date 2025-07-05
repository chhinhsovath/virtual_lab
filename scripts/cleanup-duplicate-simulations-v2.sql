-- Comprehensive cleanup of duplicate simulations

-- First, let's see what simulations have placeholder URLs
SELECT 'Simulations with placeholder URLs:' as info;
SELECT id, simulation_name, display_name_en, simulation_url 
FROM stem_simulations_catalog 
WHERE simulation_url = '#'
ORDER BY simulation_name;

-- Check if any of these have related data
SELECT 'Related data check:' as info;
SELECT s.simulation_name, 
       COUNT(DISTINCT sp.id) as progress_count,
       COUNT(DISTINCT se.id) as exercise_count,
       COUNT(DISTINCT ta.id) as assignment_count
FROM stem_simulations_catalog s
LEFT JOIN student_simulation_progress sp ON s.id = sp.simulation_id
LEFT JOIN simulation_exercises se ON s.id = se.simulation_id
LEFT JOIN teacher_simulation_assignments ta ON s.id = ta.simulation_id
WHERE s.simulation_url = '#'
GROUP BY s.simulation_name
ORDER BY s.simulation_name;

-- Delete related data for simulations with placeholder URLs
-- 1. Delete student progress
DELETE FROM student_simulation_progress 
WHERE simulation_id IN (
  SELECT id FROM stem_simulations_catalog WHERE simulation_url = '#'
);

-- 2. Delete exercise submissions for these exercises
DELETE FROM student_exercise_submissions
WHERE exercise_id IN (
  SELECT id FROM simulation_exercises 
  WHERE simulation_id IN (
    SELECT id FROM stem_simulations_catalog WHERE simulation_url = '#'
  )
);

-- 3. Delete exercise rubrics
DELETE FROM exercise_rubrics
WHERE exercise_id IN (
  SELECT id FROM simulation_exercises 
  WHERE simulation_id IN (
    SELECT id FROM stem_simulations_catalog WHERE simulation_url = '#'
  )
);

-- 4. Delete exercises
DELETE FROM simulation_exercises 
WHERE simulation_id IN (
  SELECT id FROM stem_simulations_catalog WHERE simulation_url = '#'
);

-- 5. Delete teacher assignments
DELETE FROM teacher_simulation_assignments
WHERE simulation_id IN (
  SELECT id FROM stem_simulations_catalog WHERE simulation_url = '#'
);

-- 6. Finally, delete the simulations with placeholder URLs
DELETE FROM stem_simulations_catalog 
WHERE simulation_url = '#';

-- Show final state
SELECT 'Final simulation count by subject:' as info;
SELECT subject_area, COUNT(*) as count 
FROM stem_simulations_catalog 
GROUP BY subject_area 
ORDER BY subject_area;

SELECT 'All remaining simulations:' as info;
SELECT simulation_name, display_name_en, subject_area, 
       CASE 
         WHEN simulation_url LIKE '/labs/%' THEN 'HTML File'
         WHEN simulation_url LIKE '/simulations/%' THEN 'Interactive'
         ELSE 'Other'
       END as type
FROM stem_simulations_catalog 
ORDER BY subject_area, display_name_en;