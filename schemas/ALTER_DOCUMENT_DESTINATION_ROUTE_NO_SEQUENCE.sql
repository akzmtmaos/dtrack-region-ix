-- =============================================================================
-- Generate Route No. as R{year}-000000001, R{year}-000000002, ... (sequential)
-- Run in Supabase Dashboard → SQL Editor so new document_destination rows get
-- a sequential Route No. when route_no is sent empty.
-- =============================================================================

-- 1. Sequence for the numeric part (1, 2, 3, ...)
CREATE SEQUENCE IF NOT EXISTS document_destination_route_no_seq START 1;

-- 2. Trigger: when route_no is null or empty, set to R{year}-{9-digit number}
CREATE OR REPLACE FUNCTION document_destination_set_route_no()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.route_no IS NULL OR NEW.route_no = '' THEN
    NEW.route_no := 'R' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('document_destination_route_no_seq')::TEXT, 9, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS document_destination_before_insert_route_no ON document_destination;
CREATE TRIGGER document_destination_before_insert_route_no
BEFORE INSERT ON document_destination
FOR EACH ROW
EXECUTE FUNCTION document_destination_set_route_no();

-- 3. Optional: if you already have rows with R2026-* format, set sequence above max to avoid duplicate
-- Uncomment and run once if needed:
-- SELECT setval('document_destination_route_no_seq', (
--   SELECT COALESCE(MAX((regexp_match(route_no, '^R[0-9]{4}-([0-9]+)$'))[1]::bigint), 0) + 1
--   FROM document_destination WHERE route_no ~ '^R[0-9]{4}-[0-9]+$'
-- ));
