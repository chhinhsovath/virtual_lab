-- Add additional profile fields to tbl_child table for student profiles
-- These fields allow students to manage their complete profile information

-- Add photo URL field if it doesn't exist
ALTER TABLE tbl_child 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add email field if it doesn't exist  
ALTER TABLE tbl_child
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add timestamp fields if they don't exist
ALTER TABLE tbl_child
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create uploads directory structure comment
COMMENT ON COLUMN tbl_child.photo_url IS 'URL path to student profile photo stored in /public/uploads/profiles/';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tbl_child_email ON tbl_child(email);
CREATE INDEX IF NOT EXISTS idx_tbl_child_phone ON tbl_child(phone_number);
CREATE INDEX IF NOT EXISTS idx_tbl_child_updated ON tbl_child(updated_at);

-- Create or replace function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_tbl_child_updated_at ON tbl_child;
CREATE TRIGGER update_tbl_child_updated_at 
BEFORE UPDATE ON tbl_child 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();