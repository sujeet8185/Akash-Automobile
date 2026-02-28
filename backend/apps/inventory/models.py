from django.db import models
from apps.companies.models import Company


class Item(models.Model):
    UNIT_CHOICES = [
        ("pcs", "Pieces"),
        ("set", "Set"),
        ("ltr", "Litre"),
        ("kg", "Kilogram"),
        ("mtr", "Meter"),
        ("box", "Box"),
    ]

    name = models.CharField(max_length=255)
    part_number = models.CharField(max_length=100, blank=True, null=True)
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, related_name="items")
    description = models.TextField(blank=True, null=True)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default="pcs")
    quantity = models.PositiveIntegerField(default=0)
    min_stock_level = models.PositiveIntegerField(default=5, help_text="Alert when quantity falls below this")
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "items"
        verbose_name = "Item"
        verbose_name_plural = "Items"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.company.name if self.company else 'N/A'})"

    @property
    def is_low_stock(self):
        return self.quantity <= self.min_stock_level

    @property
    def stock_value(self):
        return self.quantity * self.purchase_price


class StockTransaction(models.Model):
    TRANSACTION_TYPE = [
        ("ADD", "Stock Added"),
        ("REMOVE", "Stock Removed / Sold"),
        ("ADJUST", "Adjustment"),
    ]

    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="transactions")
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE)
    quantity = models.PositiveIntegerField()
    notes = models.TextField(blank=True, null=True)
    performed_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, related_name="stock_transactions"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "stock_transactions"
        verbose_name = "Stock Transaction"
        verbose_name_plural = "Stock Transactions"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.transaction_type} - {self.item.name} x{self.quantity}"

    def save(self, *args, **kwargs):
        # Update item quantity on save
        if self.pk is None:  # New transaction
            if self.transaction_type == "ADD":
                Item.objects.filter(pk=self.item_id).update(quantity=models.F("quantity") + self.quantity)
            elif self.transaction_type in ("REMOVE", "ADJUST"):
                item = Item.objects.get(pk=self.item_id)
                new_qty = max(0, item.quantity - self.quantity)
                Item.objects.filter(pk=self.item_id).update(quantity=new_qty)
        super().save(*args, **kwargs)
