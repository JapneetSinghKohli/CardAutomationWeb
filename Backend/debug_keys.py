from dashboard.services.supabase_client import supabase

try:
    resp = supabase.table("club_keys").select("*").limit(1).execute()
    if resp.data:
        print("Sample Key Data:", resp.data[0])
        print("Columns:", resp.data[0].keys())
    else:
        print("No keys found in club_keys table.")
except Exception as e:
    print(f"Error fetching keys: {e}")
