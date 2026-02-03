-- Run this if document_destination already exists and you need to add document_control_no
-- Document Control No. stays the same for the document; Route No. is per destination.
-- Run in Supabase Dashboard → SQL Editor

-- Add document_control_no (same for all rows of one document; populate from source)
ALTER TABLE document_destination
ADD COLUMN IF NOT EXISTS document_control_no TEXT;

-- Backfill from document_source (run once)
UPDATE document_destination d
SET document_control_no = s.document_control_no
FROM document_source s
WHERE d.document_source_id = s.id AND (d.document_control_no IS NULL OR d.document_control_no = '');

-- Make it NOT NULL after backfill (optional; uncomment if all rows are backfilled)
-- ALTER TABLE document_destination ALTER COLUMN document_control_no SET NOT NULL;

COMMENT ON COLUMN document_destination.document_control_no IS 'Document control number (same for all destination rows of this document; for tracing)';
COMMENT ON COLUMN document_destination.route_no IS 'Route number for this destination (per-destination; not the same as source)';

CREATE INDEX IF NOT EXISTS idx_document_destination_document_control_no ON document_destination(document_control_no);
