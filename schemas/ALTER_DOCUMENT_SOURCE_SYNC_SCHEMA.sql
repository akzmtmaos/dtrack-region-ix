-- =============================================================================
-- Update document_source table in Supabase to match current schema
-- Run this in Supabase Dashboard → SQL Editor if you already have document_source
-- and need to remove columns that were cleared from the app (e.g. Office Control No.).
-- =============================================================================

-- 1. Drop the insert trigger (it will be recreated without removed columns)
DROP TRIGGER IF EXISTS document_source_before_insert_control_numbers ON document_source;

-- 2. Recreate the control-numbers function (only document_control_no and route_no;
--    office_control_no / Office No. is no longer used)
--    route_no format: R2026-000000001 (same style as Document Destination)
CREATE OR REPLACE FUNCTION document_source_set_control_numbers()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.document_control_no IS NULL OR NEW.document_control_no = '' THEN
    NEW.document_control_no := 'DC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('document_source_document_control_seq')::TEXT, 5, '0');
  END IF;
  IF NEW.route_no IS NULL OR NEW.route_no = '' THEN
    NEW.route_no := 'R' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('document_source_route_no_seq')::TEXT, 9, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Reattach the trigger
CREATE TRIGGER document_source_before_insert_control_numbers
BEFORE INSERT ON document_source
FOR EACH ROW
EXECUTE FUNCTION document_source_set_control_numbers();

-- 4. Remove unused columns (cleared from Document Source / no longer in app)
--    Drop indexes first if they exist, then drop columns.
DROP INDEX IF EXISTS idx_document_source_office_control_no;
ALTER TABLE document_source DROP COLUMN IF EXISTS office_control_no;

-- Office No. (alternate legacy name; drop if present)
DROP INDEX IF EXISTS idx_document_source_office_no;
ALTER TABLE document_source DROP COLUMN IF EXISTS office_no;

-- Reference Document No. columns (removed from app)
ALTER TABLE document_source DROP COLUMN IF EXISTS reference_document_control_no_1;
ALTER TABLE document_source DROP COLUMN IF EXISTS reference_document_control_no_2;
ALTER TABLE document_source DROP COLUMN IF EXISTS reference_document_control_no_3;
ALTER TABLE document_source DROP COLUMN IF EXISTS reference_document_control_no_4;
ALTER TABLE document_source DROP COLUMN IF EXISTS reference_document_control_no_5;

-- Add more DROP COLUMN IF EXISTS <name>; here if you have other legacy columns
-- that are not in the "current schema" list below.

-- 5. Ensure sequences exist for auto-generated control numbers (safe if already present)
CREATE SEQUENCE IF NOT EXISTS document_source_document_control_seq START 1;
CREATE SEQUENCE IF NOT EXISTS document_source_route_no_seq START 1;

-- 6. Optional: backfill existing route_no from old format (RN-00004) to new format (R2026-000000001)
UPDATE document_source
SET route_no = 'R' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(id::TEXT, 9, '0')
WHERE route_no ~ '^RN-[0-9]+$';
SELECT setval('document_source_route_no_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM document_source));

-- Done. document_source should now only have these columns (current schema):
-- id, document_control_no, route_no, subject, document_type, source_type,
-- internal_originating_office, internal_originating_employee,
-- external_originating_office, external_originating_employee,
-- no_of_pages, attached_document_filename, attachment_list,
-- userid, in_sequence, remarks, created_at, updated_at
