from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Q, F
from .models import Item, StockTransaction
from .serializers import (
    ItemSerializer, ItemDetailSerializer,
    StockTransactionSerializer, AddStockSerializer, RemoveStockSerializer,
)
import django_filters


class ItemFilter(django_filters.FilterSet):
    company = django_filters.NumberFilter(field_name="company__id")
    low_stock = django_filters.BooleanFilter(method="filter_low_stock")
    min_quantity = django_filters.NumberFilter(field_name="quantity", lookup_expr="gte")
    max_quantity = django_filters.NumberFilter(field_name="quantity", lookup_expr="lte")

    class Meta:
        model = Item
        fields = ["company", "is_active", "unit"]

    def filter_low_stock(self, queryset, name, value):
        if value:
            return queryset.filter(quantity__lte=F("min_stock_level"))
        return queryset


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.select_related("company").all()
    serializer_class = ItemSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ItemFilter
    search_fields = ["name", "part_number", "description", "company__name"]
    ordering_fields = ["name", "quantity", "created_at", "purchase_price", "selling_price"]
    ordering = ["name"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ItemDetailSerializer
        return ItemSerializer

    @action(detail=True, methods=["post"], url_path="add-stock")
    def add_stock(self, request, pk=None):
        item = self.get_object()
        serializer = AddStockSerializer(data=request.data)
        if serializer.is_valid():
            txn = StockTransaction.objects.create(
                item=item,
                transaction_type="ADD",
                quantity=serializer.validated_data["quantity"],
                notes=serializer.validated_data.get("notes", ""),
                performed_by=request.user,
            )
            item.refresh_from_db()
            return Response(
                {
                    "detail": f"Added {txn.quantity} units to {item.name}.",
                    "new_quantity": item.quantity,
                    "transaction": StockTransactionSerializer(txn).data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], url_path="remove-stock")
    def remove_stock(self, request, pk=None):
        item = self.get_object()
        serializer = RemoveStockSerializer(data=request.data, context={"item": item})
        if serializer.is_valid():
            txn = StockTransaction.objects.create(
                item=item,
                transaction_type="REMOVE",
                quantity=serializer.validated_data["quantity"],
                notes=serializer.validated_data.get("notes", "Sale / Usage"),
                performed_by=request.user,
            )
            item.refresh_from_db()
            return Response(
                {
                    "detail": f"Removed {txn.quantity} units from {item.name}.",
                    "new_quantity": item.quantity,
                    "transaction": StockTransactionSerializer(txn).data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"], url_path="transactions")
    def transactions(self, request, pk=None):
        item = self.get_object()
        txns = item.transactions.select_related("performed_by").order_by("-created_at")
        serializer = StockTransactionSerializer(txns, many=True)
        return Response(serializer.data)


class DashboardView(viewsets.ViewSet):
    def list(self, request):
        total_items = Item.objects.filter(is_active=True).count()
        low_stock_items = Item.objects.filter(
            is_active=True, quantity__lte=F("min_stock_level")
        ).select_related("company")
        out_of_stock = Item.objects.filter(is_active=True, quantity=0).count()
        total_companies = Item.objects.filter(is_active=True).values("company").distinct().count()

        # Stock value
        stock_value = Item.objects.filter(is_active=True).aggregate(
            total=Sum(F("quantity") * F("purchase_price"))
        )["total"] or 0

        # Items by company
        by_company = (
            Item.objects.filter(is_active=True)
            .values("company__name")
            .annotate(count=Count("id"), total_qty=Sum("quantity"))
            .order_by("-count")[:10]
        )

        # Recent transactions
        recent_txns = StockTransaction.objects.select_related("item", "performed_by").order_by("-created_at")[:10]

        # Low stock alert items
        low_stock_data = ItemSerializer(low_stock_items[:20], many=True).data

        # Monthly stock activity (last 6 months)
        from datetime import datetime, timedelta
        from django.db.models.functions import TruncMonth

        six_months_ago = datetime.now() - timedelta(days=180)
        monthly_activity = (
            StockTransaction.objects.filter(created_at__gte=six_months_ago)
            .annotate(month=TruncMonth("created_at"))
            .values("month", "transaction_type")
            .annotate(total=Sum("quantity"))
            .order_by("month")
        )

        return Response(
            {
                "summary": {
                    "total_items": total_items,
                    "low_stock_count": low_stock_items.count(),
                    "out_of_stock": out_of_stock,
                    "total_companies": total_companies,
                    "total_stock_value": float(stock_value),
                },
                "low_stock_items": low_stock_data,
                "items_by_company": list(by_company),
                "recent_transactions": StockTransactionSerializer(recent_txns, many=True).data,
                "monthly_activity": [
                    {
                        "month": item["month"].strftime("%b %Y") if item["month"] else "",
                        "type": item["transaction_type"],
                        "total": item["total"],
                    }
                    for item in monthly_activity
                ],
            }
        )
