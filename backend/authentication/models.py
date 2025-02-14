from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class UserType(models.TextChoices):
        GUEST = 'guest', 'Guest'
        REGULAR = 'regular', 'Regular'
        ADMIN = 'admin', 'Admin'

    email = models.EmailField(unique=True)
    is_mfa_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    mfa_secret = models.CharField(max_length=32, blank=True, null=True)
    user_type = models.CharField(
        max_length=10,
        choices=UserType.choices,
        default=UserType.GUEST
    )


    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
