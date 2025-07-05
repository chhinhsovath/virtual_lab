-- Create migration tracking table to keep track of applied migrations
-- This should be the first migration run on any database

-- Create migrations tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checksum VARCHAR(64),
    execution_time_ms INTEGER,
    applied_by VARCHAR(100),
    notes TEXT
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_migrations_name ON schema_migrations(migration_name);
CREATE INDEX IF NOT EXISTS idx_migrations_applied ON schema_migrations(applied_at);

-- Add comment
COMMENT ON TABLE schema_migrations IS 'Tracks applied database migrations to ensure consistency across environments';