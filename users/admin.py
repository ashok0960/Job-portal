from django.contrib import admin
from .models import *
from django.contrib.auth.admin import UserAdmin

admin.site.site_header = "Gig's Nepal Admin Panel"
admin.site.site_title = "Gig's Nepal Admin"
admin.site.index_title = "Welcome to gig's Nepal Administration"

# Register your models here.
admin.site.register(ApplicantProfile)
admin.site.register(EmployerProfile)
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser

    list_display = ('email', 'username', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('username', 'role')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'role', 'password1', 'password2', 'is_staff', 'is_active'),
        }),
    )

    search_fields = ('email', 'username')
    ordering = ('email',)
