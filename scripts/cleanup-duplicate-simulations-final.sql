-- Comprehensive cleanup of duplicate simulations - Final version

-- Show what we're about to clean
SELECT 'Simulations to be cleaned (those with # URLs):' as info;
SELECT simulation_name, display_name_en, subject_area
FROM stem_simulations_catalog 
WHERE simulation_url = '#'
ORDER BY subject_area, simulation_name;

-- Count of data to be affected
SELECT 'Data that will be affected:' as info;
SELECT 
  (SELECT COUNT(*) FROM student_assignments WHERE simulation_id IN (SELECT id FROM stem_simulations_catalog WHERE simulation_url = '#')) as student_assignments,
  (SELECT COUNT(*) FROM student_simulation_progress WHERE simulation_id IN (SELECT id FROM stem_simulations_catalog WHERE simulation_url = '#')) as progress_records,
  (SELECT COUNT(*) FROM simulation_exercises WHERE simulation_id IN (SELECT id FROM stem_simulations_catalog WHERE simulation_url = '#')) as exercises,
  (SELECT COUNT(*) FROM teacher_simulation_assignments WHERE simulation_id IN (SELECT id FROM stem_simulations_catalog WHERE simulation_url = '#')) as teacher_assignments;

-- Start cleanup
-- 1. Delete student assignments
DELETE FROM student_assignments
WHERE simulation_id IN (
  SELECT id FROM stem_simulations_catalog WHERE simulation_url = '#'
);

-- 2. Delete activity logs related to these simulations
DELETE FROM simulation_activity_logs
WHERE session_id IN (
  SELECT id FROM student_simulation_sessions 
  WHERE simulation_id IN (
    SELECT id FROM stem_simulations_catalog WHERE simulation_url = '#'
  )
);

-- 3. Delete student sessions
DELETE FROM student_simulation_sessions
WHERE simulation_id IN (
  SELECT id FROM stem_simulations_catalog WHERE simulation_url = '#'
);

-- 4. Delete student progress
DELETE FROM student_simulation_progress 
WHERE simulation_id IN (
  SELECT id FROM stem_simulations_catalog WHERE simulation_url = '#'
);

-- 5. Delete exercise submissions
DELETE FROM student_exercise_submissions
WHERE exercise_id IN (
  SELECT id FROM simulation_exercises 
  WHERE simulation_id IN (
    SELECT id FROM stem_simulations_catalog WHERE simulation_url = '#'
  )
);

-- 6. Delete exercise rubrics
DELETE FROM exercise_rubrics
WHERE exercise_id IN (
  SELECT id FROM simulation_exercises 
  WHERE simulation_id IN (
    SELECT id FROM stem_simulations_catalog WHERE simulation_url = '#'
  )
);

-- 7. Delete exercises
DELETE FROM simulation_exercises 
WHERE simulation_id IN (
  SELECT id FROM stem_simulations_catalog WHERE simulation_url = '#'
);

-- 8. Delete teacher assignments
DELETE FROM teacher_simulation_assignments
WHERE simulation_id IN (
  SELECT id FROM stem_simulations_catalog WHERE simulation_url = '#'
);

-- 9. Finally, delete the simulations with placeholder URLs
DELETE FROM stem_simulations_catalog 
WHERE simulation_url = '#';

-- Show final clean state
SELECT 'Final state - simulations by type:' as info;
SELECT 
  subject_area,
  COUNT(*) as total,
  SUM(CASE WHEN simulation_url LIKE '/labs/%' THEN 1 ELSE 0 END) as html_files,
  SUM(CASE WHEN simulation_url LIKE '/simulations/%' THEN 1 ELSE 0 END) as interactive
FROM stem_simulations_catalog 
GROUP BY subject_area 
ORDER BY subject_area;

SELECT 'Total unique simulations remaining:' as info, COUNT(*) as count FROM stem_simulations_catalog;