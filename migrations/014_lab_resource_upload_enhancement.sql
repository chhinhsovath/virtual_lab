-- Lab Resource Upload Enhancement
-- This migration adds the specific fields and structure required for the LabResourceUpload module

-- Add missing fields to lms_labs table
ALTER TABLE lms_labs ADD COLUMN IF NOT EXISTS grade VARCHAR(20);
ALTER TABLE lms_labs ADD COLUMN IF NOT EXISTS subject VARCHAR(100);
ALTER TABLE lms_labs ADD COLUMN IF NOT EXISTS version_note TEXT;

-- Update lab_resources table to match specification
ALTER TABLE lms_lab_resources ADD COLUMN IF NOT EXISTS version VARCHAR(20) DEFAULT '1.0';
ALTER TABLE lms_lab_resources ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES users(id);
ALTER TABLE lms_lab_resources ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update resource_type enum to match specification
ALTER TABLE lms_lab_resources DROP CONSTRAINT IF EXISTS lms_lab_resources_resource_type_check;
ALTER TABLE lms_lab_resources ADD CONSTRAINT lms_lab_resources_resource_type_check 
    CHECK (resource_type IN ('simulation_html', 'worksheet', 'rubric', 'manual', 'video', 'document'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_labs_grade ON lms_labs(grade);
CREATE INDEX IF NOT EXISTS idx_labs_subject ON lms_labs(subject);
CREATE INDEX IF NOT EXISTS idx_lab_resources_type ON lms_lab_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_lab_resources_version ON lms_lab_resources(version);
CREATE INDEX IF NOT EXISTS idx_lab_resources_uploaded_by ON lms_lab_resources(uploaded_by);

-- Update existing data to have proper resource types
UPDATE lms_lab_resources SET resource_type = 'simulation_html' WHERE resource_type = 'simulation';

-- Add constraints for file URLs
ALTER TABLE lms_lab_resources ADD CONSTRAINT chk_file_url_not_empty CHECK (LENGTH(file_url) > 0);

-- Create a view for easier lab resource querying
CREATE OR REPLACE VIEW lab_resources_view AS
SELECT 
    l.id as lab_id,
    l.title,
    l.grade,
    l.subject,
    l.duration_minutes,
    l.version_note,
    l.created_by,
    l.created_at,
    l.updated_at,
    lr.id as resource_id,
    lr.resource_type,
    lr.title as resource_title,
    lr.file_url,
    lr.version as resource_version,
    lr.uploaded_by,
    lr.uploaded_at,
    lr.file_size,
    lr.mime_type,
    u.name as created_by_name,
    up.name as uploaded_by_name
FROM lms_labs l
LEFT JOIN lms_lab_resources lr ON l.id = lr.lab_id
LEFT JOIN users u ON l.created_by = u.id
LEFT JOIN users up ON lr.uploaded_by = up.id;

COMMENT ON VIEW lab_resources_view IS 'Comprehensive view of labs with their associated resources and creator information';