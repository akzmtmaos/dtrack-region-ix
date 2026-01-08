# Quick Start Guide - Supabase Integration

## ✅ Step 1: Create .env File

In the `backend` folder, create a `.env` file by copying the example:

```bash
cd backend
cp env.example .env
```

The `.env` file is already configured with your Supabase credentials. You just need to:

1. **Generate a Django SECRET_KEY**:
   ```bash
   python manage.py shell
   ```
   Then run:
   ```python
   from django.core.management.utils import get_random_secret_key
   print(get_random_secret_key())
   ```
   Copy the output and replace `your-secret-key-here` in `.env`

2. **Add your Database Password**:
   - This is the password you set when creating the Supabase project
   - If you forgot it, reset it in: Supabase Dashboard → Settings → Database → Reset Database Password
   - Replace `your-database-password-here` in `.env`

## ✅ Step 2: Create the Table in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/yokigcwsfnuwdkmwzngu
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `CREATE_TABLE.sql` file
5. Click **Run** (or press Ctrl+Enter)

Alternatively, you can create it manually:
- Go to **Table Editor** → **New Table**
- Name: `action_required`
- Add columns:
  - `id` (bigint, primary key, auto-increment)
  - `action_required` (text, not null)
  - `created_at` (timestamp, default: now())
  - `updated_at` (timestamp, default: now())

## ✅ Step 3: Install Dependencies

```bash
# Make sure you're in the backend directory
cd backend

# Activate virtual environment
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Mac/Linux

# Install Supabase package
pip install supabase==2.8.0
```

## ✅ Step 4: Test the Setup

1. Start the Django server:
   ```bash
   python manage.py runserver
   ```

2. Test the health endpoint:
   ```bash
   curl http://localhost:8000/api/health/
   ```

3. Test the action required endpoint:
   ```bash
   curl http://localhost:8000/api/action-required/
   ```

## 🎉 You're Ready!

Your backend is now connected to Supabase! The API endpoints are ready to use:

- `GET /api/action-required/` - List all items
- `POST /api/action-required/create/` - Create new item
- `PUT /api/action-required/<id>/` - Update item
- `DELETE /api/action-required/<id>/delete/` - Delete item
- `DELETE /api/action-required/bulk-delete/` - Delete multiple items

## 🔗 Next: Connect Frontend

The frontend can now connect to these endpoints. The API base URL is: `http://localhost:8000/api/`
