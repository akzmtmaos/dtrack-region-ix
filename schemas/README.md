# MySQL schema (Laravel + XAMPP)

This folder contains SQL schema files for the current Laravel-based setup.

## Files

- `01_core_tables.sql` - Main tables used by the app
- `02_audit_logs.sql` - Audit trail table
- `03_seed_admin_account.sql` - Bootstrap **ADMIN** user (verified) for Laravel login after a fresh DB; re-run safe (upserts on `employee_code`). See file header for default password — **change it after first login** in production.

## Notes

- These scripts reflect the current Laravel migration structure.
- Recommended source of truth remains Laravel migrations in:
  - `backend/database/migrations/`
- If schema changes later, update the migration first, then refresh these SQL files.
