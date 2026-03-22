-- Who currently controls the document in Outbox (routing handoff).
-- Starts as creator (userid); moves to employee_action_officer when that destination row is received.
ALTER TABLE document_source ADD COLUMN IF NOT EXISTS current_custodian TEXT DEFAULT '';

COMMENT ON COLUMN document_source.current_custodian IS
  'Employee code (or same value as employee_action_officer) of who holds the document in Outbox after routing.';

UPDATE document_source
SET current_custodian = COALESCE(NULLIF(TRIM(userid), ''), '')
WHERE current_custodian IS NULL OR TRIM(COALESCE(current_custodian, '')) = '';
