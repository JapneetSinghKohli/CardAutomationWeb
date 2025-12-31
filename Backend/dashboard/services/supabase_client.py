import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv() # Load from .env file

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY:
    print("CRITICAL WARNING: SUPABASE_SERVICE_ROLE_KEY is missing!")
else:
    print(f"DEBUG: Supabase Client Initialized with Key: {SUPABASE_KEY[:5]}...")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
