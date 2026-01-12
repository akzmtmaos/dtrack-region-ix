-- SQL script to create the region table in Supabase
-- Run this in Supabase Dashboard → SQL Editor

-- Create the region table
CREATE TABLE IF NOT EXISTS region (
  id BIGSERIAL PRIMARY KEY,
  region_name TEXT NOT NULL,
  nscb_code TEXT NOT NULL,
  nscb_name TEXT NOT NULL,
  added_by TEXT NOT NULL,
  status TEXT NOT NULL,
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
CREATE TRIGGER update_region_updated_at 
BEFORE UPDATE ON region 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add comments to the table and columns
COMMENT ON TABLE region IS 'Reference table for regions in the document tracking system';
COMMENT ON COLUMN region.id IS 'Region ID - Unique identifier used as the region code';
COMMENT ON COLUMN region.region_name IS 'Name of the region';
COMMENT ON COLUMN region.nscb_code IS 'NSCB (National Statistical Coordination Board) code for the region';
COMMENT ON COLUMN region.nscb_name IS 'NSCB name for the region';
COMMENT ON COLUMN region.added_by IS 'User who added the region record';
COMMENT ON COLUMN region.status IS 'Status of the region (e.g., Active, Inactive)';

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_region_name ON region(region_name);
CREATE INDEX IF NOT EXISTS idx_region_nscb_code ON region(nscb_code);
CREATE INDEX IF NOT EXISTS idx_region_status ON region(status);

-- Enable Row Level Security
ALTER TABLE region ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can restrict this later)
-- For development, this allows all operations. In production, you should restrict this.
CREATE POLICY "Allow all operations for service role" ON region
FOR ALL
USING (true)
WITH CHECK (true);
