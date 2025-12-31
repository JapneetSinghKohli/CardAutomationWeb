
import os
import sys
from dotenv import load_dotenv
from supabase import create_client
from pathlib import Path

# Load env safely
BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / '.env'
load_dotenv(dotenv_path=ENV_PATH, override=True)

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    exit(1)

supabase = create_client(url, key)

# Data to create
CLUB_NAME = "Robotics"
USER_NAME = "Nishant"
USER_EMAIL = "b24207@students.iitmandi.ac.in" # Corrected typo 'studnets' -> 'students'
USER_PASS = "nitin@098"

print(f"--- Seeding Data ---")
print(f"Club: {CLUB_NAME}")
print(f"User: {USER_NAME} ({USER_EMAIL})")

# 1. Create Club
print(f"1. Checking Club '{CLUB_NAME}'...")
club_resp = supabase.table("clubs").select("*").eq("club_name", CLUB_NAME).execute()
if club_resp.data:
    club_id = club_resp.data[0]["club_id"]
    print(f"   Club exists with ID: {club_id}")
else:
    print(f"   Creating Club...")
    new_club = supabase.table("clubs").insert({"club_name": CLUB_NAME}).execute()
    club_id = new_club.data[0]["club_id"]
    print(f"   Created Club ID: {club_id}")

# 2. Creates Auth User
print(f"2. Creating Auth User '{USER_EMAIL}'...")
# Check if exists first (by list users? Admins can do that)
# Or just try to create and catch error
try:
    auth_resp = supabase.auth.admin.create_user({
        "email": USER_EMAIL,
        "password": USER_PASS,
        "email_confirm": True
    })
    user_id = auth_resp.user.id
    print(f"   Created Auth User ID: {user_id}")
except Exception as e:
    if "already registered" in str(e) or "already exists" in str(e):
        print("   User already exists. Attempting to fetch ID...")
        # Since we are admin, we can't easily 'get user by email' without a specific function depending on library version
        # Try getting list
        users = supabase.auth.admin.list_users()
        found = next((u for u in users if u.email == USER_EMAIL), None)
        if found:
            user_id = found.id
            print(f"   Found existing User ID: {user_id}")
        else:
             print("   Could not find existing user ID. Exiting.")
             exit(1)
    else:
        print(f"   Error creating user: {e}")
        exit(1)

# 3. Add to app_users
print(f"3. Updating 'app_users'...")
# Upsert to ensure name is set
try:
    supabase.table("app_users").upsert({
        "user_id": user_id,
        "name": USER_NAME,
        "email": USER_EMAIL
    }).execute()
    print("   Upserted app_user.")
except Exception as e:
    print(f"   Error upserting app_user: {e}")

# 4. Assign Role
print(f"4. Assigning Role 'Coordinator'...")
try:
    # Check existing role
    role_resp = supabase.table("user_club_roles").select("*").eq("user_id", user_id).eq("club_id", club_id).execute()
    if not role_resp.data:
        supabase.table("user_club_roles").insert({
            "user_id": user_id,
            "club_id": club_id,
            "role": "Coordinator"
        }).execute()
        print("   Role assigned.")
    else:
        print("   Role already assigned.")
except Exception as e:
    print(f"   Error assigning role: {e}")

print("--- Seeding Complete ---")
print(f"You can now login as {USER_EMAIL}")
