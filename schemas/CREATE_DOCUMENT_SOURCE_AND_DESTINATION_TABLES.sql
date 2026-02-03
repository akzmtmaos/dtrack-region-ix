-- SQL script to create Document Source (Outbox) and Document Destination tables in Supabase
-- Run this in Supabase Dashboard → SQL Editor (one script creates both tables)
--
-- 1. document_source (Outbox) - stores outgoing/source documents
--    - document_control_no: unique per document (auto-generated if not provided)
--    - route_no: routing number on source (auto-generated if not provided)
--    - Office No. / Office Control No. is no longer used (removed)
--
-- 2. document_destination - traces the document; one source can have many destinations
--    - document_control_no: same for all destination rows of one document (for tracing)
--    - route_no: per destination (each row has its own route no.; not the same as source)

-- =============================================================================
-- PART 1: DOCUMENT SOURCE (OUTBOX)
-- =============================================================================

-- Sequences for auto-generating control numbers
CREATE SEQUENCE IF NOT EXISTS document_source_document_control_seq START 1;
CREATE SEQUENCE IF NOT EXISTS document_source_route_no_seq START 1;

CREATE TABLE IF NOT EXISTS document_source (
  id BIGSERIAL PRIMARY KEY,

  document_control_no TEXT UNIQUE,
  route_no TEXT,

  subject TEXT NOT NULL,
  document_type TEXT,
  source_type TEXT CHECK (source_type IN ('Internal', 'External') OR source_type IS NULL),

  internal_originating_office TEXT,
  internal_originating_employee TEXT,
  external_originating_office TEXT,
  external_originating_employee TEXT,

  no_of_pages TEXT,
  attached_document_filename TEXT,
  attachment_list TEXT,

  userid TEXT,
  in_sequence TEXT,
  remarks TEXT NOT NULL,

  reference_document_control_no_1 TEXT,
  reference_document_control_no_2 TEXT,
  reference_document_control_no_3 TEXT,
  reference_document_control_no_4 TEXT,
  reference_document_control_no_5 TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_document_source_updated_at ON document_source;
CREATE TRIGGER update_document_source_updated_at
BEFORE UPDATE ON document_source
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

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

DROP TRIGGER IF EXISTS document_source_before_insert_control_numbers ON document_source;
CREATE TRIGGER document_source_before_insert_control_numbers
BEFORE INSERT ON document_source
FOR EACH ROW
EXECUTE FUNCTION document_source_set_control_numbers();

COMMENT ON TABLE document_source IS 'Document Source (Outbox) - stores outgoing/source documents with control numbers';
COMMENT ON COLUMN document_source.document_control_no IS 'Unique document control number (e.g. DC-YYYY-NNNNN); auto-generated if not provided';
COMMENT ON COLUMN document_source.route_no IS 'Route number for tracking on source; auto-generated if not provided';
COMMENT ON COLUMN document_source.subject IS 'Document subject';
COMMENT ON COLUMN document_source.remarks IS 'Remarks or notes';

CREATE INDEX IF NOT EXISTS idx_document_source_document_control_no ON document_source(document_control_no);
CREATE INDEX IF NOT EXISTS idx_document_source_route_no ON document_source(route_no);
CREATE INDEX IF NOT EXISTS idx_document_source_created_at ON document_source(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_source_subject ON document_source(subject);
CREATE INDEX IF NOT EXISTS idx_document_source_source_type ON document_source(source_type);

ALTER TABLE document_source ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for service role" ON document_source
FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- PART 2: DOCUMENT DESTINATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS document_destination (
  id BIGSERIAL PRIMARY KEY,

  document_source_id BIGINT NOT NULL REFERENCES document_source(id) ON DELETE CASCADE,
  document_control_no TEXT NOT NULL,
  route_no TEXT NOT NULL,
  sequence_no INTEGER NOT NULL,

  destination_office TEXT,
  employee_action_officer TEXT,
  action_required TEXT,

  date_released DATE,
  time_released TIME,
  date_required DATE,
  time_required TIME,
  date_received DATE,
  time_received TIME,

  remarks TEXT,
  action_taken TEXT,
  remarks_on_action_taken TEXT,
  date_acted_upon DATE,
  time_acted_upon TIME,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (document_source_id, sequence_no)
);

DROP TRIGGER IF EXISTS update_document_destination_updated_at ON document_destination;
CREATE TRIGGER update_document_destination_updated_at
BEFORE UPDATE ON document_destination
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE document_destination IS 'Document Destination - traces the document; Document Control No. stays the same, Route No. is per destination';
COMMENT ON COLUMN document_destination.document_source_id IS 'FK to document_source (Outbox)';
COMMENT ON COLUMN document_destination.document_control_no IS 'Document control number (same for all destination rows of this document; for tracing)';
COMMENT ON COLUMN document_destination.route_no IS 'Route number for this destination (per-destination; not the same as source)';
COMMENT ON COLUMN document_destination.sequence_no IS 'Sequence number for this destination';
COMMENT ON COLUMN document_destination.destination_office IS 'Destination office';
COMMENT ON COLUMN document_destination.employee_action_officer IS 'Employee (Action Officer)';
COMMENT ON COLUMN document_destination.action_required IS 'Action required (e.g. For Acceptance of Delivery)';

CREATE INDEX IF NOT EXISTS idx_document_destination_document_source_id ON document_destination(document_source_id);
CREATE INDEX IF NOT EXISTS idx_document_destination_document_control_no ON document_destination(document_control_no);
CREATE INDEX IF NOT EXISTS idx_document_destination_route_no ON document_destination(route_no);
CREATE INDEX IF NOT EXISTS idx_document_destination_sequence_no ON document_destination(document_source_id, sequence_no);

ALTER TABLE document_destination ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for service role" ON document_destination
FOR ALL USING (true) WITH CHECK (true);
