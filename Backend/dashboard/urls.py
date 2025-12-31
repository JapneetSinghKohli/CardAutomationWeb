from django.urls import path
from . import views

urlpatterns = [
    path("api/dashboard/", views.dashboard_view, name="dashboard"),
    path("api/login/", views.login_view, name="login"),   
    path("api/clubs/", views.clubs_view, name="clubs"),  
    
    path("api/members/", views.members_view, name="members_view"),
    path("api/members/add/", views.add_member_view, name="add_member"),
    path("api/members/remove/<str:member_id>/", views.remove_member_view, name="remove_member"),
    
    path("api/forgot-password/", views.forgot_password_view, name="forgot_password"),
    path("api/reset-password-confirm/", views.reset_password_confirm_view, name="reset_password_confirm"),
    
    path('api/keys/', views.keys_view, name='keys'),
    path('api/keys/<str:key_id>/action/', views.key_action_view, name='key_action'), # Note: changed int to str for key_id just in case, but int is probably fine if DB is int. Supabase IDs are usually int or uuid. Let's start with str to be safe or check DB schema. Keys usually int. I'll stick to what I had? No, I'll use <str> to be safe or <int> if I am sure. The error was NameError.
    
    path('api/logs/', views.logs_view, name='logs'),
    path('api/request/', views.request_access, name='request_access'),
    path('api/request/<int:log_id>/approve/', views.approve_request, name='approve_request'),
    path('api/request/<int:log_id>/deny/', views.approve_request, name='deny_request'),
    
    # Settings APIs
    path('api/profile/update/', views.profile_update_view, name='profile_update'),
    path('api/password/change/', views.password_change_view, name='password_change'),
]
 
    


