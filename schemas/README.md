# Schema scripts for Supabase

## Document Source (Outbox)

- **New database:** Run `CREATE_DOCUMENT_SOURCE_AND_DESTINATION_TABLES.sql` (or `CREATE_DOCUMENT_SOURCE_TABLE.sql` for document_source only) in **Supabase Dashboard → SQL Editor**.
- **Existing database (table already has old columns):** Run **`ALTER_DOCUMENT_SOURCE_SYNC_SCHEMA.sql`** in Supabase to update the `document_source` table:
  - Drops **unused columns**: `office_control_no`, `office_no`, and **reference document no.** (`reference_document_control_no_1` through `reference_document_control_no_5`), and their indexes where applicable.
  - Recreates the insert trigger so only `document_control_no` and `route_no` are auto-generated.
  - You can add more `DROP COLUMN IF EXISTS <name>;` lines in the script for any other legacy columns.

After running the ALTER script, `document_source` matches the current app schema (no unused columns).

## Document Destination

- **Existing table with duplicate Route No.:** Run **`ALTER_DOCUMENT_DESTINATION_UNIQUE_ROUTE_NO.sql`** to make Route No. unique (like a primary key).
- **Sequential Route No. (R2026-000000001, R2026-000000002, …):** Run **`ALTER_DOCUMENT_DESTINATION_ROUTE_NO_SEQUENCE.sql`** to add a sequence and trigger so new rows get a sequential number when `route_no` is sent empty.

## Trash auto-purge (30-day retention)

Documents in Trash are **permanently removed** after **30 days** (configurable) using one of:

1. **Django (recommended):** On the server that runs the backend, schedule daily:
   ```bash
   python manage.py purge_trash
   ```
   Optional: `TRASH_RETENTION_DAYS=30` in `.env` (default 30).

2. **HTTP (optional):** `POST /api/document-source/purge-expired-trash/` with header `X-Trash-Purge-Secret: <value>` matching `TRASH_PURGE_SECRET` in `.env`. Requires `TRASH_PURGE_SECRET` to be set.

3. **Supabase only:** Run **`purge_expired_trash.sql`** in SQL Editor to create `purge_expired_trash(days)`. Optionally schedule with **`pg_cron`** (see comments in that file).
