-- SQL script to remove the abbreviation and user_level_id columns from the region table in Supabase
-- Run this in Supabase Dashboard → SQL Editor if the table already exists

-- Remove the abbreviation column
ALTER TABLE region DROP COLUMN IF EXISTS abbreviation;

-- Remove the index on abbreviation if it exists
DROP INDEX IF EXISTS idx_region_abbreviation;

-- Remove the user_level_id column
ALTER TABLE region DROP COLUMN IF EXISTS user_level_id;

-- Update the comment on the id column to reflect the change
COMMENT ON COLUMN region.id IS 'Region ID - Unique identifier used as the region code';
