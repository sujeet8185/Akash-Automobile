from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ["username", "email", "first_name", "last_name", "is_staff", "created_at"]
    fieldsets = UserAdmin.fieldsets + (  # type: ignore
        ("Additional Info", {"fields": ("phone",)}),
    )
