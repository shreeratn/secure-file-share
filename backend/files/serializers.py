from rest_framework import serializers
from .models import File, UserStorage
from datetime import timedelta, datetime, timezone


class FileSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['id', 'name', 'size', 'extension', 'status', 'expiry_date', 'uploaded_date', 'download_link', 'uploaded_by']

    def get_uploaded_by(self, obj):
        return {
            'id': obj.uploaded_by.id,
            'name': obj.uploaded_by.first_name,
            'email': obj.uploaded_by.email
        }

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

    def create(self, validated_data):
        # Remove expiry_days from validated_data as it's not a model field
        expiry_days = validated_data.pop('expiry_days', 7)
        file_obj = validated_data.pop('file')

        # Create the file instance
        file_instance = File.objects.create(
            name=file_obj.name,
            file=file_obj,
            extension=file_obj.name.split('.')[-1],
            size=file_obj.size,
            uploaded_by=self.context['request'].user,
            status=validated_data.get('status', 'private'),
            expiry_date=datetime.now(timezone.utc) + timedelta(days=expiry_days)
        )

        return file_instance

