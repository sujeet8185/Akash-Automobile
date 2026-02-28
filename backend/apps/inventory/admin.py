from django.contrib import admin
from .models import Item, StockTransaction


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ["name", "part_number", "company", "quantity", "unit", "is_active"]
    list_filter = ["company", "is_active", "unit"]
    search_fields = ["name", "part_number"]


@admin.register(StockTransaction)
class StockTransactionAdmin(admin.ModelAdmin):
    list_display = ["item", "transaction_type", "quantity", "performed_by", "created_at"]
    list_filter = ["transaction_type"]
    readonly_fields = ["created_at"]
