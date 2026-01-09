-- SQL script to create the office table in Supabase
-- Run this in Supabase Dashboard → SQL Editor

-- Create the office table
CREATE TABLE IF NOT EXISTS office (
  id BIGSERIAL PRIMARY KEY,
  office TEXT NOT NULL,
  region TEXT,
  short_name TEXT,
  head_office TEXT,
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
CREATE TRIGGER update_office_updated_at 
BEFORE UPDATE ON office 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add comments to the table and columns
COMMENT ON TABLE office IS 'Reference table for offices in the document tracking system';
COMMENT ON COLUMN office.id IS 'Office ID - Unique identifier used as the office code';
COMMENT ON COLUMN office.office IS 'Name of the office';
COMMENT ON COLUMN office.region IS 'Region where the office is located';
COMMENT ON COLUMN office.short_name IS 'Short name or abbreviation of the office';
COMMENT ON COLUMN office.head_office IS 'Head office designation';

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_office_text ON office(office);
CREATE INDEX IF NOT EXISTS idx_office_region ON office(region);
CREATE INDEX IF NOT EXISTS idx_office_short_name ON office(short_name);

-- Enable Row Level Security
ALTER TABLE office ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can restrict this later)
-- For development, this allows all operations. In production, you should restrict this.
CREATE POLICY "Allow all operations for service role" ON office
FOR ALL
USING (true)
WITH CHECK (true);
