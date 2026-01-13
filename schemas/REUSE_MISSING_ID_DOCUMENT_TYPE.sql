-- SQL script to reuse a missing ID in the document_type table
-- Run this in Supabase Dashboard → SQL Editor
-- 
-- IMPORTANT: This allows you to manually insert a record with a specific ID
-- Use this carefully, as it bypasses the auto-increment sequence

-- Step 1: Check if the ID you want to use is available
-- Replace '2' with the ID you want to check
SELECT 
  id,
  document_type,
  CASE 
    WHEN id IS NULL THEN 'ID is available'
    ELSE 'ID already exists'
  END AS status
FROM document_type
WHERE id = 2;

-- Step 2: If the ID is available (returns no rows), you can insert with that ID
-- Replace '2' with your desired ID and 'Your Document Type Name' with the actual name
-- Uncomment the following to insert:
/*
INSERT INTO document_type (id, document_type, created_at, updated_at)
VALUES (2, 'Your Document Type Name', NOW(), NOW())
RETURNING id, document_type;
*/

-- Step 3: After inserting with a specific ID, you may want to reset the sequence
-- This ensures the next auto-generated ID is higher than any manually inserted ID
-- Uncomment the following to reset the sequence:
/*
SELECT setval(
  pg_get_serial_sequence('document_type', 'id'),
  (SELECT COALESCE(MAX(id), 1) FROM document_type)
);
*/

-- Alternative: If you want to insert and automatically reset the sequence in one go:
-- Replace '2' and 'Your Document Type Name' as needed
/*
DO $$
DECLARE
  new_id BIGINT := 2;  -- Change this to your desired ID
  new_document_type TEXT := 'Your Document Type Name';  -- Change this
BEGIN
  -- Insert the record
  INSERT INTO document_type (id, document_type, created_at, updated_at)
  VALUES (new_id, new_document_type, NOW(), NOW());
  
  -- Reset the sequence to be higher than the max ID
  PERFORM setval(
    pg_get_serial_sequence('document_type', 'id'),
    (SELECT COALESCE(MAX(id), 1) FROM document_type)
  );
  
  RAISE NOTICE 'Inserted document type with ID %', new_id;
END $$;
*/
