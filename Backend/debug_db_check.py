
import os
import sys
from dotenv import load_dotenv
from supabase import create_client
from pathlib import Path

# Load env
BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / '.env'
load_dotenv(dotenv_path=ENV_PATH, override=True)

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

print(f"Connecting to: {url}")
supabase = create_client(url, key)

tables = ["app_users", "user_club_roles", "club_keys", "activities"]

print("--- Table Counts ---")
for t in tables:
    try:
        resp = supabase.table(t).select("*", count="exact").limit(1).execute()
        print(f"{t}: {resp.count} rows")
        if resp.count > 0:
            print(f"  Sample: {resp.data[0]}")
    except Exception as e:
        print(f"{t}: Error - {e}")

print("--------------------")
