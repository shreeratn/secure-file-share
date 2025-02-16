import logging
import uuid
from datetime import datetime, timezone

from authentication.models import User  # Add this import
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import File, UserStorage, RoleUpgradeRequest
from .serializers import FileSerializer, FileUploadSerializer, RoleUpgradeRequestSerializer

logger = logging.getLogger('files')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    user = request.user
    storage = UserStorage.objects.get_or_create(user=user)[0]

    data = {
        'name': user.first_name,
        'total_files_shared': File.objects.filter(uploaded_by=user).count(),
        'used_storage': storage.used_storage,
        'allocated_storage': storage.allocated_storage,
        'current_role': user.user_type,
    }

    if user.user_type == 'admin':
        data.update({
            'incomplete_mfa': User.objects.filter(is_mfa_enabled=False).count(),
            'encryption_health': 100,  # Placeholder
            'failed_decryption_alerts': 0  # Placeholder
        })

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_uploaded_files(request):
    files = File.objects.filter(uploaded_by=request.user)
    serializer = FileSerializer(files, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_shared_files(request):
    files = File.objects.filter(shared_with=request.user).select_related('uploaded_by')
    serializer = FileSerializer(files, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file(request):
    print("=== Upload File View Started ===")
    logger.error("=== Upload File View Started ===")

    # Check if user is guest
    if request.user.user_type == User.UserType.GUEST:
        return Response({
            'error': 'Guests cannot upload files'
        }, status=status.HTTP_403_FORBIDDEN)

    print(f"Request Data: {request.data}")
    logger.error(f"Request Data: {request.data}")

    serializer = FileUploadSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        file = request.FILES['file']
        print(f"File name: {file.name}, Size: {file.size}")
        logger.error(f"File name: {file.name}, Size: {file.size}")

        # Size checks...
        max_size = 10485760 if request.user.user_type == User.UserType.ADMIN else 5242880
        if file.size > max_size:
            return Response({
                'error': f'File size exceeds limit. Maximum size allowed is {max_size / 1048576}MB'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Storage checks...
        storage = UserStorage.objects.get_or_create(user=request.user)[0]
        if storage.used_storage + file.size > storage.allocated_storage:
            return Response({
                'error': 'Storage limit exceeded'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Use serializer's create method instead of direct File.objects.create
            new_file = serializer.save()

            # Update storage
            storage.used_storage += file.size
            storage.save()

            print("=== File Upload Successful ===")
            logger.error("=== File Upload Successful ===")

            return Response(
                FileSerializer(new_file).data,
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            print(f"Error uploading file: {str(e)}")
            logger.error(f"Error uploading file: {str(e)}")
            return Response({
                'error': f'Error uploading file: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    print(f"Serializer errors: {serializer.errors}")
    logger.error(f"Serializer errors: {serializer.errors}")
    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_file(request, file_id):
    try:
        file = File.objects.get(id=file_id, uploaded_by=request.user)
        file_size = file.size
        file.delete()

        # Update user's storage usage
        storage = UserStorage.objects.get(user=request.user)
        storage.used_storage -= file_size
        storage.save()

        return Response({'message': 'File deleted successfully'})
    except File.DoesNotExist:
        return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_file(request, file_id):
    try:
        file = File.objects.get(id=file_id, uploaded_by=request.user)
        emails = request.data.get('emails', [])

        for email in emails:
            try:
                user = User.objects.get(email=email)
                file.shared_with.add(user)
            except User.DoesNotExist:
                pass

        file.status = 'public'
        file.download_link = str(uuid.uuid4())
        file.save()

        return Response(FileSerializer(file).data)
    except File.DoesNotExist:
        return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)


from django.http import FileResponse
import mimetypes


@api_view(['GET'])
def download_file(request, download_link):
    try:
        file = File.objects.get(download_link=download_link)

        # Check expiry
        if file.expiry_date and file.expiry_date < datetime.now(timezone.utc):
            return Response({'error': 'File has expired'}, status=status.HTTP_410_GONE)

        # Get file path and determine content type
        file_path = file.file.path
        content_type, _ = mimetypes.guess_type(file_path)
        if not content_type:
            content_type = 'application/octet-stream'

        # Create response
        response = FileResponse(open(file_path, 'rb'), content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{file.name}"'

        return response

    except File.DoesNotExist:
        return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)


# Role requests
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_role_requests(request):
    # Only admins can view role requests
    if request.user.user_type != User.UserType.ADMIN:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    requests = RoleUpgradeRequest.objects.filter(status='pending')
    serializer = RoleUpgradeRequestSerializer(requests, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_role_upgrade(request):
    current_role = request.user.user_type

    # Determine next role
    if current_role == User.UserType.GUEST:
        requested_role = User.UserType.REGULAR
    elif current_role == User.UserType.REGULAR:
        requested_role = User.UserType.ADMIN
    else:
        return Response({'error': 'Already at highest role'}, status=status.HTTP_400_BAD_REQUEST)

    # Check for existing pending request
    existing_request = RoleUpgradeRequest.objects.filter(
        user=request.user,
        status='pending'
    ).exists()

    if existing_request:
        return Response({'error': 'Pending request already exists'}, status=status.HTTP_400_BAD_REQUEST)

    # Create new request
    RoleUpgradeRequest.objects.create(
        user=request.user,
        current_role=current_role,
        requested_role=requested_role
    )

    return Response({'message': f'Upgrade request to {requested_role} submitted successfully'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_role_upgrade(request, user_id):
    if request.user.user_type != User.UserType.ADMIN:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    try:
        role_request = RoleUpgradeRequest.objects.get(
            user_id=user_id,
            status='pending'
        )

        # Update user's role
        user = role_request.user
        user.user_type = role_request.requested_role
        user.save()

        # Update request status
        role_request.status = 'approved'
        role_request.save()

        return Response({'message': 'Role upgrade approved successfully'})
    except RoleUpgradeRequest.DoesNotExist:
        return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def downgrade_to_guest(request, user_id):
    if request.user.user_type != User.UserType.ADMIN:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = User.objects.get(id=user_id)
        if user.user_type == User.UserType.ADMIN:
            return Response({'error': 'Cannot downgrade admin users'}, status=status.HTTP_400_BAD_REQUEST)

        user.user_type = User.UserType.GUEST
        user.save()

        # Cancel any pending upgrade requests
        RoleUpgradeRequest.objects.filter(user=user, status='pending').update(status='rejected')

        return Response({'message': 'User downgraded to guest successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
