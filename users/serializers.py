from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from .models import CustomUser, ApplicantProfile, EmployerProfile
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from django.core.validators import RegexValidator
from django.conf import settings


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id','username','email','role')


class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        required=True,
        min_length=3,
        max_length=30,
        validators=[
            UniqueValidator(queryset=CustomUser.objects.all()),
            RegexValidator(regex=r'^[a-zA-Z0-9_]+$', message='Username should be alphanumeric with letters, digits, underscores only.')
        ]
    )
    email = serializers.EmailField(required=True, validators=[UniqueValidator(queryset=CustomUser.objects.all())])
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'confirm_password', 'role')

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'password': 'Passwords must match'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'applicant')
        )
        return user

User = get_user_model()
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        request = self.context.get('request')
        email = attrs.get('email')
        password = attrs.get('password')

        # Check if email exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "Email does not exist"})

        # Check if password is correct
        user = authenticate(request=request, email=email, password=password)
        if user is None:
            raise serializers.ValidationError({"password": "Password is incorrect"})

        # Check if user is active
        if not user.is_active:
            raise serializers.ValidationError({"detail": "User account is inactive"})

        return user
     


class ApplicantProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    resume_url = serializers.SerializerMethodField()
    profile_pic_url = serializers.SerializerMethodField()
    user_skills_list = serializers.SerializerMethodField()
    user_skills = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = ApplicantProfile
        fields = [
            'username', 'email', 'user_bio', 'user_education', 'user_cgpa',
            'work_experience', 'user_location', 'user_skills', 'user_skills_list',
            'resume_url', 'profile_pic_url'
        ]
        read_only_fields = ['user']

    def get_resume_url(self, obj):
        if obj.user_resume and obj.user_resume.name != 'default_resume.pdf':
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user_resume.url)
            return f"{settings.MEDIA_URL}{obj.user_resume.name}"
        return None

    def get_profile_pic_url(self, obj):
        if obj.user_image and obj.user_image.name != 'user_default.png':
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user_image.url)
            return f"{settings.MEDIA_URL}{obj.user_image.name}"
        return None

    def get_user_skills_list(self, obj):
        return obj.get_user_skills()

    def validate_user_skills(self, value):
        skills = [skill.strip() for skill in value.split(',') if skill.strip()]
        if len(skills) < 3:
            raise serializers.ValidationError("Please provide at least 3 skills")
        return value

    def validate_user_cgpa(self, value):
        if value < 0 or value > 10:
            raise serializers.ValidationError("CGPA must be between 0 and 10")
        return value

    def update(self, instance, validated_data):
        request = self.context.get('request')
        if 'user_skills' in validated_data:
            instance.user_skills = validated_data['user_skills']

        if request and 'user_image' in request.FILES:
            instance.user_image = request.FILES['user_image']
        if request and 'user_resume' in request.FILES:
            instance.user_resume = request.FILES['user_resume']

        for attr, value in validated_data.items():
            if attr != 'user_skills':
                setattr(instance, attr, value)

        instance.save()
        return instance


class EmployerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    employer_image_url = serializers.SerializerMethodField()
    company_logo_url = serializers.SerializerMethodField()

    class Meta:
        model = EmployerProfile
        fields = [
            'username', 'employer_image_url', 'company_logo_url', 'company_name',
            'company_website_url', 'company_description', 'company_location',
            'employer_email', 'employer_contact', 'company_startdate',
            'company_linkedin', 'company_size'
        ]
        read_only_fields = ['user']

    def get_employer_image_url(self, obj):
        if obj.employer_image and obj.employer_image.name != 'employer_default.png':
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.employer_image.url)
            return f"{settings.MEDIA_URL}{obj.employer_image.name}"
        return None

    def get_company_logo_url(self, obj):
        if obj.company_logo and obj.company_logo.name != 'company_logo.png':
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.company_logo.url)
            return f"{settings.MEDIA_URL}{obj.company_logo.name}"
        return None

    def update(self, instance, validated_data):
        request = self.context.get('request')
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if request and 'employer_image' in request.FILES:
            instance.employer_image = request.FILES['employer_image']
        if request and 'company_logo' in request.FILES:
            instance.company_logo = request.FILES['company_logo']

        instance.save()
        return instance