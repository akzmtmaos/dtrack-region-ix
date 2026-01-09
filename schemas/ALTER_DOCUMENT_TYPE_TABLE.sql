-- SQL script to alter the document_type table in Supabase
-- Run this in Supabase Dashboard → SQL Editor
-- This removes the document_type_code column since ID is now used as the code

-- Drop the unique constraint on document_type_code first
ALTER TABLE IF EXISTS document_type DROP CONSTRAINT IF EXISTS unique_document_type_code;

-- Drop the index on document_type_code
DROP INDEX IF EXISTS idx_document_type_code;

-- Drop the document_type_code column
ALTER TABLE IF EXISTS document_type DROP COLUMN IF EXISTS document_type_code;

-- Update the comment on the id column
COMMENT ON COLUMN document_type.id IS 'Document Type ID - Unique identifier used as the document type code';
