# Environment Variables Setup

## Quick Setup

1. Copy the example file:
   ```bash
   cp env.example .env
   ```

2. Open `.env` and fill in the values below:

```env
# Django Settings
SECRET_KEY=your-django-secret-key-here
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

## Important Notes

⚠️ **Security**: 
- The `.env` file is in `.gitignore` and will NOT be committed to Git
- Never share your service role key publicly
- The service role key bypasses Row Level Security - keep it secret!

## What You Still Need

1. **SECRET_KEY**: Generate a Django secret key:
   ```bash
   python manage.py shell
   ```
   Then run:
   ```python
   from django.core.management.utils import get_random_secret_key
   print(get_random_secret_key())
   ```

2. **SUPABASE_DB_PASSWORD**: The database password you set when creating the Supabase project. If you forgot it, you can reset it in Supabase Dashboard → Settings → Database → Reset Database Password.
