-- SQL script to create the document_destination table in Supabase
-- Run this in Supabase Dashboard → SQL Editor
--
-- This table stores destination records for each Document Source (Outbox) document.
-- One document_source can have many document_destination rows (one per destination office/employee).
-- Document Control No. stays the same for the whole document (for tracing).
-- Route No. is per destination (not the same as the source; each destination row has its own route no.).

-- Ensure document_source exists first (run CREATE_DOCUMENT_SOURCE_TABLE.sql before this)
-- Route No. is auto-generated as R{year}-000000001, R{year}-000000002, ... when sent empty.

CREATE SEQUENCE IF NOT EXISTS document_destination_route_no_seq START 1;

CREATE TABLE IF NOT EXISTS document_destination (
  id BIGSERIAL PRIMARY KEY,

  -- Link to the source document (Outbox)
  document_source_id BIGINT NOT NULL REFERENCES document_source(id) ON DELETE CASCADE,

  -- Document Control No. (same for all destination rows of one document; for tracing)
  document_control_no TEXT NOT NULL,

  -- Route No. is per destination; must be unique across all rows (like a primary key)
  route_no TEXT NOT NULL UNIQUE,

  -- Sequence No. (*) - order of this destination for the document
  sequence_no INTEGER NOT NULL,

  -- Destination Office
  destination_office TEXT,

  -- Employee (Action Officer)
  employee_action_officer TEXT,

  -- Action Required (e.g. For Acceptance of Delivery, For Comment)
  action_required TEXT,

  -- Date/Time Released
  date_released DATE,
  time_released TIME,

  -- Date/Time Required
  date_required DATE,
  time_required TIME,

  -- Date/Time Received
  date_received DATE,
  time_received TIME,

  -- Remarks (*)
  remarks TEXT,

  -- Action Taken
  action_taken TEXT,

  -- Remarks on Action Taken (*)
  remarks_on_action_taken TEXT,

  -- Date/Time Acted Upon
  date_acted_upon DATE,
  time_acted_upon TIME,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (document_source_id, sequence_no)
);

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

-- Reuse update_updated_at function if it exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_document_destination_updated_at ON document_destination;
CREATE TRIGGER update_document_destination_updated_at
BEFORE UPDATE ON document_destination
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE document_destination IS 'Document Destination - traces the document; Document Control No. stays the same, Route No. is per destination';
COMMENT ON COLUMN document_destination.document_source_id IS 'FK to document_source (Outbox)';
COMMENT ON COLUMN document_destination.document_control_no IS 'Document control number (same for all destination rows of this document; for tracing)';
COMMENT ON COLUMN document_destination.route_no IS 'Route number for this destination (per-destination; not the same as source)';
COMMENT ON COLUMN document_destination.sequence_no IS 'Sequence number for this destination';
COMMENT ON COLUMN document_destination.destination_office IS 'Destination office';
COMMENT ON COLUMN document_destination.employee_action_officer IS 'Employee (Action Officer)';
COMMENT ON COLUMN document_destination.action_required IS 'Action required (e.g. For Acceptance of Delivery)';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_document_destination_document_source_id ON document_destination(document_source_id);
CREATE INDEX IF NOT EXISTS idx_document_destination_document_control_no ON document_destination(document_control_no);
CREATE INDEX IF NOT EXISTS idx_document_destination_route_no ON document_destination(route_no);
CREATE INDEX IF NOT EXISTS idx_document_destination_sequence_no ON document_destination(document_source_id, sequence_no);

-- Row Level Security
ALTER TABLE document_destination ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for service role" ON document_destination
FOR ALL
USING (true)
WITH CHECK (true);
