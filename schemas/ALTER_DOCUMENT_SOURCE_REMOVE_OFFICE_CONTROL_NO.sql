-- Run this if document_source already exists and you need to remove Office Control No. (Office No. no longer used)
-- Run in Supabase Dashboard → SQL Editor

-- Drop trigger that sets office_control_no
DROP TRIGGER IF EXISTS document_source_before_insert_control_numbers ON document_source;

-- Recreate trigger without office_control_no
CREATE OR REPLACE FUNCTION document_source_set_control_numbers()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.document_control_no IS NULL OR NEW.document_control_no = '' THEN
    NEW.document_control_no := 'DC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('document_source_document_control_seq')::TEXT, 5, '0');
  END IF;
  IF NEW.route_no IS NULL OR NEW.route_no = '' THEN
    NEW.route_no := 'RN-' || LPAD(NEXTVAL('document_source_route_no_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER document_source_before_insert_control_numbers
BEFORE INSERT ON document_source
FOR EACH ROW
EXECUTE FUNCTION document_source_set_control_numbers();

-- Drop index and column
DROP INDEX IF EXISTS idx_document_source_office_control_no;
ALTER TABLE document_source DROP COLUMN IF EXISTS office_control_no;

-- Optional: drop the sequence if you no longer need it
-- DROP SEQUENCE IF EXISTS document_source_office_control_seq;
