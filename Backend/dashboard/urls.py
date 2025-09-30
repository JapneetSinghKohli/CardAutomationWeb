from django.urls import path
# from .views import dashboard_view, key_management_view, members_view
from .views import  dashboard_view,login_view, clubs_view
# from .views import  get_clubs_users

urlpatterns = [
    # path("api/dashboard/", dashboard_view, name="dashboard_view"),
    # path("api/members/", members_view, name="members_view"),
    # path("api/key-management/", key_management_view, name="key_management_view"),
    
    path("api/dashboard/", dashboard_view, name="dashboard"),
    path("api/login/", login_view, name="login"),   
    path("api/clubs/", clubs_view, name="clubs"),   
    

]
