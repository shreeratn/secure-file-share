from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    path("verify-mfa/", views.verify_mfa, name="verify-mfa"),
    path("logout/", views.logout, name="logout"),
]
