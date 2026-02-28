from rest_framework import serializers
from .models import Item, StockTransaction


class ItemSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    stock_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Item
        fields = [
            "id", "name", "part_number", "company", "company_name",
            "description", "unit", "quantity", "min_stock_level",
            "purchase_price", "selling_price", "is_active",
            "is_low_stock", "stock_value", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ItemDetailSerializer(ItemSerializer):
    recent_transactions = serializers.SerializerMethodField()

    class Meta(ItemSerializer.Meta):
        fields = ItemSerializer.Meta.fields + ["recent_transactions"]

    def get_recent_transactions(self, obj):
        txns = obj.transactions.select_related("performed_by").order_by("-created_at")[:10]
        return StockTransactionSerializer(txns, many=True).data


class StockTransactionSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source="item.name", read_only=True)
    performed_by_name = serializers.CharField(source="performed_by.username", read_only=True)

    class Meta:
        model = StockTransaction
        fields = [
            "id", "item", "item_name", "transaction_type", "quantity",
            "notes", "performed_by", "performed_by_name", "created_at",
        ]
        read_only_fields = ["id", "performed_by", "created_at"]


class AddStockSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)
    notes = serializers.CharField(required=False, allow_blank=True)


class RemoveStockSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_quantity(self, value):
        item = self.context.get("item")
        if item and value > item.quantity:
            raise serializers.ValidationError(
                f"Cannot remove {value} units. Only {item.quantity} available."
            )
        return value
