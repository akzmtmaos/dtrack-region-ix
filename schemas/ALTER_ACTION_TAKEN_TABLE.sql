-- SQL script to alter the action_taken table in Supabase
-- Run this in Supabase Dashboard → SQL Editor
-- This removes the action_taken_code column since ID is now used as the code

-- Drop the unique constraint on action_taken_code first
ALTER TABLE IF EXISTS action_taken DROP CONSTRAINT IF EXISTS unique_action_taken_code;

-- Drop the index on action_taken_code
DROP INDEX IF EXISTS idx_action_taken_code;

-- Drop the action_taken_code column
ALTER TABLE IF EXISTS action_taken DROP COLUMN IF EXISTS action_taken_code;

-- Update the comment on the id column
COMMENT ON COLUMN action_taken.id IS 'Action Taken ID - Unique identifier used as the action taken code';
