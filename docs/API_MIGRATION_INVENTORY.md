# Django + Supabase → Laravel + MySQL — API inventory & cutover checklist

The React app calls **`/api/...`** (see `frontend/src/services/api.ts` and `frontend/vite.config.ts` proxy to `http://localhost:8000`). **URLs, JSON shapes, and `success` wrappers must stay compatible** so the UI does not change.

## Response contract (all endpoints)

- Success: `{ "success": true, "data": ... }` or `{ "success": true, "user": ... }` (auth).
- Error: `{ "success": false, "error": "..." }` with appropriate HTTP status.
- Reference tables return **snake_case** fields as stored in the DB (e.g. `action_required`, `employee_code`), matching current Supabase responses.
- Document / inbox responses use **camelCase** keys (see Django `_row_to_camel`).

## Headers used by the frontend

| Header | Used on |
|--------|---------|
| `X-Employee-Code` | `document-source` (scoped list, updates, deletes, trash, uploads), `inbox`, attachment URL |

Optional query fallback: `employee_code` (attachment URL).

## Endpoint map (Django `backend/api/urls.py` → Laravel)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/health/` | Health check |
| POST | `/api/auth/login/` | Body: `employeeCode`, `password` |
| POST | `/api/auth/register/` | Body: registration fields; password hashed |
| GET | `/api/users/` | Combined `users` + `profiles` style rows |
| PUT | `/api/users/{id}/` | `id` int (users) or UUID string (profiles) |
| GET/POST/PUT/DELETE | `/api/action-required/` … | List, create, update, delete, bulk-delete |
| … | `/api/action-officer/` … | Same pattern |
| … | `/api/action-taken/` … | Same |
| … | `/api/document-type/` … | Includes `sync-display-name` POST |
| … | `/api/document-action-required-days/` … | |
| … | `/api/office/` … | |
| … | `/api/region/` … | |
| … | `/api/user-levels/` … | |
| GET | `/api/document-source/?trash=1` | Trash list |
| POST | `/api/document-source/create/` | Creates row; server should set `document_control_no` / `route_no` if DB used to |
| PUT | `/api/document-source/{id}/` | Partial camelCase update |
| DELETE | `/api/document-source/{id}/delete/` | Soft delete |
| DELETE | `/api/document-source/bulk-delete/` | Body: `{ "ids": [] }` |
| POST | `/api/document-source/{id}/restore/` | |
| POST | `/api/document-source/bulk-restore/` | |
| DELETE | `/api/document-source/{id}/permanent/` | Only if in trash |
| POST | `/api/document-source/bulk-permanent-delete/` | |
| POST | `/api/document-source/upload-attachment/` | Multipart: `file`, `documentId` |
| GET | `/api/document-source/{id}/attachment-url/` | Returns `{ success, url }` — local Laravel should return a **download URL** (not Supabase signed URL) |
| POST | `/api/document-source/purge-expired-trash/` | Optional; secured by `X-Trash-Purge-Secret` in Django |
| GET | `/api/inbox/` | Requires `X-Employee-Code`; returns `{ inboxType, destination?, document }` |
| GET | `/api/document-destination/?document_source_id=` | |
| POST | `/api/document-destination/create/` | Triggers custodian recompute |
| PUT | `/api/document-destination/{id}/` | Merge update; recompute custodian |

## Behaviour to preserve

1. **Login**: `users` table first (hashed password; Django `pbkdf2_sha256$…` or legacy plaintext upgrade). Fallback: `profiles` + email auth was Supabase-specific — Laravel drop-in implements **users + optional profiles** without Supabase Auth email login unless you add it.
2. **`current_custodian`**: Recomputed from destinations (latest received step) or creator `userid`.
3. **Identity matching**: `employee_action_officer` and originating fields may be `Name (CODE)`; match logic uses code substring and name candidates (see Django `_employee_identity_matches`, `_build_employee_match_candidates`).
4. **Attachments**: Store files on disk under `storage/app/...`; `attachment_list` holds relative path; `attachment-url` returns an HTTP URL the browser can open.

## Database

- Import or migrate schema to **MySQL/MariaDB** (XAMPP). The Laravel drop-in includes migrations mirroring the main tables.
- **Data migration** from Supabase/Postgres: export CSV → transform column names → import (separate one-off script).

## Frontend changes (optional)

- **None required** if Laravel listens on **port 8000** and Vite proxy stays pointed at `http://localhost:8000`.
- Production: set `API_BASE_URL` or reverse proxy so `/api` hits Laravel.

## Laravel drop-in (this repo)

Implementation files and setup steps live in [`laravel-api/README.md`](../laravel-api/README.md) (copy into a Composer-generated Laravel project, then migrate MySQL).

## Quick verification

1. `GET /api/health/` → `200`, `{ "status": "healthy", "message": "..." }` (matches the old Django health payload)
2. Register + login → same `user` shape as before (`employeeCode`, `firstName`, …).
3. Create document → `documentControlNo` populated; Outbox list shows row.
4. Add destination → Inbox shows row for action officer; record receipt → custodian updates.
