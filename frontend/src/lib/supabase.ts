/**
 * Supabase client for the browser (Auth + optional data).
 * Uses anon key so RLS applies. Set in .env:
 *   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
 *   VITE_SUPABASE_ANON_KEY=your_anon_key
 */
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn(
    'Supabase env missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env for auth.'
  )
}

export const supabase = url && anonKey ? createClient(url, anonKey) : null

export type SupabaseClient = ReturnType<typeof createClient>
