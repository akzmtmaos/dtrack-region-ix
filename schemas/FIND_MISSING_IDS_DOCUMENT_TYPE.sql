-- SQL query to find missing ID numbers in the document_type table
-- Run this in Supabase Dashboard → SQL Editor
-- This will help identify gaps in the ID sequence that can be reused

-- Method 1: Find all missing IDs in the sequence
-- This generates a series from 1 to the maximum ID and finds which ones are missing
WITH id_series AS (
  SELECT generate_series(1, (SELECT COALESCE(MAX(id), 0) FROM document_type)) AS missing_id
)
SELECT 
  s.missing_id AS missing_id,
  LPAD(s.missing_id::text, 5, '0') AS formatted_id
FROM id_series s
LEFT JOIN document_type dt ON s.missing_id = dt.id
WHERE dt.id IS NULL
ORDER BY s.missing_id;

-- Method 2: Find only the first few missing IDs (useful if you have many gaps)
-- Uncomment this if you only want to see the first 10 missing IDs
/*
WITH id_series AS (
  SELECT generate_series(1, (SELECT COALESCE(MAX(id), 0) FROM document_type)) AS missing_id
)
SELECT 
  s.missing_id AS missing_id,
  LPAD(s.missing_id::text, 5, '0') AS formatted_id
FROM id_series s
LEFT JOIN document_type dt ON s.missing_id = dt.id
WHERE dt.id IS NULL
ORDER BY s.missing_id
LIMIT 10;
*/

-- Method 3: Find the smallest missing ID (the first gap)
-- This is useful if you want to find the lowest available ID
/*
WITH id_series AS (
  SELECT generate_series(1, (SELECT COALESCE(MAX(id), 0) FROM document_type)) AS missing_id
)
SELECT 
  MIN(s.missing_id) AS first_missing_id,
  LPAD(MIN(s.missing_id)::text, 5, '0') AS formatted_first_missing_id
FROM id_series s
LEFT JOIN document_type dt ON s.missing_id = dt.id
WHERE dt.id IS NULL;
*/

-- Method 4: Summary of missing IDs
-- Shows count of missing IDs and the range
/*
SELECT 
  COUNT(*) AS total_missing_ids,
  MIN(missing_id) AS first_missing_id,
  MAX(missing_id) AS last_missing_id
FROM (
  WITH id_series AS (
    SELECT generate_series(1, (SELECT COALESCE(MAX(id), 0) FROM document_type)) AS missing_id
  )
  SELECT s.missing_id
  FROM id_series s
  LEFT JOIN document_type dt ON s.missing_id = dt.id
  WHERE dt.id IS NULL
) AS missing;
*/
