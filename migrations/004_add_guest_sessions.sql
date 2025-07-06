-- Add guest session support to user_sessions table
-- This migration adds support for guest sessions that don't require full user accounts

-- Add is_guest column to user_sessions table
ALTER TABLE user_sessions 
ADD COLUMN is_guest BOOLEAN DEFAULT FALSE;

-- Create index for faster guest session queries
CREATE INDEX idx_user_sessions_guest ON user_sessions(is_guest, expires_at) WHERE is_guest = TRUE;

-- Add comment explaining the guest session functionality
COMMENT ON COLUMN user_sessions.is_guest IS 'Indicates if this is a temporary guest session for demo simulations';

-- Update any existing sessions to explicitly mark them as non-guest
UPDATE user_sessions SET is_guest = FALSE WHERE is_guest IS NULL;

-- Make is_guest NOT NULL now that all existing records have been updated
ALTER TABLE user_sessions ALTER COLUMN is_guest SET NOT NULL;