-- SQL script to create the document_type table in Supabase
-- Run this in Supabase Dashboard → SQL Editor

-- Create the document_type table
CREATE TABLE IF NOT EXISTS document_type (
  id BIGSERIAL PRIMARY KEY,
  document_type_code TEXT NOT NULL,
  document_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add unique constraint on document_type_code to prevent duplicates
  CONSTRAINT unique_document_type_code UNIQUE (document_type_code)
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
CREATE TRIGGER update_document_type_updated_at 
BEFORE UPDATE ON document_type 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add comments to the table and columns
COMMENT ON TABLE document_type IS 'Reference table for document types in the document tracking system';
COMMENT ON COLUMN document_type.document_type_code IS 'Unique code identifier for the document type';
COMMENT ON COLUMN document_type.document_type IS 'Description of the document type';

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_document_type_code ON document_type(document_type_code);
CREATE INDEX IF NOT EXISTS idx_document_type_text ON document_type(document_type);

-- Enable Row Level Security
ALTER TABLE document_type ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can restrict this later)
-- For development, this allows all operations. In production, you should restrict this.
CREATE POLICY "Allow all operations for service role" ON document_type
FOR ALL
USING (true)
WITH CHECK (true);
