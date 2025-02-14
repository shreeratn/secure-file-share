from django.urls import path
from . import views

urlpatterns = [
    path('user-data/', views.get_user_data, name='user-data'),
    path('uploaded-files/', views.get_uploaded_files, name='uploaded-files'),
    path('shared-files/', views.get_shared_files, name='shared-files'),
    path('upload/', views.upload_file, name='upload-file'),
    path('delete/<int:file_id>/', views.delete_file, name='delete-file'),
    path('share/<int:file_id>/', views.share_file, name='share-file'),
]
