-- SQL script to create the user_levels table in Supabase
-- Run this in Supabase Dashboard → SQL Editor

-- Create the user_levels table
CREATE TABLE IF NOT EXISTS user_levels (
  id BIGSERIAL PRIMARY KEY,
  user_level_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a function to automatically update the updated_at timestamp
-- (This function may already exist from other tables, but it's safe to recreate)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at on row updates
CREATE TRIGGER update_user_levels_updated_at 
BEFORE UPDATE ON user_levels 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add comments to the table and columns
COMMENT ON TABLE user_levels IS 'Reference table for user levels in the document tracking system';
COMMENT ON COLUMN user_levels.id IS 'User Level ID - Unique identifier used as the user level code';
COMMENT ON COLUMN user_levels.user_level_name IS 'Name of the user level (e.g., Admin, User, Viewer)';

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_user_level_name ON user_levels(user_level_name);

-- Enable Row Level Security
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can restrict this later)
-- For development, this allows all operations. In production, you should restrict this.
CREATE POLICY "Allow all operations for service role" ON user_levels
FOR ALL
USING (true)
WITH CHECK (true);
