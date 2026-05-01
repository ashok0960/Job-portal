from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('applicant-profile/create/',views.ApplicantProfileCreateView.as_view(),name='create-applicant-profile'),
    path('applicant-profile/',views.ApplicantProfileRetrieveUpdateView.as_view(),name='applicant-profile'),
    path('employer-profile/create/',views.EmployerProfileCreateView.as_view(),name='create-employer-profile'),
    path('employer-profile/',views.EmployerProfileRetrieveUpdateView.as_view(),name='employer-profile'),
]
