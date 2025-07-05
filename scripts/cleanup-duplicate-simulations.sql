-- Cleanup duplicate simulations and remove ones with placeholder URLs

-- First, let's see what we're going to delete
SELECT 'Simulations to be removed:' as info;
SELECT simulation_name, display_name_en, simulation_url 
FROM stem_simulations_catalog 
WHERE simulation_url = '#'
ORDER BY simulation_name;

-- Delete exercises for simulations with placeholder URLs first
DELETE FROM simulation_exercises 
WHERE simulation_id IN (
  SELECT id FROM stem_simulations_catalog WHERE simulation_url = '#'
);

-- Delete simulations with placeholder URLs
DELETE FROM stem_simulations_catalog 
WHERE simulation_url = '#';

-- Show remaining simulations
SELECT 'Remaining simulations:' as info;
SELECT simulation_name, display_name_en, subject_area, simulation_url 
FROM stem_simulations_catalog 
ORDER BY subject_area, display_name_en;