# Supabase Integration Setup Complete

This document provides the complete setup instructions for integrating Supabase with your DOH Document Tracking System.

## ✅ What Has Been Set Up

1. **Supabase Python Client**: Added `supabase==2.8.0` to `requirements.txt`
2. **Supabase Client Configuration**: Created `backend/api/supabase_client.py`
3. **Action Required API Endpoints**: Created `backend/api/views/action_required.py`
4. **URL Routing**: Updated `backend/api/urls.py` with action required endpoints

## 📋 Next Steps to Complete Setup

### Step 1: Create `.env` File

1. In the `backend` folder, create a `.env` file (copy from `env.example`):
   ```bash
   cp env.example .env
   ```

2. Open `.env` and add your Supabase credentials:

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
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

   **Important**: You need to get these values:
   - `SUPABASE_DB_PASSWORD`: The database password you set when creating the project
   - `SUPABASE_SERVICE_ROLE_KEY`: Get this from Supabase Dashboard → Project Settings → API → Service Role Key (secret)

### Step 2: Get Your Supabase Service Role Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/yokigcwsfnuwdkmwzngu
2. Click on **Settings** (gear icon) → **API**
3. Scroll down to **Project API keys**
4. Copy the **`service_role`** key (this is secret - never expose it publicly!)
5. Paste it in your `.env` file as `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Create the Action Required Table in Supabase

1. Go to your Supabase Dashboard → **Table Editor**
2. Click **New Table**
3. Table name: `action_required`
4. Add the following columns:

   | Column Name | Type | Default | Nullable |
   |------------|------|---------|----------|
   | id | int8 | auto increment | NO (Primary Key) |
   | action_required | text | - | NO |
   | created_at | timestamp | now() | YES |
   | updated_at | timestamp | now() | YES |

5. Click **Save** to create the table

   **Alternative: Using SQL Editor**
   
   You can also create the table using SQL:
   ```sql
   CREATE TABLE action_required (
     id BIGSERIAL PRIMARY KEY,
     action_required TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create updated_at trigger
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
       NEW.updated_at = NOW();
       RETURN NEW;
   END;
   $$ language 'plpgsql';

   CREATE TRIGGER update_action_required_updated_at 
   BEFORE UPDATE ON action_required 
   FOR EACH ROW 
   EXECUTE FUNCTION update_updated_at_column();
   ```

### Step 4: Install Python Dependencies

1. Make sure you're in the `backend` directory
2. Activate your virtual environment:
   ```bash
   # On Windows
   venv\Scripts\activate
   
   # On Mac/Linux
   source venv/bin/activate
   ```

3. Install the Supabase package:
   ```bash
   pip install supabase==2.8.0
   ```

   Or install all requirements:
   ```bash
   pip install -r requirements.txt
   ```

### Step 5: Test the API Endpoints

1. Start your Django server:
   ```bash
   python manage.py runserver
   ```

2. Test the endpoints using curl or Postman:

   **Get all action required items:**
   ```bash
   curl http://localhost:8000/api/action-required/
   ```

   **Create a new action required item:**
   ```bash
   curl -X POST http://localhost:8000/api/action-required/create/ \
     -H "Content-Type: application/json" \
     -d '{"actionRequired": "Review Document"}'
   ```

   **Update an action required item:**
   ```bash
   curl -X PUT http://localhost:8000/api/action-required/1/ \
     -H "Content-Type: application/json" \
     -d '{"actionRequired": "Updated Action"}'
   ```

   **Delete an action required item:**
   ```bash
   curl -X DELETE http://localhost:8000/api/action-required/1/delete/
   ```

   **Bulk delete:**
   ```bash
   curl -X DELETE http://localhost:8000/api/action-required/bulk-delete/ \
     -H "Content-Type: application/json" \
     -d '{"ids": [1, 2, 3]}'
   ```

## 🔌 API Endpoints Available

### Action Required

- **GET** `/api/action-required/` - Get all action required items
- **POST** `/api/action-required/create/` - Create a new item
  ```json
  {
    "actionRequired": "Review Document"
  }
  ```
- **PUT/PATCH** `/api/action-required/<id>/` - Update an item
  ```json
  {
    "actionRequired": "Updated Action"
  }
  ```
- **DELETE** `/api/action-required/<id>/delete/` - Delete an item
- **DELETE** `/api/action-required/bulk-delete/` - Delete multiple items
  ```json
  {
    "ids": [1, 2, 3]
  }
  ```

## 🔒 Security Notes

⚠️ **Important**:
- Never commit your `.env` file to Git (it should be in `.gitignore`)
- The `service_role` key bypasses Row Level Security (RLS) - keep it secret!
- In production, use Row Level Security (RLS) policies in Supabase
- Consider using environment variables in production (Heroku Config Vars, AWS Secrets Manager, etc.)

## 🐛 Troubleshooting

### Error: "Supabase client not initialized"
- Check that `SUPABASE_URL` and `SUPABASE_KEY` are set in your `.env` file
- Make sure there are no extra spaces or quotes in the values

### Error: "relation 'action_required' does not exist"
- The table hasn't been created in Supabase yet
- Follow Step 3 above to create the table

### Error: "permission denied for table action_required"
- Check your `SUPABASE_SERVICE_ROLE_KEY` is correct
- Make sure you're using the service role key, not the anon key

### Error: "could not connect to server"
- Check your database connection settings in `.env`
- Verify your IP is allowed in Supabase (Settings → Database → Connection Pooling → Allowed IPs)

## 📚 Additional Resources

- [Supabase Python Client Documentation](https://github.com/supabase/supabase-py)
- [Supabase REST API Documentation](https://supabase.com/docs/reference/python/introduction)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## ✅ Next Steps

1. Update the frontend to connect to these API endpoints
2. Create more tables and endpoints as needed (documents, users, etc.)
3. Implement authentication using Supabase Auth
4. Set up Row Level Security policies in Supabase for production
