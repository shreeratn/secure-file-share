from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    path("verify-mfa/", views.verify_mfa, name="verify-mfa"),
    path("logout/", views.logout, name="logout"),
    path("mfa/setup/", views.setup_mfa, name="mfa-setup"),
    path("mfa/verify/", views.verify_mfa_setup, name="mfa-verify"),
]
