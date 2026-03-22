# Supabase SQL migrations

Run these in **Supabase Dashboard → SQL Editor → New query** (or `psql`), in any order unless noted.

| File | Purpose |
|------|---------|
| `add_document_source_deleted_at.sql` | Soft-delete / Trash column |
| `add_document_source_current_custodian.sql` | **Required** for routing / Outbox custody (`current_custodian`) |

If you see: `column document_source.current_custodian does not exist` — run `add_document_source_current_custodian.sql`.

After running, confirm with:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'document_source' AND column_name = 'current_custodian';
```

You should get one row.
