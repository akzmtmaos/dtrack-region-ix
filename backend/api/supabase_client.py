"""
Supabase client configuration for Django backend
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Get Supabase credentials from environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Lazy initialization - clients are created when needed, not at import time
_supabase_admin: Client | None = None

def get_supabase_client() -> Client:
    """
    Get the public Supabase client instance
    Use this for client-side operations that respect Row Level Security (RLS)
    Note: Currently not used, but kept for future use
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Supabase client not initialized. Check SUPABASE_URL and SUPABASE_KEY in .env file")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def get_supabase_admin_client() -> Client:
    """
    Get the admin Supabase client instance
    Use this for server-side operations that bypass Row Level Security (RLS)
    """
    global _supabase_admin
    
    if _supabase_admin is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError(
                "Supabase admin client not initialized. "
                "Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file"
            )
        try:
            _supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        except Exception as e:
            raise ValueError(
                f"Failed to create Supabase admin client: {str(e)}. "
                "Please check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file"
            )
    
    return _supabase_admin
