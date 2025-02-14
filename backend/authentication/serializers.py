from rest_framework import serializers
from .models import User
import re
from django.core.validators import EmailValidator


class UserRegistrationSerializer(serializers.ModelSerializer):
    name = serializers.CharField()  # Add this field
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'name', 'is_mfa_enabled', 'user_type')
        read_only_fields = ('user_type',)

    def validate_email(self, value):
        email_validator = EmailValidator()
        try:
            email_validator(value)
        except:
            raise serializers.ValidationError("Invalid email format")
        return value

    def validate_password(self, value):
        if len(value) < 6 or len(value) > 18:
            raise serializers.ValidationError("Password must be between 6-18 characters")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("Password must contain at least one special character")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one digit")
        return value

    def create(self, validated_data):
        name = validated_data.pop('name')  # Get the name field
        validated_data['first_name'] = name  # Store the name in first_name
        validated_data['last_name'] = ''  # Empty last_name
        validated_data['user_type'] = User.UserType.GUEST
        validated_data['username'] = validated_data['email']
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class MFASerializer(serializers.Serializer):
    code = serializers.CharField()


class UserListSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name')
    member_since = serializers.DateTimeField(source='created_at')

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'user_type', 'is_mfa_enabled', 'member_since')

class UserRoleUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('user_type',)

    def validate_user_type(self, value):
        if value not in [User.UserType.GUEST, User.UserType.REGULAR, User.UserType.ADMIN]:
            raise serializers.ValidationError("Invalid user type")
        return value
