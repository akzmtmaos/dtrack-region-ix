-- SQL script to create the users table in Supabase
-- Run this in Supabase Dashboard → SQL Editor
-- This table stores registered user accounts (login/register); separate from action_officer reference table.

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  employee_code TEXT NOT NULL,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  middle_name TEXT NOT NULL,
  office TEXT,
  user_password TEXT NOT NULL,
  user_level TEXT NOT NULL,
  office_representative TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_users_employee_code UNIQUE (employee_code)
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS 'Registered user accounts for login; admin must set verified=true before user can sign in';
COMMENT ON COLUMN users.employee_code IS 'Unique employee identification code';
COMMENT ON COLUMN users.verified IS 'If false, user cannot log in until an admin approves';

CREATE INDEX IF NOT EXISTS idx_users_employee_code ON users(employee_code);
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(verified);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for service role" ON users
FOR ALL
USING (true)
WITH CHECK (true);
