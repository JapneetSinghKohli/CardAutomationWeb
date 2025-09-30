from django.http import JsonResponse
from .services.supabase_client import supabase
from django.views.decorators.csrf import csrf_exempt
import json





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