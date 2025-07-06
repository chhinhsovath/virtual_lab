-- Add content fields to stem_simulations_catalog table
-- This migration adds fields for simulation content, exercises, and status workflow

-- Add new columns to stem_simulations_catalog
ALTER TABLE stem_simulations_catalog 
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published')),
  ADD COLUMN IF NOT EXISTS simulation_file_path VARCHAR(500),
  ADD COLUMN IF NOT EXISTS exercise_content_en TEXT,
  ADD COLUMN IF NOT EXISTS exercise_content_km TEXT,
  ADD COLUMN IF NOT EXISTS instruction_content_en TEXT,
  ADD COLUMN IF NOT EXISTS instruction_content_km TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_stem_simulations_catalog_status ON stem_simulations_catalog(status);
CREATE INDEX IF NOT EXISTS idx_stem_simulations_catalog_created_by ON stem_simulations_catalog(created_by);

-- Add comments
COMMENT ON COLUMN stem_simulations_catalog.status IS 'Workflow status: draft, review, or published';
COMMENT ON COLUMN stem_simulations_catalog.simulation_file_path IS 'Path to uploaded HTML simulation file';
COMMENT ON COLUMN stem_simulations_catalog.exercise_content_en IS 'Exercise sheet content in English';
COMMENT ON COLUMN stem_simulations_catalog.exercise_content_km IS 'Exercise sheet content in Khmer';
COMMENT ON COLUMN stem_simulations_catalog.instruction_content_en IS 'Student activity instructions in English';
COMMENT ON COLUMN stem_simulations_catalog.instruction_content_km IS 'Student activity instructions in Khmer';
COMMENT ON COLUMN stem_simulations_catalog.is_template IS 'Whether this simulation can be used as a template';

-- Create simulation files table for storing uploaded files
CREATE TABLE IF NOT EXISTS simulation_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id UUID REFERENCES stem_simulations_catalog(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INTEGER NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_simulation_files_simulation_id ON simulation_files(simulation_id);

-- Record migration completion
INSERT INTO learning_analytics (student_id, school_id, subject_area, metric_name, metric_value, metric_unit, additional_data) 
VALUES (0, 0, 'System', 'schema_migration', 23, 'version', 
  ('{"migration_name": "add_simulation_content_fields", "completed_at": "' || CURRENT_TIMESTAMP || '"}')::jsonb)
ON CONFLICT DO NOTHING;