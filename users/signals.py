from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import CustomUser, ApplicantProfile, EmployerProfile

@receiver(post_migrate)
def create_missing_profiles(sender, **kwargs):
    for user in CustomUser.objects.filter(role='applicant'):
        ApplicantProfile.objects.get_or_create(user=user)

    for user in CustomUser.objects.filter(role='employer'):
        EmployerProfile.objects.get_or_create(user=user)
