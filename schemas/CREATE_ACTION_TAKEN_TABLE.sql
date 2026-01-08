-- SQL script to create the action_taken table in Supabase
-- Run this in Supabase Dashboard → SQL Editor

-- Create the action_taken table
CREATE TABLE IF NOT EXISTS action_taken (
  id BIGSERIAL PRIMARY KEY,
  action_taken_code TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add unique constraint on action_taken_code to prevent duplicates
  CONSTRAINT unique_action_taken_code UNIQUE (action_taken_code)
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
CREATE TRIGGER update_action_taken_updated_at 
BEFORE UPDATE ON action_taken 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add comments to the table and columns
COMMENT ON TABLE action_taken IS 'Reference table for action taken types in the document tracking system';
COMMENT ON COLUMN action_taken.action_taken_code IS 'Unique code identifier for the action taken';
COMMENT ON COLUMN action_taken.action_taken IS 'Description of the action taken';

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_action_taken_code ON action_taken(action_taken_code);
CREATE INDEX IF NOT EXISTS idx_action_taken_text ON action_taken(action_taken);

-- Enable Row Level Security
ALTER TABLE action_taken ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can restrict this later)
-- For development, this allows all operations. In production, you should restrict this.
CREATE POLICY "Allow all operations for service role" ON action_taken
FOR ALL
USING (true)
WITH CHECK (true);
