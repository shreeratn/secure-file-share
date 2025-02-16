from django.urls import path

from . import views

urlpatterns = [
    path('user-data/', views.get_user_data, name='user-data'),
    path('uploaded-files/', views.get_uploaded_files, name='uploaded-files'),
    path('shared-files/', views.get_shared_files, name='shared-files'),
    path('upload/', views.upload_file, name='upload-file'),
    path('delete/<int:file_id>/', views.delete_file, name='delete-file'),
    path('share/<int:file_id>/', views.share_file, name='share-file'),
    path('download/<str:download_link>/', views.download_file, name='download-file'),

    # role requests
    path('role-requests/', views.get_role_requests, name='role-requests'),
    path('request-upgrade/', views.request_role_upgrade, name='request-upgrade'),
    path('approve-upgrade/<int:user_id>/', views.approve_role_upgrade, name='approve-upgrade'),
    path('downgrade-to-guest/<int:user_id>/', views.downgrade_to_guest, name='downgrade-to-guest'),
]
