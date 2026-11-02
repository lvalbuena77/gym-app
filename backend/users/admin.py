from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Gym app", {"fields": ("role", "monitor")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Gym app", {"fields": ("role", "monitor")}),
    )
    list_display = ("username", "email", "role", "monitor", "is_active", "is_staff")
    list_filter = ("role", "is_active")
