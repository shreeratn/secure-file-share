from django.db import models
from authentication.models import User

class File(models.Model):
    STATUS_CHOICES = (
        ('private', 'Private'),
        ('public', 'Public'),
    )

    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/')
    extension = models.CharField(max_length=10)
    size = models.IntegerField()  # in bytes
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_files')
    uploaded_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='private')
    download_link = models.CharField(max_length=255, null=True, blank=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    shared_with = models.ManyToManyField(User, related_name='shared_files', blank=True)

class UserStorage(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    used_storage = models.BigIntegerField(default=0)  # in bytes

    @property
    def allocated_storage(self):
        if self.user.user_type == 'admin':
            return 50 * 1024 * 1024 * 1024  # 50GB
        elif self.user.user_type == 'regular':
            return 1 * 1024 * 1024 * 1024   # 1GB
        return 500 * 1024 * 1024            # 500MB for guest

class RoleUpgradeRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='role_requests')
    requested_role = models.CharField(max_length=10)
    current_role = models.CharField(max_length=10)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    request_date = models.DateTimeField(auto_now_add=True)
