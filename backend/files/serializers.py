from rest_framework import serializers
from .models import File, UserStorage

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'name', 'size', 'extension', 'status', 'expiry_date', 'uploaded_date', 'download_link']

class UserStorageSerializer(serializers.ModelSerializer):
    allocated_storage = serializers.ReadOnlyField()

    class Meta:
        model = UserStorage
        fields = ['used_storage', 'allocated_storage']

class FileUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField()
    expiry_days = serializers.IntegerField(min_value=1, max_value=30, default=7)

    class Meta:
        model = File
        fields = ['file', 'status', 'expiry_days']
