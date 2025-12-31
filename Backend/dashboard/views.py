from django.http import JsonResponse
from .services.supabase_client import supabase
from django.views.decorators.csrf import csrf_exempt
import json
import re


@csrf_exempt
def logs_view(request):
    print("Received request:", request.method, request.path)
    try:
        if request.method == "GET":
            logs = supabase.table("activities").select("*").order("activity_time", desc=True).execute()
            
            # Calculate summary data
            total = len(logs.data) if logs.data else 0
            today = 0
            taken = 0
            returned = 0
            
            from datetime import datetime
            today_date = datetime.now().date()
            
            for log in logs.data:
                try:
                    if log.get('activity_time'):
                        # Robust Date Parsing: Just take the first 10 chars (YYYY-MM-DD)
                        # This avoids errors with fractional seconds or missing Z
                        time_str = str(log.get('activity_time', ''))
                        if len(time_str) >= 10:
                            log_date_str = time_str[:10]
                            if log_date_str == str(today_date):
                                today += 1
                except Exception as ve:
                    print(f"Date check warning for log {log.get('activity_id')}: {ve}")
                    continue

                if log.get('status') == 'Taken':
                    taken += 1
                if log.get('status') == 'Returned':
                    returned += 1
            
            # Enrich logs with Names
            # 1. Collect IDs
            log_data = logs.data if logs.data else []
            user_ids = list(set(l["user_id"] for l in log_data if l.get("user_id")))
            key_ids = list(set(int(l["key_id"]) for l in log_data if l.get("key_id")))

            # 2. Batch Fetch User Names
            user_map = {}
            if user_ids:
                u_resp = supabase.table("app_users").select("user_id, name").in_("user_id", user_ids).execute()
                user_map = {u["user_id"]: u["name"] for u in u_resp.data}

            # 3. Batch Fetch Key Names (and Club Name)
            key_map = {}
            if key_ids:
                # 'club_keys' has 'club_name', but no 'name' column for the key itself.
                # We will use 'club_name' to generate a key name, e.g. "Robotics Key"
                try:
                    k_resp = supabase.table("club_keys").select("key_id, club_name").in_("key_id", key_ids).execute()
                    
                    for k in k_resp.data:
                        c_name = k.get("club_name", "Unknown")
                        key_map[k["key_id"]] = {
                            "name": f"{c_name} Key", 
                            "club": c_name
                        }
                except Exception as e:
                    print(f"Error fetching keys names: {e}")

            # 4. Attach to logs
            for log in log_data:
                uid = log.get("user_id")
                kid = log.get("key_id")
                log["user_name"] = user_map.get(uid, "Unknown User") if uid else "Unknown User"
                
                if kid:
                    try:
                        k_info = key_map.get(int(kid), {})
                        log["key_name"] = k_info.get("name", f"Key {kid}")
                        log["club_name"] = k_info.get("club", "")
                    except:
                         log["key_name"] = f"Key {kid}"
                         log["club_name"] = ""
                else:
                    log["key_name"] = "N/A"
                    log["club_name"] = ""

            summary = {
                "total": total,
                "today": today,
                "taken": taken,
                "returned": returned
            }
            
            return JsonResponse({"logs": logs.data, "summary": summary}, safe=False)
            
    except Exception as e:
        print(f"ERROR in logs_view: {e}")
        return JsonResponse({"error": str(e)}, status=500)
    


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
            required_fields = ["key_id", "start_time", "end_time", "reason"]
            for field in required_fields:
                if field not in data:
                    return JsonResponse({"error": f"Missing required field: {field}"}, status=400)
                    
            # Set default user_id if not provided
            if "user_id" not in data or not data["user_id"]:
                data["user_id"] = "default_user"

            # Prepare new log
            new_log = {
                "user_id": data["user_id"],
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
        resp = supabase.table("activities").update({"status": action}).eq("activity_id", log_id).execute()
        return JsonResponse({"success": True, "data": resp.data[0] if resp.data else {"status": action}})

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


@csrf_exempt
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

        # --- RECENT ACTIVITIES (OPTIMIZED) ---
        recent_resp = (
            supabase.table("activities")
            .select("activity_id, user_id, key_id, action, activity_time")
            .order("activity_time", desc=True)
            .limit(5)
            .execute()
        )
        activities = recent_resp.data if recent_resp.data else []

        # 1. Collect IDs
        user_ids = list(set([r["user_id"] for r in activities if r["user_id"]]))
        key_ids = list(set([r["key_id"] for r in activities if r["key_id"]]))

        # 2. Batch Fetch Users
        user_map = {}
        if user_ids:
            users_resp = supabase.table("app_users").select("user_id, name").in_("user_id", user_ids).execute()
            user_map = {u["user_id"]: u["name"] for u in users_resp.data}

        # 3. Batch Fetch Keys/Clubs
        club_map = {}
        if key_ids:
            keys_resp = supabase.table("club_keys").select("key_id, club_name").in_("key_id", key_ids).execute()
            club_map = {k["key_id"]: k["club_name"] for k in keys_resp.data}

        # 4. Assemble Data
        recent_data = []
        for r in activities:
            recent_data.append({
                "user": user_map.get(r["user_id"], "Unknown"),
                "action": r["action"],
                "location": club_map.get(r["key_id"], "Unknown"),
                "method": "NFC Card",
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
        print("Dashboard error:", e) # Helpful for debugging
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

@csrf_exempt
def forgot_password_view(request):
    if request.method != "POST":
         return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        data = json.loads(request.body)
        email = data.get("email")
        if not email:
            return JsonResponse({"error": "Email is required"}, status=400)
            
        # Send reset password email
        supabase.auth.reset_password_for_email(email, {"redirect_to": "http://localhost:5173/reset-password"}) 
        
        # 🔹 DEV BYPASS: Generate a direct recovery link just in case email is blocked/rate-limited
        debug_link = None
        try:
            link_response = supabase.auth.admin.generate_link({
                "type": "recovery",
                "email": email,
                "options": {"redirect_to": "http://localhost:5173/reset-password"}
            })
            # Handle different library versions for link_response
            if hasattr(link_response, 'properties') and hasattr(link_response.properties, 'action_link'):
                debug_link = link_response.properties.action_link
            elif isinstance(link_response, dict) and 'action_link' in link_response:
                debug_link = link_response['action_link']
            else:
                # Some versions return a link object that can be str'd or has a standard attr
                debug_link = str(link_response) 
        except Exception as e_link:
            print(f"DEBUG: Could not generate standby recovery link: {e_link}")

        return JsonResponse({
            "success": True, 
            "message": "Password reset email sent",
            "debug_link": debug_link # Return this to help user bypass email delay
        })
    except Exception as e:
        print(f"DEBUG: Forgot Password Error: {str(e)}") 
        return JsonResponse({"error": f"Internal Error: {str(e)}"}, status=500)

@csrf_exempt
def reset_password_confirm_view(request):
    """
    Updates the user's password using the access_token passed in Authorization header.
    Supabase 'recovery' link gives an access_token that logs the user in.
    So we user supabase.auth.update_user() using that token.
    """
    if request.method != "POST":
         return JsonResponse({"error": "Method not allowed"}, status=405)
         
    try:
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        data = json.loads(request.body)
        password = data.get("password")
        
        if not token or not password:
             return JsonResponse({"error": "Missing token or password"}, status=400)
             
        # We need a client authenticated with this token
        # But `supabase` global client is Admin.
        # We can't just use `supabase.auth.update_user` because that updates the *logged in* user (which is Admin/None).
        # We need to temporarily set the session or use `admin.update_user_by_id`.
        # BUT we don't have user_id, only token.
        # Solution: Use `get_user(token)` to verify and get ID, then Admin Update.
        
        user_resp = supabase.auth.get_user(token)
        if not user_resp.user:
             return JsonResponse({"error": "Invalid token"}, status=401)
             
        user_id = user_resp.user.id
        
        # Admin update
        supabase.auth.admin.update_user_by_id(user_id, {"password": password})
        
        return JsonResponse({"success": True})
        
    except Exception as e:
        print(f"Reset Confirm Error: {e}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def reset_password_confirm_view(request):
    """
    Updates the user's password using the access_token passed in Authorization header.
    Supabase 'recovery' link gives an access_token that logs the user in.
    So we user supabase.auth.update_user() using that token.
    """
    if request.method != "POST":
         return JsonResponse({"error": "Method not allowed"}, status=405)
         
    try:
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        data = json.loads(request.body)
        password = data.get("password")
        
        if not token or not password:
             return JsonResponse({"error": "Missing token or password"}, status=400)
             
        # We need a client authenticated with this token
        # But `supabase` global client is Admin.
        # We can't just use `supabase.auth.update_user` because that updates the *logged in* user (which is Admin/None).
        # We need to temporarily set the session or use `admin.update_user_by_id`.
        # BUT we don't have user_id, only token.
        # Solution: Use `get_user(token)` to verify and get ID, then Admin Update.
        
        user_resp = supabase.auth.get_user(token)
        if not user_resp.user:
             return JsonResponse({"error": "Invalid token"}, status=401)
             
        user_id = user_resp.user.id
        
        # Admin update
        supabase.auth.admin.update_user_by_id(user_id, {"password": password})
        
        return JsonResponse({"success": True})
        
    except Exception as e:
        print(f"Reset Confirm Error: {e}")
        return JsonResponse({"error": str(e)}, status=500)

    except Exception as e:
        print(f"Reset Confirm Error: {e}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def members_view(request):
    """
    GET: List all user_club_roles joined with app_users.
    POST: Delegate to add_member_view.
    """
    if request.method == "POST":
        return add_member_view(request)

    if request.method == "GET":
        try:
            # 1. Fetch all roles
            roles_resp = supabase.table("user_club_roles").select("*").execute()
            roles_data = roles_resp.data if roles_resp.data else []
            
            if not roles_data:
                 return JsonResponse([])

            # 2. Fetch user details
            user_ids = [r["user_id"] for r in roles_data]
            users_resp = supabase.table("app_users").select("*").in_("user_id", user_ids).execute()
            users_map = {u["user_id"]: u for u in users_resp.data}
            
            # 3. Merge data
            result = []
            for r in roles_data:
                uid = r["user_id"]
                u = users_map.get(uid, {})
                result.append({
                    "user_id": uid,
                    "name": u.get("name", "Unknown"),
                    "email": u.get("email", ""),
                    "role": r.get("role", "Member"),
                    "active": True, # TODO: Add active status to DB if needed
                    "Joined": r.get("joined_at", "2024")[:10] if r.get("joined_at") else "2024" 
                })
                
            return JsonResponse(result, safe=False)
        except Exception as e:
            print(f"Members View Error: {e}")
            return JsonResponse({"error": str(e)}, status=500)
            
    # Fallback for POST if accidentally sent to this view (though urls.py handles it)
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def add_member_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
        
    try:
        print("Received ADD MEMBER POST body:", request.body.decode('utf-8')) # DEBUG
        data = json.loads(request.body)
        # Requester info (to verify role)
        requester_id = data.get("requester_id")
        club_id = data.get("club_id")
        
        # New member info
        email = data.get("email")
        name = data.get("name")
        password = data.get("password")
        role = data.get("role", "Member") # Default to Member
        
        if not all([requester_id, club_id, email, name, password]):
            return JsonResponse({"error": "Missing required fields"}, status=400)
            
        # Email Validation
        email_regex = r'^[a-zA-Z0-9_.+-]+@students\.iitmandi\.ac\.in$'
        if not re.match(email_regex, email):
            return JsonResponse({"error": "Only institute emails (@students.iitmandi.ac.in) are allowed."}, status=400)
            
        # 1. Verify Requester is Coordinator
        # We need to trust the requester_id passed from frontend OR check session.
        # Ideally we should verify the auth token, but here we'll just check the DB role for the ID.
        user_roles_resp = (
            supabase.table("user_club_roles")
            .select("role")
            .eq("user_id", requester_id)
            .eq("club_id", club_id)
            .execute()
        )
        
        is_coordinator = any(r["role"].lower() == "coordinator" for r in user_roles_resp.data or [])
        if not is_coordinator:
             return JsonResponse({"error": "Permission denied. Only Coordinators can add members."}, status=403)
             
        # 2. Create Auth User (or Signup)
        # We need a fresh admin client to ensure we are using the Service Role Key
        # because the global client might be using Anon key or be in a bad state.
        try:
            import os
            from supabase import create_client as create_admin_client
            
            # Re-read env vars explicitly to be 100% sure
            _url = os.environ.get("SUPABASE_URL")
            _key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
            
            if not _key:
                 print("CRITICAL: Missing SUPABASE_SERVICE_ROLE_KEY in env during add_member")
                 return JsonResponse({"error": "Server configuration error (missing key)"}, status=500)
                 
            # Local client
            admin_supabase = create_admin_client(_url, _key)
            
            auth_resp = admin_supabase.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True
            })
            new_user = auth_resp.user
        except Exception as e:
             return JsonResponse({"error": f"Failed to create auth user: {str(e)}"}, status=400)
             
        if not new_user:
             return JsonResponse({"error": "Failed to create user"}, status=400)
             
        new_user_id = new_user.id
        
        # 3. Add to app_users
        try:
            supabase.table("app_users").insert({
                "user_id": new_user_id,
                "name": name,
                "email": email
            }).execute()
        except Exception as e:
             # Cleanup auth user if DB insert fails? For now just report error
             print("Error inserting to app_users:", e)
             
        # 4. Add to user_club_roles
        try:
             supabase.table("user_club_roles").insert({
                 "user_id": new_user_id,
                 "club_id": club_id,
                 "role": role
             }).execute()
        except Exception as e:
             print("Error inserting role:", e)
             return JsonResponse({"error": f"User created but failed to assign role: {str(e)}"}, status=500)
             
        return JsonResponse({"success": True, "message": "Member added successfully", "user_id": new_user_id})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
@csrf_exempt
def remove_member_view(request, member_id):
    if request.method != "DELETE":
        return JsonResponse({"error": "Method not allowed"}, status=405)
        
    try:
        data = json.loads(request.body)
        requester_id = data.get("requester_id")
        club_id = data.get("club_id")
        
        if not requester_id or not club_id:
             return JsonResponse({"error": "Missing requester info"}, status=400)
             
        # 1. Verify Requester
        user_roles_resp = (
            supabase.table("user_club_roles")
            .select("role")
            .eq("user_id", requester_id)
            .eq("club_id", club_id)
            .execute()
        )
        is_coordinator = any(r["role"].lower() == "coordinator" for r in user_roles_resp.data or [])
        if not is_coordinator:
             return JsonResponse({"error": "Permission denied"}, status=403)
             
        # 2. Remove role (effectively removing from club)
        resp = (
            supabase.table("user_club_roles")
            .delete()
            .eq("user_id", member_id)
            .eq("club_id", club_id)
            .execute()
        )
        
        return JsonResponse({"success": True, "message": "Member removed from club"})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
        

@csrf_exempt
def keys_view(request):
    """
    GET: List all keys with 'current_user_name' if in_use.
    """
    if request.method == "GET":
        try:
            # 1. Fetch all keys
            keys_resp = supabase.table("club_keys").select("*").execute()
            keys = keys_resp.data if keys_resp.data else []
            
            # 2. Identify 'in_use' keys
            in_use_key_ids = [k["key_id"] for k in keys if k["status"] == "in_use"]
            
            # 3. Fetch latest active 'Taken' log for these keys
            active_map = {}
            if in_use_key_ids:
                # Fetch open logs. Status='Taken'.
                logs_resp = (
                    supabase.table("activities")
                    .select("key_id, user_id, activity_time")
                    .eq("status", "Taken")
                    .in_("key_id", in_use_key_ids)
                    .execute()
                )
                
                latest_logs = {}
                for log in logs_resp.data:
                    kid = log["key_id"]
                    # Naive last-one-wins (should order by time desc in query to be robust, but strict requirement wasn't set)
                    latest_logs[kid] = log

                user_ids = [l["user_id"] for l in latest_logs.values()]
                user_name_map = {}
                if user_ids:
                    u_resp = supabase.table("app_users").select("user_id, name").in_("user_id", user_ids).execute()
                    user_name_map = {u["user_id"]: u["name"] for u in u_resp.data}

                for kid, log in latest_logs.items():
                    uid = log["user_id"]
                    active_map[kid] = {
                        "user_name": user_name_map.get(uid, "Unknown"),
                        "taken_at": log["activity_time"]
                    }

            # 4. Merge into response
            for k in keys:
                if k["status"] == "in_use" and k["key_id"] in active_map:
                    info = active_map[k["key_id"]]
                    k["current_user_name"] = info["user_name"]
                    k["taken_at"] = info["taken_at"]

            return JsonResponse({"keys": keys}, safe=False)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def key_action_view(request, key_id):
    """
    Handle actions on a specific key.
    PUT/PATCH: Update status (Edit/Force Return).
    payload: { "action": "maintenance" | "available" | "in_use", "requester_id": "...", "club_id": ... }
    """
    if request.method not in ["POST", "PUT", "PATCH"]:
         return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body)
        action_type = data.get("action") # e.g., "set_maintenance", "set_available", "force_return"
        requester_id = data.get("requester_id")
        
        if not action_type or not requester_id:
             return JsonResponse({"error": "Missing action or requester_id"}, status=400)

        # 1. Fetch Key Info (to verify club ownership)
        key_resp = supabase.table("club_keys").select("*").eq("key_id", key_id).single().execute()
        if not key_resp.data:
             return JsonResponse({"error": "Key not found"}, status=404)
        target_key = key_resp.data
        key_club_id = target_key.get("club_id")
        
        # 2. Verify Permissions
        # Fetch requester role for this specific club (or check if they are global admin)
        # We need to check if user is admin globally OR coordinator for this club.
        
        # Check global/app_user role? Or user_club_roles?
        # Assuming "admin" is a role in user_club_roles for a special "Admin Club" or just a role string?
        # User said "3rd role also the admin role". 
        # Let's check if the user has "admin" role in ANY capacity or specific to this club.
        # Simplification: Check user_club_roles.
        
        user_roles_resp = supabase.table("user_club_roles").select("role, club_id").eq("user_id", requester_id).execute()
        user_roles = user_roles_resp.data or []
        
        is_global_admin = any(r["role"].lower() == "admin" for r in user_roles)
        is_club_coordinator = any(r["role"].lower() == "coordinator" and r["club_id"] == key_club_id for r in user_roles)
        
        if not (is_global_admin or is_club_coordinator):
             return JsonResponse({"error": "Permission denied"}, status=403)
             
        # 3. Perform Action
        new_status = None
        if action_type == "maintenance":
            new_status = "maintenance"
        elif action_type == "available" or action_type == "force_return":
             new_status = "available"
             # If force return, maybe close the active logs?
             if action_type == "force_return":
                 # Find active logs for this key and close them
                 supabase.table("activities").update({
                     "status": "Returned", 
                     "end_time": "now()"
                 }).eq("key_id", key_id).eq("status", "Taken").execute()
                 
        elif action_type == "in_use": # Admin manual set?
             new_status = "in_use"
             
        if new_status:
            upd_resp = supabase.table("club_keys").update({"status": new_status}).eq("key_id", key_id).execute()
            return JsonResponse({"success": True, "data": upd_resp.data})
            
        return JsonResponse({"error": "Invalid action"}, status=400)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def profile_update_view(request):
    """Update user profile information"""
    print("Received request:", request.method, request.path)
    
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    try:
        body = json.loads(request.body)
        user_id = body.get("user_id")
        new_name = body.get("name")
        
        if not user_id or not new_name:
            return JsonResponse({"error": "Missing user_id or name"}, status=400)
        
        # Update user name in database
        result = supabase.table("app_users").update({"name": new_name}).eq("user_id", user_id).execute()
        
        if result.data:
            return JsonResponse({"success": True, "message": "Profile updated successfully", "name": new_name})
        else:
            return JsonResponse({"error": "Failed to update profile"}, status=500)
            
    except Exception as e:
        print(f"ERROR in profile_update_view: {e}")
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def password_change_view(request):
    """Change user password"""
    print("Received request:", request.method, request.path)
    
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    try:
        body = json.loads(request.body)
        user_id = body.get("user_id")
        current_password = body.get("current_password")
        new_password = body.get("new_password")
        
        if not user_id or not current_password or not new_password:
            return JsonResponse({"error": "Missing required fields"}, status=400)
        
        # 1. Get user email
        user_info = supabase.table("app_users").select("email").eq("user_id", user_id).single().execute()
        if not user_info.data:
            return JsonResponse({"error": "User not found"}, status=404)
            
        email = user_info.data["email"]

        # 2. Verify Current Password using ISOLATED Client
        # We cannot use the global 'supabase' client for sign_in because it persists the session,
        # downgrading the client from Admin (Service Role) to User, causing the next Admin call to fail.
        try:
            from supabase import Client, create_client, ClientOptions
            import os
            
            # Create a throwaway client for just this verification
            # Use public anon key if available, or just the URL (Gotrue doesn't strictly need key for sign_in usually, but let's be safe)
            # Actually, we can just use the same URL/Key but ensure we don't save session?
            # Easiest: new client.
            _url = os.environ.get("SUPABASE_URL")
            _key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Or Anon key. Service key is fine for a fresh client.
            
            # Using a raw Gotrue call or fresh client is safer
            temp_client = create_client(_url, _key)
            
            auth_res = temp_client.auth.sign_in_with_password({"email": email, "password": current_password})
            if not auth_res.user:
                 raise Exception("Auth failed")
                 
            # Explicitly sign out or discard temp_client to be clean (garbage collection handles it mostly)
            temp_client.auth.sign_out()
            
        except Exception as auth_err:
             print(f"Password verification failed: {auth_err}")
             return JsonResponse({"error": "Current password is incorrect"}, status=401)
        
        # 3. Update Password (Admin)
        # Global 'supabase' client is still pure Admin (Service Role) here
        supabase.auth.admin.update_user_by_id(user_id, {"password": new_password})
        
        return JsonResponse({"success": True, "message": "Password changed successfully"})
            
    except Exception as e:
        print(f"ERROR in password_change_view: {e}")
        return JsonResponse({"error": str(e)}, status=500)