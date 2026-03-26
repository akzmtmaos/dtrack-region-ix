# DOH Document Tracking — Laravel API (`backend/`)

This directory is the **full** Laravel application (Composer, `vendor/`, `artisan`). Requires **PHP 8.2+**, **Composer**, and **MySQL** (e.g. XAMPP).

## Quick start

From the repository root:

```bash
cd backend
composer install
```

Configure MySQL in `.env`, then:

```bash
php artisan migrate
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

Keep **`frontend/vite.config.ts`** proxy target `http://localhost:8000`.

### Laravel 11+: `routes/api.php` must be registered

`bootstrap/app.php` should include `api` in `withRouting(...)` so `/api/...` is not 404:

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
```

### Migrations vs stock Laravel

If you ever scaffold a fresh Laravel app and merge this repo’s `app/`, `routes/api.php`, and `database/migrations/` only, remove or avoid default Laravel migrations that conflict with `users` / sessions / cache before migrating, or use `migrate:fresh` only on a throwaway database.

## MySQL (XAMPP)

Example `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=doh_tracking
DB_USERNAME=root
DB_PASSWORD=
```

## CORS (Vite on :3000)

If the SPA calls Laravel directly (not only via the Vite proxy), publish CORS config and allow `http://localhost:3000` for `GET, POST, PUT, DELETE, OPTIONS`:

```bash
php artisan config:publish cors
```

## Passwords migrated from Django

User passwords stored as Django `pbkdf2_sha256$...` are verified by `App\Support\DjangoPassword`. New passwords use Laravel `Hash` (bcrypt). Legacy plaintext in DB is still accepted once and should be replaced on login.

## Attachments

Files live under `storage/app/document-attachments/`. The API serves downloads via `/api/document-source/{id}/attachment-file`.

## Optional: trash purge cron

The old stack used `X-Trash-Purge-Secret`. Reimplement in Laravel env or `php artisan schedule:run` if needed.
