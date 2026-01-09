-- SQL script to create the action_required table in Supabase
-- Run this in Supabase Dashboard → SQL Editor

-- Create the action_required table
CREATE TABLE IF NOT EXISTS action_required (
  id BIGSERIAL PRIMARY KEY,
  action_required TEXT NOT NULL,
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
CREATE TRIGGER update_action_required_updated_at 
BEFORE UPDATE ON action_required 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add comments to the table and columns
COMMENT ON TABLE action_required IS 'Reference table for action required types in the document tracking system';
COMMENT ON COLUMN action_required.id IS 'Action Required ID - Unique identifier used as the action required code';
COMMENT ON COLUMN action_required.action_required IS 'Description of the action required';

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_action_required_text ON action_required(action_required);

-- Enable Row Level Security
ALTER TABLE action_required ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can restrict this later)
-- For development, this allows all operations. In production, you should restrict this.
CREATE POLICY "Allow all operations for service role" ON action_required
FOR ALL
USING (true)
WITH CHECK (true);
