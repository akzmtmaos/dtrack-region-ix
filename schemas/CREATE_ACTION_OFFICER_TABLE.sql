-- SQL script to create the action_officer table in Supabase
-- Run this in Supabase Dashboard → SQL Editor

-- Create the action_officer table
CREATE TABLE IF NOT EXISTS action_officer (
  id BIGSERIAL PRIMARY KEY,
  employee_code TEXT NOT NULL,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  middle_name TEXT NOT NULL,
  office TEXT,
  user_password TEXT NOT NULL,
  user_level TEXT NOT NULL,
  office_representative TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add unique constraint on employee_code to prevent duplicates
  CONSTRAINT unique_employee_code UNIQUE (employee_code)
);

-- Create a function to automatically update the updated_at timestamp
-- (This function may already exist from action_required table, but it's safe to recreate)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at on row updates
CREATE TRIGGER update_action_officer_updated_at 
BEFORE UPDATE ON action_officer 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add comments to the table and columns
COMMENT ON TABLE action_officer IS 'Reference table for action officers in the document tracking system';
COMMENT ON COLUMN action_officer.employee_code IS 'Unique employee identification code';
COMMENT ON COLUMN action_officer.last_name IS 'Last name of the action officer';
COMMENT ON COLUMN action_officer.first_name IS 'First name of the action officer';
COMMENT ON COLUMN action_officer.middle_name IS 'Middle name of the action officer';
COMMENT ON COLUMN action_officer.office IS 'Office assignment (optional)';
COMMENT ON COLUMN action_officer.user_password IS 'User password (should be hashed in production)';
COMMENT ON COLUMN action_officer.user_level IS 'User access level (e.g., Admin, User, Viewer)';
COMMENT ON COLUMN action_officer.office_representative IS 'Whether the officer is an office representative (Yes/No)';

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_action_officer_employee_code ON action_officer(employee_code);
CREATE INDEX IF NOT EXISTS idx_action_officer_last_name ON action_officer(last_name);
CREATE INDEX IF NOT EXISTS idx_action_officer_first_name ON action_officer(first_name);
CREATE INDEX IF NOT EXISTS idx_action_officer_office ON action_officer(office);
CREATE INDEX IF NOT EXISTS idx_action_officer_user_level ON action_officer(user_level);

-- Enable Row Level Security
ALTER TABLE action_officer ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can restrict this later)
-- For development, this allows all operations. In production, you should restrict this.
CREATE POLICY "Allow all operations for service role" ON action_officer
FOR ALL
USING (true)
WITH CHECK (true);
