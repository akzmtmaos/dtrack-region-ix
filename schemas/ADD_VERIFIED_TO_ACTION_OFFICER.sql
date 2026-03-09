-- Add verified column to action_officer for admin approval flow.
-- New registrations get verified = false; user cannot log in until admin sets verified = true.
-- Run in Supabase Dashboard → SQL Editor

-- New registrations will set verified = false in the app. Default true so existing rows stay able to log in.
ALTER TABLE action_officer
ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN action_officer.verified IS 'If false, user cannot log in until an admin approves (sets to true).';
