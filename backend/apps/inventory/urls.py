from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet, DashboardView

router = DefaultRouter()
router.register(r"items", ItemViewSet, basename="item")
router.register(r"dashboard", DashboardView, basename="dashboard")

urlpatterns = [
    path("", include(router.urls)),
]
