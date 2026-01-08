-- SQL script to create the document_action_required_days table in Supabase
-- Run this in Supabase Dashboard → SQL Editor

-- Create the document_action_required_days table
CREATE TABLE IF NOT EXISTS document_action_required_days (
  id BIGSERIAL PRIMARY KEY,
  document_type TEXT NOT NULL,
  action_required TEXT NOT NULL,
  required_days INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add unique constraint on combination of document_type and action_required to prevent duplicates
  CONSTRAINT unique_document_action_required UNIQUE (document_type, action_required),
  
  -- Ensure required_days is a positive number
  CONSTRAINT check_required_days_positive CHECK (required_days >= 0)
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
CREATE TRIGGER update_document_action_required_days_updated_at 
BEFORE UPDATE ON document_action_required_days 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add comments to the table and columns
COMMENT ON TABLE document_action_required_days IS 'Reference table for document action required days configuration in the document tracking system';
COMMENT ON COLUMN document_action_required_days.document_type IS 'Type of document';
COMMENT ON COLUMN document_action_required_days.action_required IS 'Type of action required';
COMMENT ON COLUMN document_action_required_days.required_days IS 'Number of days required to complete the action';

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_document_action_required_days_document_type ON document_action_required_days(document_type);
CREATE INDEX IF NOT EXISTS idx_document_action_required_days_action_required ON document_action_required_days(action_required);
CREATE INDEX IF NOT EXISTS idx_document_action_required_days_required_days ON document_action_required_days(required_days);

-- Enable Row Level Security
ALTER TABLE document_action_required_days ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can restrict this later)
-- For development, this allows all operations. In production, you should restrict this.
CREATE POLICY "Allow all operations for service role" ON document_action_required_days
FOR ALL
USING (true)
WITH CHECK (true);
