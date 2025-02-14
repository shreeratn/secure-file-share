from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import pyotp

from .serializers import UserRegistrationSerializer, LoginSerializer, MFASerializer
from .models import User


@api_view(["POST"])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "message": "User registered successfully",
                "user_id": user.id,
                "token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "isMFAenabled": user.is_mfa_enabled,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = authenticate(
            username=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        if user:
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "token": str(refresh.access_token),
                    "refresh_token": str(refresh),
                    "isMFAenabled": user.is_mfa_enabled,
                }
            )
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def verify_mfa(request):
    serializer = MFASerializer(data=request.data)
    if serializer.is_valid():
        # Implement MFA verification logic here
        return Response({"message": "MFA verified successfully"})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data["refresh_token"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message": "Successfully logged out"})
    except Exception:
        return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({
                "message": "Successfully logged out",
                "status": "success"
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "message": "Refresh token is required",
                "status": "error"
            }, status=status.HTTP_400_BAD_REQUEST)
    except TokenError:
        return Response({
            "message": "Invalid token",
            "status": "error"
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def setup_mfa(request):
    user = request.user
    secret = pyotp.random_base32()
    user.mfa_secret = secret
    user.save()

    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(
        user.email,
        issuer_name="SecureFileShare"
    )

    return Response({
        'qr_code': provisioning_uri,
        'secret': secret
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])


def verify_mfa_setup(request):
    otp = request.data.get('otp')
    user = request.user

    if not otp or not user.mfa_secret:
        return Response({
            'message': 'Invalid OTP or MFA not set up',
            'success': False
        }, status=status.HTTP_400_BAD_REQUEST)

    # Add tolerance window for TOTP verification
    totp = pyotp.TOTP(user.mfa_secret)
    if totp.verify(otp, valid_window=3):  # Allow 1 window before/after
        user.is_mfa_enabled = True
        user.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'MFA enabled successfully',
            'success': True,
            'token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'isMFAenabled': user.is_mfa_enabled
        })

    return Response({
        'message': 'Invalid OTP',
        'success': False
    }, status=status.HTTP_400_BAD_REQUEST)
