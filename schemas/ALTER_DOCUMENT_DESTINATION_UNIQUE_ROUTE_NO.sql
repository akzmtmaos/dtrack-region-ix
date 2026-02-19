-- =============================================================================
-- Enforce unique Route No. on document_destination (treat like a primary key)
-- Run in Supabase Dashboard → SQL Editor if document_destination already exists.
-- Fixes duplicate route_no by assigning unique values, then adds UNIQUE constraint.
-- =============================================================================

-- 1. Backfill duplicate route_no with unique values (document_source_id + sequence_no + id)
UPDATE document_destination d
SET route_no = 'RN-' || d.document_source_id || '-' || LPAD(d.sequence_no::TEXT, 4, '0') || '-' || d.id
WHERE EXISTS (
  SELECT 1 FROM document_destination d2
  WHERE d2.route_no = d.route_no AND d2.id <> d.id
);

-- 2. Add UNIQUE constraint on route_no (skip if already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'document_destination_route_no_key'
    AND conrelid = 'document_destination'::regclass
  ) THEN
    ALTER TABLE document_destination ADD CONSTRAINT document_destination_route_no_key UNIQUE (route_no);
  END IF;
END $$;

-- Comment
COMMENT ON COLUMN document_destination.route_no IS 'Route number for this destination; must be unique across all rows';
