from django.urls import path
from .views import (
    home,
    DashboardApiView,
    CreateJobView,
    UpdateJobView,
    DeleteJobView,
    ApplyJobView,
    ApplyjobListView,
    ApplyjobStatusUpdateView,
    ApplyjobDeleteView, 
)

urlpatterns = [
    path('', home, name='home'),
    path('dashboard-api/', DashboardApiView.as_view(), name='dashboard-api'),
    path('create/', CreateJobView.as_view(), name='create-job-api'),
    path('update/<int:pk>/', UpdateJobView.as_view(), name='update-job-api'),
    path('delete/<int:pk>/', DeleteJobView.as_view(), name='delete-job-api'),
    path('apply/', ApplyJobView.as_view(), name='apply-job-api'),
    path('applyjobs/', ApplyjobListView.as_view(), name='applyjobs-list'),
    path(
        'applyjobs/<int:pk>/update_status/',
        ApplyjobStatusUpdateView.as_view(),
        name='applyjob-update-status',
    ),
    path(
        'applyjobs/<int:pk>/',
        ApplyjobDeleteView.as_view(),
        name='applyjob-delete',
    ),
]