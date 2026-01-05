# Supabase Database Setup Guide

This guide will help you set up Supabase PostgreSQL database for the DOH Document Tracking System.

## Step 1: Create a Supabase Account and Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account (or sign in if you already have one)
3. Click "New Project"
4. Fill in the project details:
   - **Name**: `doh-document-tracking` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is sufficient for development

5. Wait for the project to be created (takes 1-2 minutes)

## Step 2: Get Database Connection Details

1. In your Supabase project dashboard, go to **Settings** (gear icon) → **Database**
2. Scroll down to **Connection string** section
3. You'll see different connection methods. We'll use the **URI** format

### Option A: Direct Connection (for development)
- Look for **Connection string** → **URI**
- It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
- Extract the following values:
  - **Host**: `db.xxxxx.supabase.co` (the part after `@` and before `:5432`)
  - **Port**: `5432`
  - **Database**: `postgres`
  - **User**: `postgres`
  - **Password**: The password you set when creating the project

### Option B: Connection Pooling (recommended for production)
- Use **Connection pooling** → **Session mode** or **Transaction mode**
- The host will be different: `db.xxxxx.supabase.co` (but use port `6543` for pooling)
- Note: Pooling is better for production but direct connection works fine for development

## Step 3: Configure Environment Variables

1. In the `backend` folder, copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Open `.env` file and fill in your Supabase credentials:
   ```env
   SECRET_KEY=your-django-secret-key-here
   DEBUG=True

   # Supabase Database Configuration
   SUPABASE_DB_NAME=postgres
   SUPABASE_DB_USER=postgres
   SUPABASE_DB_PASSWORD=your-actual-password-here
   SUPABASE_DB_HOST=db.xxxxx.supabase.co
   SUPABASE_DB_PORT=5432
   ```

   **Important**: Replace:
   - `your-django-secret-key-here` with a secure random string (you can generate one using Django's `python manage.py shell` and run `from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())`)
   - `your-actual-password-here` with the password you set when creating the Supabase project
   - `db.xxxxx.supabase.co` with your actual Supabase host

## Step 4: Install Dependencies

1. Make sure you're in the `backend` directory
2. Activate your virtual environment:
   ```bash
   # On Windows
   venv\Scripts\activate

   # On Mac/Linux
   source venv/bin/activate
   ```

3. Install the PostgreSQL adapter:
   ```bash
   pip install -r requirements.txt
   ```

   This will install `psycopg2-binary` which is needed to connect to PostgreSQL.

## Step 5: Test Database Connection

1. Run Django migrations to create the database schema:
   ```bash
   python manage.py migrate
   ```

2. If successful, you should see output like:
   ```
   Operations to perform:
     Apply all migrations: admin, auth, contenttypes, sessions, ...
   Running migrations:
     ...
   ```

3. If you get connection errors, double-check your `.env` file credentials.

## Step 6: Create a Superuser (Optional)

Create an admin user to access Django admin panel:
```bash
python manage.py createsuperuser
```

## Troubleshooting

### Connection Error: "could not connect to server"
- Check if your IP is allowed in Supabase
- Go to **Settings** → **Database** → **Connection Pooling** → **Allowed IPs**
- For development, you can add `0.0.0.0/0` (allows all IPs - only for development!)

### SSL Connection Error
- Supabase requires SSL connections
- The settings are already configured with `'sslmode': 'require'`
- If you still get SSL errors, make sure `psycopg2-binary` is installed

### Password Authentication Failed
- Double-check your password in the `.env` file
- Make sure there are no extra spaces or quotes
- The password is case-sensitive

### Database Does Not Exist
- The default database name is `postgres`
- Make sure `SUPABASE_DB_NAME=postgres` in your `.env` file

## Security Notes

⚠️ **Important Security Reminders:**
- Never commit your `.env` file to Git (it's already in `.gitignore`)
- Use strong passwords for your database
- In production, use connection pooling and restrict IP access
- Rotate your database password regularly
- Keep your `SECRET_KEY` secure and never share it

## Next Steps

Once your database is connected:
1. Create your Django models in `api/models.py`
2. Run `python manage.py makemigrations`
3. Run `python manage.py migrate`
4. Start building your API endpoints!

For more information, visit:
- [Supabase Documentation](https://supabase.com/docs)
- [Django Database Documentation](https://docs.djangoproject.com/en/4.2/topics/db/)

