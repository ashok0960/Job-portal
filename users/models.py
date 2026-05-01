from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.conf import settings
from datetime import date


# --------------------------
# Custom User Manager
# --------------------------
class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, role='applicant'):
        if not email:
            raise ValueError('Users must have an email address')

        try:
            validate_email(email)
        except ValidationError:
            raise ValueError('Enter a valid email address')

        user = self.model(username=username, email=self.normalize_email(email), role=role)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password):
        user = self.create_user(username=username, email=email, password=password, role='employer')
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


# --------------------------
# Custom User Model
# --------------------------
class CustomUser(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('applicant', 'Applicant'),
        ('employer', 'Employer'),
    ]

    username = models.CharField(max_length=30, unique=True)
    email = models.EmailField(max_length=255, unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='applicant')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


# --------------------------
# Applicant Profile
# --------------------------
class ApplicantProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    user_image = models.ImageField(upload_to='user_profile/', default='user_default.png')
    user_bio = models.TextField(default='A passionate and result-driven software developer...')
    user_education = models.CharField(max_length=200, default='Bachulor Passout in Computer Science from New Summit College')
    user_cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=7.65)
    work_experience = models.CharField(max_length=200, default='1 year of experience in software development')
    user_resume = models.FileField(upload_to='user_resume/', default='default_resume.pdf')
    user_location = models.CharField(max_length=200, default='State/City')
    user_skills = models.CharField(max_length=500, blank=True, default='python,java,react')

    def get_user_skills(self):
        return [skill.strip() for skill in self.user_skills.split(",") if skill]

    def __str__(self):
        return f"{self.user.username} Profile"


# --------------------------
# Employer Profile
# --------------------------
class EmployerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    employer_image = models.ImageField(upload_to='employerprofile/', default='employer_default.png')
    company_name = models.CharField(max_length=200, default='XYZ Company')
    company_logo = models.ImageField(upload_to='companylogo/', default='company_logo.png')
    company_website_url = models.URLField(blank=True, null=True, default='https://www.example.com')
    company_description = models.TextField(default='We are a growing company dedicated to excellence.')
    company_location = models.CharField(max_length=200)
    employer_email = models.EmailField(default='hr@example.com')
    employer_contact = models.CharField(max_length=15, blank=True, null=True)
    company_startdate = models.DateField(blank=True, null=True, default=date.today)
    company_linkedin = models.URLField(blank=True, null=True, default='https://www.linkedin.com/company/example')
    company_size = models.CharField(max_length=100, blank=True, null=True, default='11-50 employees')

    def __str__(self):
        return f"{self.user.username} Employer"