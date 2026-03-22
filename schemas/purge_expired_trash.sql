-- Optional: purge Trash in the database (soft-deleted rows older than N days).
-- The Django app also implements this via `python manage.py purge_trash` (recommended if you use the Python API).
--
-- Prerequisites:
--   - `document_source.deleted_at` exists (see ../backend/sql/add_document_source_deleted_at.sql)
--   - `document_destination.document_source_id` references `document_source(id)` ON DELETE CASCADE
--     so deleting a source row removes destination rows automatically.
--
-- Supabase: enable extension `pg_cron` under Database → Extensions if you want scheduled runs.

CREATE OR REPLACE FUNCTION public.purge_expired_trash(p_days int DEFAULT 30)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH deleted AS (
    DELETE FROM public.document_source
    WHERE deleted_at IS NOT NULL
      AND deleted_at < (timezone('utc', now()) - (interval '1 day' * p_days))
    RETURNING id
  )
  SELECT COALESCE((SELECT COUNT(*)::bigint FROM deleted), 0::bigint);
$$;

COMMENT ON FUNCTION public.purge_expired_trash(int) IS
  'Permanently deletes document_source rows in Trash (deleted_at set) older than p_days.';

-- Example: run manually
-- SELECT public.purge_expired_trash(30);

-- Example: schedule daily at 03:00 UTC (requires pg_cron)
-- SELECT cron.schedule(
--   'purge-expired-trash-daily',
--   '0 3 * * *',
--   $$SELECT public.purge_expired_trash(30);$$
-- );
