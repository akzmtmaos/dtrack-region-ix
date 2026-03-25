# Laravel API (drop-in) — DOH Document Tracking

This folder is **not** a full Composer install. On a machine with **PHP 8.2+** and **Composer**:

## 1. Create a fresh Laravel 11 app (next to or inside this repo)

```bash
cd c:\Users\ACER\Desktop\doh-document-tracking-system
composer create-project laravel/laravel laravel-api-tmp
```

## 2. Copy drop-in files over the new project

Copy **from** `laravel-api/` **into** `laravel-api-tmp/` (merge/replace):

- `app/` → merge into `app/` (overwrite `app/Models/User.php` if Laravel created a default `User` model you are not using)
- `routes/api.php` → replace `routes/api.php`
- `database/migrations/` → copy migrations into `database/migrations/`

### 2c. Register `routes/api.php` (Laravel 11+)

Fresh Laravel’s `bootstrap/app.php` often **does not** load `routes/api.php` by default (only `web` and `console`). Add the `api` line inside `withRouting(...)`:

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
```

Without this, `php artisan route:list --path=api` shows nothing and `/api/...` returns **404**.

### 2b. Avoid duplicate `users` / session migrations

A fresh Laravel app ships with default migrations (e.g. `0001_01_01_000000_create_users_table.php`) that **conflict** with this project’s `users` table. Before `php artisan migrate`:

- Remove or rename the stock Laravel migrations that create `users`, `password_reset_tokens`, `sessions`, and `cache` tables **if** they collide with our schema, **or**
- Run migrations only after deleting those files and rely on `2025_03_25_000000_doh_tracking_tables.php` for core tables.

Use `php artisan migrate:fresh` only on a **throwaway** database.

## 3. MySQL (XAMPP)

Create database `doh_tracking` (or any name). In `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=doh_tracking
DB_USERNAME=root
DB_PASSWORD=
```

## 4. Install & migrate

```bash
cd laravel-api-tmp
composer install
php artisan migrate
php artisan storage:link
```

## 5. CORS (Vite on :3000)

Publish and edit CORS config if the SPA calls Laravel directly (not only via Vite proxy):

```bash
php artisan config:publish cors
```

Allow `http://localhost:3000` for `GET, POST, PUT, DELETE, OPTIONS`.

## 6. Run API on port 8000 (matches existing Vite proxy)

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

Keep **`frontend/vite.config.ts`** proxy target `http://localhost:8000`.

## 7. Passwords migrated from Django

User passwords stored as Django `pbkdf2_sha256$...` are verified by `App\Support\DjangoPassword`. New passwords use Laravel `Hash` (bcrypt). Legacy plaintext in DB is still accepted once and should be replaced on login.

## 8. Attachments

Files are stored under `storage/app/document-attachments/`. The API returns download URLs pointing to `/api/document-source/{id}/attachment-file`.

## 9. Optional: trash purge cron

Django used `X-Trash-Purge-Secret`. Implement the same env in Laravel or use `php artisan schedule:run` with a command (stub can be added later).
