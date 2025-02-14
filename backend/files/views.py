from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime, timedelta
import uuid

from .models import File, UserStorage
from .serializers import FileSerializer, UserStorageSerializer, FileUploadSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    user = request.user
    storage = UserStorage.objects.get_or_create(user=user)[0]

    data = {
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
    files = File.objects.filter(shared_with=request.user)
    serializer = FileSerializer(files, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file(request):
    if request.user.user_type == 'guest':
        return Response({'error': 'Guests cannot upload files'}, status=status.HTTP_403_FORBIDDEN)

    serializer = FileUploadSerializer(data=request.data)
    if serializer.is_valid():
        file = request.FILES['file']
        max_size = 10485760 if request.user.user_type == 'admin' else 5242880  # 10MB or 5MB

        if file.size > max_size:
            return Response({'error': 'File size exceeds limit'}, status=status.HTTP_400_BAD_REQUEST)

        new_file = serializer.save(
            uploaded_by=request.user,
            name=file.name,
            size=file.size,
            extension=file.name.split('.')[-1],
            expiry_date=datetime.now() + timedelta(days=serializer.validated_data['expiry_days'])
        )

        if new_file.status == 'public':
            new_file.download_link = str(uuid.uuid4())
            new_file.save()

        return Response(FileSerializer(new_file).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_file(request, file_id):
    try:
        file = File.objects.get(id=file_id, uploaded_by=request.user)
        file.delete()
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
