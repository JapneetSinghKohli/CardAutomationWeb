
import os
import django
from django.conf import settings
# Setup Django (if needed, but we can just import supabase client directly if independent)

# But I need the supabase client from the project
import sys
sys.path.append('.') # Add current dir to path

# Manually setup supabase client since I can't import from dashboard without django setup potentially
from supabase import create_client

# I'll just read env vars directly to keep it simple
from dotenv import load_dotenv
load_dotenv(".env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: Missing env vars")
    exit(1)

supabase = create_client(url, key)

email = "test_reset@example.com"
print(f"Attempting to reset password for {email}...")

try:
    # Try the method used in views.py
    # Note: older lib might use reset_password_for_email, newer reset_password_email
    # I'll check attributes
    if hasattr(supabase.auth, "reset_password_for_email"):
        print("Using reset_password_for_email")
        res = supabase.auth.reset_password_for_email(email, {"redirect_to": "http://localhost:5173/reset-password"})
    elif hasattr(supabase.auth, "reset_password_email"):
        print("Using reset_password_email")
        res = supabase.auth.reset_password_email(email, {"redirect_to": "http://localhost:5173/reset-password"})
    else:
        print("Error: No reset method found on auth")
        exit(1)
        
    print("Success:", res)

except Exception as e:
    print("Error:", str(e))
    # Print type
    print("Error Type:", type(e))
