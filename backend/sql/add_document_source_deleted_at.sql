-- Run in Supabase SQL Editor (or psql) once. Enables soft-delete / Trash for Outbox documents.
ALTER TABLE document_source ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN document_source.deleted_at IS 'When set, document is in Trash (soft-deleted). NULL = active in Outbox.';

CREATE INDEX IF NOT EXISTS idx_document_source_deleted_at ON document_source(deleted_at);
