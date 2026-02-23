-- Run in Supabase Dashboard → SQL Editor
-- Creates profiles table for Supabase Auth integration and trigger to auto-create profile on signup.
--
-- Prerequisites:
-- 1. In Supabase Dashboard → Authentication → Providers, enable "Email" (and optionally "Confirm email" off for dev).
-- 2. After running this script, new signups will get a row in public.profiles from their auth metadata.

-- Table: stores user profile (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  employee_code TEXT,
  office TEXT,
  user_level TEXT,
  office_representative TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Service role can do anything (backend/admin)
CREATE POLICY "Service role full access to profiles"
  ON public.profiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger: create profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, employee_code, office, user_level, office_representative)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'employee_code', ''),
    COALESCE(NEW.raw_user_meta_data->>'office', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_level', ''),
    COALESCE(NEW.raw_user_meta_data->>'office_representative', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if present (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON TABLE public.profiles IS 'User profiles linked to Supabase Auth (auth.users)';
