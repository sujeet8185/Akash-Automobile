from django.contrib import admin
from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ["name", "contact_person", "phone", "city", "is_active", "created_at"]
    list_filter = ["is_active", "city"]
    search_fields = ["name", "contact_person"]
