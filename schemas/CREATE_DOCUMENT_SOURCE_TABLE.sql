-- SQL script to create the document_source table (Outbox) in Supabase
-- Run this in Supabase Dashboard → SQL Editor
--
-- This table stores documents in the Document Source (Outbox) with:
-- - document_control_no: Unique document identifier (stays the same for the document; auto-generated if not provided)
-- - route_no: Routing number on the source (auto-generated if not provided)
-- Office No. / Office Control No. is no longer used and has been removed.

-- Create sequences for auto-generating control numbers (optional; used when not supplied on insert)
CREATE SEQUENCE IF NOT EXISTS document_source_document_control_seq START 1;
CREATE SEQUENCE IF NOT EXISTS document_source_route_no_seq START 1;

-- Create the document_source table (Outbox)
CREATE TABLE IF NOT EXISTS document_source (
  id BIGSERIAL PRIMARY KEY,

  -- Control numbers (unique identifiers; can be auto-generated via trigger or set by application)
  document_control_no TEXT UNIQUE,
  route_no TEXT,

  -- Basic document info
  subject TEXT NOT NULL,
  document_type TEXT,
  source_type TEXT CHECK (source_type IN ('Internal', 'External') OR source_type IS NULL),

  -- Originating info - Internal
  internal_originating_office TEXT,
  internal_originating_employee TEXT,

  -- Originating info - External
  external_originating_office TEXT,
  external_originating_employee TEXT,

  -- Attachments and pages
  no_of_pages TEXT,
  attached_document_filename TEXT,
  attachment_list TEXT,

  -- Additional
  userid TEXT,
  in_sequence TEXT,
  remarks TEXT NOT NULL,

  -- Reference documents (up to 5)
  reference_document_control_no_1 TEXT,
  reference_document_control_no_2 TEXT,
  reference_document_control_no_3 TEXT,
  reference_document_control_no_4 TEXT,
  reference_document_control_no_5 TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reuse update_updated_at function if it exists (from other tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row updates
DROP TRIGGER IF EXISTS update_document_source_updated_at ON document_source;
CREATE TRIGGER update_document_source_updated_at
BEFORE UPDATE ON document_source
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger: auto-fill document_control_no, route_no on INSERT when null
-- Format: document_control_no = DC-YYYY-NNNNN, route_no = RN-NNNNN
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

-- Comments
COMMENT ON TABLE document_source IS 'Document Source (Outbox) - stores outgoing/source documents with control numbers';
COMMENT ON COLUMN document_source.id IS 'Primary key';
COMMENT ON COLUMN document_source.document_control_no IS 'Unique document control number (e.g. DC-YYYY-NNNNN); auto-generated if not provided';
COMMENT ON COLUMN document_source.route_no IS 'Route number for tracking on source; auto-generated if not provided';
COMMENT ON COLUMN document_source.subject IS 'Document subject';
COMMENT ON COLUMN document_source.document_type IS 'Type of document';
COMMENT ON COLUMN document_source.source_type IS 'Internal or External';
COMMENT ON COLUMN document_source.remarks IS 'Remarks or notes';

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_document_source_document_control_no ON document_source(document_control_no);
CREATE INDEX IF NOT EXISTS idx_document_source_route_no ON document_source(route_no);
CREATE INDEX IF NOT EXISTS idx_document_source_created_at ON document_source(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_source_subject ON document_source(subject);
CREATE INDEX IF NOT EXISTS idx_document_source_source_type ON document_source(source_type);

-- Row Level Security
ALTER TABLE document_source ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for service role" ON document_source
FOR ALL
USING (true)
WITH CHECK (true);
