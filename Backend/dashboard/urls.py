from django.urls import path
# from .views import dashboard_view, key_management_view, members_view
from .views import  dashboard_view,login_view, clubs_view, members_view,logs_view, request_access, approve_request
# from .views import  get_clubs_users

urlpatterns = [
    # path("api/dashboard/", dashboard_view, name="dashboard_view"),
    # path("api/members/", members_view, name="members_view"),
    # path("api/key-management/", key_management_view, name="key_management_view"),
    
    path("api/dashboard/", dashboard_view, name="dashboard"),
    path("api/login/", login_view, name="login"),   
    path("api/clubs/", clubs_view, name="clubs"),  
    
    path("api/members/", members_view, name="members_view"),

    path('api/logs/',logs_view, name='logs'),  # GET logs
    path('api/request/', request_access, name='request_access'),  # POST new access request
    path('api/request/<int:log_id>/approve/', approve_request, name='approve_request'),  # POST approve/deny
    path('api/request/<int:log_id>/deny/', approve_request, name='deny_request'),  # Same view used, action differs by POST body
]
 
    


