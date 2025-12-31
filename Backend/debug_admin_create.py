
import os
import sys
from dotenv import load_dotenv
from supabase import create_client
import random
import string

# Load env
load_dotenv(".env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

print(f"URL: {url}")
# Mask key for security but show first/last chars
masked_key = f"{key[:5]}...{key[-5:]}" if key and len(key) > 10 else "None"
print(f"Key (Service Role): {masked_key}")

if not url or not key:
    print("Error: Missing env vars")
    exit(1)

supabase = create_client(url, key)

# Generate random email with institute domain
rand_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
email = f"test_debug_{rand_suffix}@students.iitmandi.ac.in"
password = "TestPassword123!"

print(f"Attempting to create user: {email}")

try:
    # Attempt 1: admin.create_user
    print("--- Testing supabase.auth.admin.create_user ---")
    attributes = {
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {"full_name": "Test Admin User"}
    }
    
    # Check if admin attribute exists
    if not hasattr(supabase.auth, "admin"):
         print("Error: 'supabase.auth' object has no 'admin' attribute. Check supabase-py version or client init.")
    else:
         user_resp = supabase.auth.admin.create_user(attributes)
         print(f"Success! User ID: {user_resp.user.id}")
         
         # Clean up
         print("Cleaning up (deleting user)...")
         supabase.auth.admin.delete_user(user_resp.user.id)
         print("Deleted.")

except Exception as e:
    print(f"FAILED: {e}")
    if "User not allowed" in str(e):
        print("\nDIAGNOSIS: 'User not allowed' usually means Signups are disabled and you are NOT using the Service Role Key.")
        print("Please verify that SUPABASE_SERVICE_ROLE_KEY in .env is actually the 'service_role' secret, not the 'anon' key.")
