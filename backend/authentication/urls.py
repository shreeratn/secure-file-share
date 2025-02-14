from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    path("verify-mfa/", views.verify_mfa, name="verify-mfa"),
    path("logout/", views.logout, name="logout"),
    path("mfa/setup/", views.setup_mfa, name="mfa-setup"),
    path("mfa/verify/", views.verify_mfa_setup, name="mfa-verify"),
    path("users/", views.get_all_users, name="get-all-users"),
    path("users/<int:user_id>/role/", views.update_user_role, name="update-user-role"),
    path("mfa-pending/", views.get_mfa_pending_users, name="mfa-pending")
]
