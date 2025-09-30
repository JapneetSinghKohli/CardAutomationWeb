from django.http import JsonResponse
from .services.supabase_client import supabase
from django.views.decorators.csrf import csrf_exempt
import json


@csrf_exempt
def logs_view(request):
    print("Received request:", request.method, request.path)
    if request.method == "GET":
        logs = supabase.table("activities").select("*").order("activity_time", desc=True).execute()
        return JsonResponse(logs.data, safe=False)
    


@csrf_exempt
def request_access(request):
    print("Received request:", request.method, request.path)

    # Optional: handle GET for browser debugging
    if request.method == "GET":
        return JsonResponse({"message":"Use POST to submit access requests"}, status=200)

    if request.method == "POST":
        try:
            print("Raw request body:", request.body)
            data = json.loads(request.body)

            # Required fields
            required_fields = ["user_id", "key_id", "start_time", "end_time", "reason"]
            for field in required_fields:
                if field not in data:
                    return JsonResponse({"error": f"Missing required field: {field}"}, status=400)

            # Prepare new log
            new_log = {
                "key_id": data["key_id"],
                "status": "Requested",
                "start_time": data["start_time"],
                "end_time": data["end_time"],
                "reason": data["reason"]
            }

            # Insert into Supabase
            try:
                resp = supabase.table("activities").insert(new_log).execute()
                print("Supabase insert response:", resp)
            except Exception as e:
                print("Supabase insert error:", e)
                return JsonResponse({"success": False, "error": str(e)}, status=500)

            if resp.data:
                return JsonResponse({"success": True, "data": resp.data[0]}, status=201)
            else:
                return JsonResponse({"success": False, "error": "Insert failed"}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            print(f"Unexpected error: {e}")
            return JsonResponse({"error": str(e)}, status=500)

    # Method not allowed
    return JsonResponse({"error": "Method not allowed, POST required"}, status=405)

@csrf_exempt
def approve_request(request, log_id):
    if request.method == "POST":
        action = json.loads(request.body).get("action")  # "Approved" or "Denied"
        resp = supabase.table("activities").update({"status": action}).eq("id", log_id).execute()
        return JsonResponse({"success": True, "data": resp.data[0]})

@csrf_exempt
def members_view(request):
    """
    Returns members of clubs.
    GET: Returns all members of all clubs.
    POST: Returns all members of all clubs the user belongs to.
          Expects JSON: { "user_id": "<logged_in_user_id>" }
    """

    try:
        if request.method == "GET":
            # Return all members from all clubs
            roles_resp = (
                supabase.table("user_club_roles")
                .select("user_id, club_id, role")
                .execute()
            )
            roles_data = roles_resp.data
            
            user_ids = [r["user_id"] for r in roles_data]            
            users_resp = (
                supabase.table("app_users")
                .select("user_id, name, email")
                .in_("user_id", user_ids)
                .execute()
            )
            user_map = {u["user_id"]: u for u in users_resp.data} if users_resp.data else {}

            members = [
                {
                    "user_id": r["user_id"],
                    "name": user_map.get(r["user_id"], {}).get("name", "Unknown"),
                    "email": user_map.get(r["user_id"], {}).get("email", "unknown"),
                    "role": r["role"],
                    "club_id": r["club_id"],
                    "active": True,
                    "Joined": "2024",
                }
                for r in roles_data
            ]
            return JsonResponse(members, safe=False)

        elif request.method == "POST":
            data = json.loads(request.body)
            user_id = data.get("user_id")
            if not user_id:
                return JsonResponse({"error": "Missing user_id"}, status=400)

            # Step 1: Find all clubs the user belongs to
            user_clubs_resp = (
                supabase.table("user_club_roles")
                .select("club_id")
                .eq("user_id", user_id)
                .execute()
            )
            user_club_ids = [club["club_id"] for club in (user_clubs_resp.data or [])]
            if not user_club_ids:
                return JsonResponse({"members": []})  # User belongs to no clubs

            # Step 2: Fetch all members for all those clubs
            roles_resp = (
                supabase.table("user_club_roles")
                .select("user_id, club_id, role")
                .in_("club_id", user_club_ids)
                .execute()
            )
            roles_data = roles_resp.data or []

            # Step 3: Get unique user_ids from roles_data
            user_ids = list(set(r["user_id"] for r in roles_data))

            # Step 4: Fetch user info from app_users
            users_resp = (
                supabase.table("app_users")
                .select("user_id, name, email")
                .in_("user_id", user_ids)
                .execute()
            )
            user_map = {u["user_id"]: u for u in users_resp.data} if users_resp.data else {}

            # Prepare final members list
            members = [
                {
                    "user_id": r["user_id"],
                    "name": user_map.get(r["user_id"], {}).get("name", "Unknown"),
                    "email": user_map.get(r["user_id"], {}).get("email", "unknown"),
                    "role": r["role"],
                    "club_id": r["club_id"],
                    "active": True,
                    "Joined": "2024",
                }
                for r in roles_data
            ]
            return JsonResponse(members, safe=False)

        else:
            return JsonResponse({"error": "Method not allowed"}, status=405)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def login_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")
        club_id = data.get("club_id")
        role = data.get("role")

        if not all([email, password, club_id, role]):
            return JsonResponse({"error": "Missing required fields"}, status=400)

        # -------------------------------
        # 1️⃣ Authenticate user with Supabase Auth
        # -------------------------------
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if auth_response.user is None:
            return JsonResponse({"success": False, "message": "Invalid email or password"}, status=401)

        user_id = auth_response.user.id  # UUID from Supabase Auth
        user_email = auth_response.user.email  # Email from Supabase Auth

        # -------------------------------
        # 2️⃣ Verify club + role
        # -------------------------------
        club_id = int(club_id)  # Ensure type matches DB

        user_roles_resp = (
            supabase.table("user_club_roles")
            .select("club_id, role")
            .eq("user_id", user_id)
            .execute()
        )

        if not user_roles_resp.data:
            return JsonResponse({"success": False, "message": "User has no assigned roles"}, status=403)

        has_role = any(
            r["club_id"] == club_id and r["role"].lower() == role.lower()
            for r in user_roles_resp.data
        )

        if not has_role:
            return JsonResponse({"success": False, "message": "User does not belong to this club/role"}, status=403)

        # -------------------------------
        # 3️⃣ Fetch additional user info (name) from app_users
        # -------------------------------
        user_info_resp = supabase.table("app_users").select("name").eq("user_id", user_id).single().execute()
        user_info = user_info_resp.data or {}

        # -------------------------------
        # 4️⃣ Return success response
        # -------------------------------
        return JsonResponse({
            "success": True,
            "user": {
                "id": user_id,
                "name": user_info.get("name"),
                "email": user_email,
                "club_id": club_id,
                "role": role
            }
        })

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


def dashboard_view(request):
    try:
        # --- KEYS ---
        keys_resp = supabase.table("club_keys").select("*").execute()
        keys = keys_resp.data

        total = len(keys)
        available = sum(1 for k in keys if k["status"] == "available")
        in_use = sum(1 for k in keys if k["status"] == "in_use")
        maintenance = sum(1 for k in keys if k["status"] == "maintenance")

        key_status = {k["club_name"]: k["status"] for k in keys}

        # --- RECENT ACTIVITIES ---
        recent_resp = (
            supabase.table("activities")
            .select("activity_id, user_id, key_id, action, activity_time")
            .order("activity_time", desc=True)
            .limit(5)
            .execute()
        )

        recent_data = []
        for r in recent_resp.data:
            # Fetch user
            user_resp = supabase.table("app_users").select("name").eq("user_id", r["user_id"]).execute()
            user_name = user_resp.data[0]["name"] if user_resp.data else "Unknown"

            # Fetch club
            club_resp = supabase.table("club_keys").select("club_name").eq("key_id", r["key_id"]).execute()
            club_name = club_resp.data[0]["club_name"] if club_resp.data else "Unknown"

            # Format
            recent_data.append({
                "user": user_name,
                "action": r["action"],
                "location": club_name,
                "method": "NFC Card",   # placeholder for now
                "time": r["activity_time"],
            })

        return JsonResponse({
            "key": {
                "total": total,
                "available": available,
                "in_use": in_use,
                "maintenance": maintenance
            },
            "key_status": key_status,
            "recent_activity": recent_data,
            "keys": keys,
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def clubs_view(request):
    try:
        resp = supabase.table("clubs").select("club_id, club_name").execute()
        clubs = resp.data
        return JsonResponse({"clubs": clubs})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
# def dashboard_view(request):
#     try:
#         response = supabase.rpc("get_dashboard_for_owner", {"p_owner_id": 1}).execute()
#         # response.data contains the result
#         return JsonResponse(response.data, safe=False)
#     except Exception as e:
#         # If there’s an RPC/database error, catch it
#         return JsonResponse({"error": str(e)}, status=500)



# def members_view(request):
#     try:
#         response = supabase.rpc("get_members_for_owner", {"p_owner_id": 1}).execute()
#         return JsonResponse(response.data, safe=False)
#     except Exception as e:
#         return JsonResponse({"error": str(e)}, status=500)
    


# def key_management_view(request):
#     try:
#         response = supabase.rpc("get_key_management_for_owner", {"p_owner_id": 1}).execute()
#         return JsonResponse(response.data, safe=False)
#     except Exception as e:
#         return JsonResponse({"error": str(e)}, status=500)




# @csrf_exempt
# def remove_member(request, member_id):
    
#     if request.method == "DELETE":
#         try:
#             # delete from supabase devices table
#             response = supabase.table("devices").delete().eq("id", member_id).execute()
            
#             if response.data == []:
#                 return JsonResponse({"error": "Member not found"}, status=404)

#             return JsonResponse({"success": True, "deleted": response.data})
#         except Exception as e:
#             return JsonResponse({"error": str(e)}, status=500)

#     return JsonResponse({"error": "Method not allowed"}, status=405)