from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            "id", "name", "contact_person", "phone", "email",
            "address", "city", "state", "gst_number", "is_active",
            "item_count", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_item_count(self, obj):
        return obj.items.count()


class CompanyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for dropdowns."""
    class Meta:
        model = Company
        fields = ["id", "name"]
