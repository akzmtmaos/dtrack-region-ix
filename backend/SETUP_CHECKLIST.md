# Setup Checklist - Supabase Integration

## ✅ Step 1: Create .env File

1. In the `backend` folder, create a `.env` file:
   ```bash
   cd backend
   copy env.example .env
   ```

2. Open `.env` and fill in these values:

```env
# Django Settings
SECRET_KEY=n+acl$tJrVjISM^XvnMB!)ED-QP0Bgkg*Rd7Q$^47ZIG(mGl_#
DEBUG=True

# Supabase PostgreSQL Database Configuration
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-database-password-here
SUPABASE_DB_HOST=db.yokigcwsfnuwdkmwzngu.supabase.co
SUPABASE_DB_PORT=5432

# Supabase API Configuration
SUPABASE_URL=https://yokigcwsfnuwdkmwzngu.supabase.co
SUPABASE_KEY=sb_publishable_sRvjy1_omz5Jj0802Q6eFA_aYpKskcH
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlva2lnY3dzZm51d2RrbXd6bmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwNzMwMSwiZXhwIjoyMDgzMzgzMzAxfQ.LOxEGB5Hj9hqe_2Ctd3VS8P0cvp373Mi7MNdet6bE9k
```

**⚠️ Important**: Replace `your-database-password-here` with your actual Supabase database password (the one you set when creating the project).

## ✅ Step 2: Get Your Database Password

If you forgot your database password:
1. Go to: https://supabase.com/dashboard/project/yokigcwsfnuwdkmwzngu
2. Click **Settings** (gear icon) → **Database**
3. Scroll down to **Database Password**
4. Click **Reset Database Password** if needed
5. Copy the password and paste it in `.env` as `SUPABASE_DB_PASSWORD`

## ✅ Step 3: Create the Table in Supabase

1. Go to: https://supabase.com/dashboard/project/yokigcwsfnuwdkmwzngu
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the SQL from `backend/CREATE_TABLE.sql`
5. Click **Run** (or press Ctrl+Enter)

**OR** create it manually:
- Go to **Table Editor** → **New Table**
- Name: `action_required`
- Add columns:
  - `id` (bigint, primary key, auto-increment)
  - `action_required` (text, not null)
  - `created_at` (timestamp, default: now())
  - `updated_at` (timestamp, default: now())

## ✅ Step 4: Install Dependencies

```bash
cd backend
venv\Scripts\activate  # Windows
pip install supabase==2.8.0
```

## ✅ Step 5: Test the Setup

1. Start Django server:
   ```bash
   python manage.py runserver
   ```

2. Test the API:
   - Open: http://localhost:8000/api/health/
   - Should see: `{"status":"healthy","message":"DOH Document Tracking System API is running"}`

3. Test Action Required endpoint:
   - Open: http://localhost:8000/api/action-required/
   - Should see: `{"success":true,"data":[]}` (empty array if no data yet)

## ✅ Step 6: Test Frontend Connection

1. Make sure backend is running on `http://localhost:8000`
2. Start frontend:
   ```bash
   cd frontend
   npm start
   ```
3. Navigate to: http://localhost:3000/reference-tables/action-required
4. Click "Add" button and create a test item
5. It should save to Supabase!

## 🎉 You're Done!

Your application is now fully connected to Supabase!
